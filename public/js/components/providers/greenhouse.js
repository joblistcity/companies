import JobItem from '../job/item.js'

/*
	 docs:
	 - https://developers.greenhouse.io/job-board.html
 */

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
		}
	</style>
	<div class="Component"></div>
`

class ListJobsGreenhouse extends HTMLElement {
	/* what whe need as attribute when instantiating */
	initialAttributes = ['hostname', 'country', 'city']

	/* internal state */
	model = []

	/* props to state */
	setInitialAttributes = () => {
		const values = this.initialAttributes.map(attr => this.getAttribute(attr))
		const allAttrSet = values.filter(Boolean).length === this.initialAttributes.length

		if (allAttrSet) {
			this.initialAttributes.forEach(attr => {
				this[attr] = this.getAttribute(attr)
			})
		} else {
			console.log('Missing required attributes', this.initialAttributes)
		}
	}

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.setInitialAttributes()
		this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
		const url = `https://boards-api.greenhouse.io/v1/boards/${this.hostname}/jobs?content=true`
		fetch(url).then(res => {
			return res.json()
		}).then(data => {
			let search = ''
			if (this.city) {
				search = this.city
			} else {
				search = this.country
			}
			search = search.toLowerCase()

			this.model = data.jobs.filter(item => {
				const s = item.offices.map(office => {
					return `${office.name} ${office.location}`.toLowerCase()
				}).join(' ')
				return s.indexOf(search) > -1
			})
		}).then(() => {
			this.render()
		})
	}

	render() {
		const $component = this.shadowRoot.querySelector('.Component')
		this.model.forEach(({title, absolute_url}) => {
			if (!title || !absolute_url) return
			let newJobItem = document.createElement('job-item')
			newJobItem.setAttribute('title', title)
			newJobItem.setAttribute('url', absolute_url)

			newJobItem.innerHTML = title
			$component.append(newJobItem)
		})
	}
}

customElements.define('list-jobs-greenhouse', ListJobsGreenhouse)

export default ListJobsGreenhouse

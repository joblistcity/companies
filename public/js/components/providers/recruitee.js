import JobItem from '../job/item.js'

/*
	 docs:
	 - https://careers.recruitee.com/docs
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

class ListJobsRecruitee extends HTMLElement {
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
		const url = `https://${this.hostname}.recruitee.com/api/offers`
		fetch(url).then(res => {
			return res.json()
		}).then(data => {
			this.model = data.offers.filter(item => {
				return this.country === item.country.toLowerCase() &&
							 this.city === item.city.toLowerCase() &&
						 	 item.status === 'published'
			})
		}).then(() => {
			this.render()
		})
	}

	render() {
		const $component = this.shadowRoot.querySelector('.Component')
		const model = this.model

		model.forEach(item => {
			if (!item.title || !item.careers_url) return
			let newJobItem = document.createElement('job-item')
			newJobItem.setAttribute('title', item.title)
			newJobItem.setAttribute('url', item.careers_url)

			if (item.careers_apply_url) newJobItem.setAttribute('apply-url', item.careers_apply_url)
			if (item.employment_type_code) newJobItem.setAttribute('employment-type', item.employment_type_code)
			if (item.category_code) newJobItem.setAttribute('category', item.category_code)
			if (item.department) newJobItem.setAttribute('department', item.department)

			/* these two contain html */
			/* newJobItem.setAttribute('description', item.description)
				 newJobItem.setAttribute('requirements', item.requirements) */

			newJobItem.innerHTML = item.title
			$component.append(newJobItem)
		})
	}
}

customElements.define('list-jobs-recruitee', ListJobsRecruitee)

export default ListJobsRecruitee

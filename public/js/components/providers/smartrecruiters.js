import JobItem from '../job/item.js'

/*
	 docs:
	 - https://dev.smartrecruiters.com/customer-api/posting-api/endpoints/postings/

	 - https://jobs.smartrecruiters.com/sr-jobs/company-lookup?q=a
	 - https://api.smartrecruiters.com/v1/companies/Mitie/postings
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

class ListJobsSmartrecruiters extends HTMLElement {
	/* what whe need as attribute when instantiating */
	initialAttributes = ['hostname', 'country', 'city']

	/* internal state */
	model = []
	baseUrl = 'https://api.smartrecruiters.com/v1/companies'
	jobPostingBaseUrl = `https://jobs.smartrecruiters.com`

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
		/* wants city with fist letter upercase */
		const city = this.city.charAt(0).toUpperCase() + this.city.slice(1)
		const url = `${this.baseUrl}/${this.hostname}/postings?city=${city}`
		fetch(url).then(res => {
			return res.json()
		}).then(data => {
			this.model = data.content
		}).then(() => {
			this.render()
		})
	}

	render() {
		const $component = this.shadowRoot.querySelector('.Component')
		const model = this.model

		if (model.length) {
			model.forEach(item => {
				if (!item.name) return
				let newJobItem = document.createElement('job-item')
				newJobItem.setAttribute('title', item.name)
				newJobItem.setAttribute('url', `${this.jobPostingBaseUrl}/${this.hostname}/${item.id}`)

				newJobItem.innerHTML = item.title
				$component.append(newJobItem)
			})
		} else {
			let noJob = document.createElement('p')
			noJob.innerHTML = `There are no job on the board for ${this.city}.`
			$component.append(noJob)
		}
	}
}

customElements.define('list-jobs-smartrecruiters', ListJobsSmartrecruiters)

export default ListJobsSmartrecruiters

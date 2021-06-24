/*
	 docs:
	 - https://workable.readme.io/docs/jobs
 */

const template = document.createElement('template')

class ListJobsWorkable extends HTMLElement {
	initialAttributes = ['hostname']
	language = 'en'

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.setInitialAttributes()
  }

  connectedCallback() {
		fetch(`https://${this.hostname}.workable.com/spi/v3/jobs?state=published`)
			.then((data) => {
				console.log(data.json())
			}).catch(e => {
				console.log('error', e)
			})
	}

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
}

customElements.define('list-jobs-workable', ListJobsWorkable)

export default ListJobsWorkable

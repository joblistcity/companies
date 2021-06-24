import DefaultProvider from './default.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
		}
	</style>
	<div class="Component"></div>
`

class DefaultProvider extends HTMLElement {
	/* what whe need as attribute when instantiating */
	initialAttributes = []
	optionalAttributes = []

	/* props to state */
	setInitialAttributes = () => {
		const allAttributes = [...this.initialAttributes, ...this.optionalAttributes]
		const attributes = {}
		allAttributes.forEach(item => {
			const val = this.getAttribute(item)
			if (val) attributes[item] = val
		})

		const allAttrSet = this.initialAttributes.filter(item => attributes[item])
		if (allAttrSet) {
			Object.entries(allAttributes).forEach(entry => {
				const val = this.getAttribute(entry[1])
				if (val) this[entry[1]] = val
			})
		} else {
			console.log('Missing required attributes', this.initialAttributes)
		}
	}

	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.setInitialAttributes()
		this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
		console.log('recruitee fetch')
		this.url = this.buildProviderUrl(this.hostname)
		fetch(this.url).then(res => {
			return this.serializeResponse(res)
		}).then(data => {
			this.model = this.serializeData(data)
		}).then(() => {
			this.render()
		})
	}

	$compoenent = this.shadowRoot.querySelector('.Component')
	/* internal state */
	model = []

	/* methods to be publicly used */
	buildProviderUrl = (hostname) => {
		return `https://${hostname}.example.com/api/jobs`
	}
	serializeResponse = (res = {}) => {
		return res.json()
	}
	serializeData = (data = []) => {
		return data
	}
	render() {
		const $component = this.$component
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

export default DefaultProvider

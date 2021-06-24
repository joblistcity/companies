import {find} from '../../utils/provider-url-parser.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
			display: flex;
		}
	</style>
	<div class="Component"></div>
`

const providersList =  {
	'recruitee.com': 'recruitee',
	'greenhouse.io': 'greenhouse',
	'workable.com': 'workable',
	'bamboohr.com': 'bamboohr',
	'bamboohr.co.uk': 'bamboohr',
	'personio.de': 'personio'
}

const providerMethods = {
  recruitee: (url) => {
		let pregex = /(\w+)(?:\.recruitee\.com)/g
		let result = pregex.exec(url)
		if (!result) {
			console.info('Could not find id from Workable URL')
		}
		return result[1]
	},
  greenhouse: (url) => {
		let pregex = /(?:boards\.greenhouse\.io\/)(\w+)/g
		let result = pregex.exec(url)
		if (!result) {
			console.info('Could not find id from Greenhouse URL')
			return
		}
		return result[1]
	},
  workable: (url) => {
		console.log('recruitee', url)
	},
  bamboohr: (url) => {
		console.log('bamboohr', url)
	},
  personio: (url) => {
		let pregex = /([\w-]+)(?:-jobs\.personio\.de)/g
		let result = pregex.exec(url)
		if (!result) {
			console.info('Could not find id from Personio URL')
			return
		}
		return result[1]
	}
}

class ListJobs extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.url = this.getAttribute('url')
		this.country = this.getAttribute('country')
		this.city = this.getAttribute('city')
		this.hostname = this.getAttribute('hostname')
		this.provider = this.getAttribute('provider')
	  this.closed = this.getAttribute('closed')
	}
	connectedCallback() {
		let {provider, hostname} = this
		if (provider && hostname) {
			this.provider = provider
			this.hostname = hostname
		} else {
			let result = find(this.url, providersList, providerMethods)
			this.provider = result.provider
			this.hostname = result.id
		}
		this.render()
	}
	render() {
		const $component = this.shadowRoot.querySelector('.Component')

		const componentName = `list-jobs-${this.provider}`
		let component = document.createElement(componentName)
		component.setAttribute('minimized', this.minimized)
		component.setAttribute('hostname', this.hostname)
		component.setAttribute('country', this.country)
		component.setAttribute('city', this.city)
		$component.append(component)
	}
}

customElements.define('list-jobs', ListJobs)

export default ListJobs

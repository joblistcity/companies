const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
		}
	</style>
	<div class="Component"></div>
`

class DefaultComponent extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		console.log('connected render default component')
	}

	/* internal state */
	$component = undefined

	/* methods to be publicly used */
	render() {

	}
}

/* here as example; how to define a custom-element web component */
customElements.define('default-component', DefaultComponent)

export default DefaultComponent

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
			font-size: 1rem;
		}
	</style>
	<div class="Component"></div>
`

class JobBody extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({
			mode: 'open'
		})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
	}

	connectedCallback() {
		this.body = this.getAttribute('body') || ''
		this.render()
	}
	render() {
		const $component = this.shadowRoot.querySelector('.Component')

		let jobContent = document.createElement('main')
		jobContent.innerText = this.body
		$component.append(jobContent)
	}
}

customElements.define('job-body', JobBody)

export default JobBody

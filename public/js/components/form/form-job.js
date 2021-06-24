const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
			--color-input-invalid: blue;
		}
		:host {
			box-sizing: border-box;
		}
		*, *:before, *:after {
			box-sizing: inherit;
		}
		p {
			margin-top: 0;
		}
		form {
			display: flex;
			flex-direction: column;
		}
		input {
			box-shadow: none;
			margin-bottom: 1rem;
			padding: 0.4rem 0.6rem;
			font-size: 1rem;
		}
		button {
			padding: 0.2rem 0.1rem;
			font-size: 1rem;
			cursor: pointer;
		}

		input,
		textarea {
			padding: 0.5rem;
			margin-bottom: 1rem;
			font-size: 1rem;
			width: 100%;
			flex-grow: 1;
			display: flex;
		}
		textarea {
			font-weight: normal;
			padding-left: 1rem;
			padding-right: 1rem;
			min-height: 25vh;
			width: 100%;
			max-width: 100%;
			min-width: 100%;
		}
	</style>
	<div class="Component"></div>
`

class FormJob extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		this.submitText = this.getAttribute('submit-text') || 'Submit'
		this.submitting = this.getAttribute('submiting') || false

		this.id = this.getAttribute('job-id') || ''
		this.title = this.getAttribute('title') || ''
		this.url = this.getAttribute('url') || ''
		this.body = this.getAttribute('body') || ''

		this.render()
	}

	/* attributeChangedCallback = (name, oldValue, newValue) => {
		 this[name] = newValue
		 console.log(newValue)
		 this.render()
		 } */

	handleSubmit = async () => {
		let data  = {
			id: this.id,
			title: this.title,
			url: this.url,
			body: this.body
		}
		const event = new CustomEvent('jobChanged', {
			bubbles: true,
			detail: data
		})
		this.dispatchEvent(event)
	}

	handleInputChange = (event) => {
		event.preventDefault()
		this[event.target.name] = event.target.value
	}

	render() {
		this.$component.innerHTML = ''

		const form = document.createElement('form')
		form.addEventListener('submit', event => {
			event.preventDefault()
			this.handleSubmit()
		})

		const inputTitle = document.createElement('input')
		inputTitle.name = 'title'
		inputTitle.type = 'text'
		inputTitle.oninput = this.handleInputChange
		inputTitle.placeholder = 'Title'
		inputTitle.required = true
		this.title ? inputTitle.value = this.title : inputTitle.value = ''

		const inputUrl = document.createElement('input')
		inputUrl.name = 'url'
		inputUrl.type = 'url'
		inputUrl.oninput = this.handleInputChange
		inputUrl.placeholder = 'URL (optional)'
		this.url ? inputUrl.value = this.url : inputUrl.value = ''

		const inputDescription = document.createElement('textarea')
		inputDescription.name = 'body'
		inputDescription.oninput = this.handleInputChange
		inputDescription.placeholder = 'Description (optional); it is possible to use #hashtags'
		this.body ? inputDescription.innerText = this.body : inputDescription.innerText = ''

		const submitButton = document.createElement('button')
		submitButton.type = 'submit'
		submitButton.onclick = () => this.handleSubmit
		if (this.submitting) {
			submitButton.disabled = true
			submitButton.innerText = `${this.submitText}...`
		} else {
			submitButton.innerText = this.submitText
		}

		form.appendChild(inputTitle)
		form.appendChild(inputUrl)
		form.appendChild(inputDescription)
		form.appendChild(submitButton)
		this.$component.appendChild(form)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('form-job', FormJob)

export default FormJob

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
			--color-input-invalid: blue;
		}
		form {
			display: flex;
			flex-direction: column;
		}
		input {
			margin-bottom: 1rem;
			padding: 0.4rem 0.6rem;
			font-size: 1rem;
		}
		button {
			padding: 0.2rem 0.1rem;
			font-size: 1rem;
			cursor: pointer;
		}
		p {
			margin-top: 0;
		}
	</style>
	<div class="Component"></div>
`

class FormEmailPassword extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		this.submitText = this.getAttribute('submit-text') || 'Submit'
		this.render()
	}

	handleSubmit = async () => {
		let data  = {
			email: this.email,
			password: this.password
		}
		const event = new CustomEvent('userSubmitFormEmailPassword', {
			bubbles: true,
			detail: data
		})
		this.dispatchEvent(event)
	}

	handleInputChange = (input) => {
		this[input.target.name] = input.target.value
	}

	render() {
		this.$component.innerHTML = ''

		const form = document.createElement('form')
		form.addEventListener('submit', event => {
			event.preventDefault()
			this.handleSubmit()
		})

		const inputEmail = document.createElement('input')
		inputEmail.name = 'email'
		inputEmail.type = 'email'
		inputEmail.oninput = this.handleInputChange
		inputEmail.placeholder = 'Email'
		inputEmail.required = true

		const inputPassword = document.createElement('input')
		inputPassword.name = 'password'
		inputPassword.type = 'password'
		inputPassword.oninput = this.handleInputChange
		inputPassword.placeholder = 'Password'
		inputPassword.setAttribute('minlength', 8)
		inputPassword.required = true

		const submitButton = document.createElement('button')
		submitButton.innerHTML = this.submitText
		submitButton.type = 'submit'
		submitButton.onclick = () => this.handleSubmit

		form.appendChild(inputEmail)
		form.appendChild(inputPassword)
		form.appendChild(submitButton)
		this.$component.appendChild(form)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('form-email-password', FormEmailPassword)

export default FormEmailPassword

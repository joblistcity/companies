const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
		}
		form {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
		}
		label {
			margin-right: 0.3rem;
		}
		input {
			padding: 0.4rem 0.6rem;
			font-size: 1rem;
		}
		button {
			padding: 0.2rem 0.1rem;
			font-size: 1rem;
			cursor: pointer;
			margin-left: 0.2rem;
			margin-right: 0.2rem;
		}

		input {
			flex-grow: 2;
		}
		button {
			flex-grow: 1;
		}
		p {
			margin-top: 0;
		}
	</style>
	<div class="Component"></div>
`

class FormUpdateEmail extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		this.label = this.getAttribute('label')
		this.email = this.getAttribute('email') || ''
		this.submitText = this.getAttribute('submit-text') || 'Update email'
		this.render()
	}

	handleSubmit = async () => {
		let data  = {
			email: this.email
		}
		const event = new CustomEvent('userSubmitFormUpdateEmail', {
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

		let $label = document.createElement('label')
		$label.innerText = 'Your email address:'
		$label.setAttribute('title', this.email)

		const $inputEmail = document.createElement('input')
		$inputEmail.setAttribute('title', 'The email address you use to login this account.')
		$inputEmail.name = 'email'
		$inputEmail.type = 'email'
		$inputEmail.value = ''
		$inputEmail.oninput = this.handleInputChange
		if (this.email) {
			$inputEmail.placeholder = this.email
		} else {
			$inputEmail.placeholder = 'Email'
		}

		const $submitButton = document.createElement('button')
		$submitButton.innerHTML = this.submitText
		$submitButton.type = 'submit'
		$submitButton.title = 'Write down a new email address and click this button, if you want to change your login email for this account.'
		$submitButton.onclick = () => this.handleSubmit

		this.label && form.appendChild($label)
		form.appendChild($inputEmail)
		form.appendChild($submitButton)
		this.$component.appendChild(form)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('form-update-email', FormUpdateEmail)

export default FormUpdateEmail

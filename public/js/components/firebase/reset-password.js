import {
	sendPasswordResetEmail
} from './api.js'
import FormUpdateEmail from '../form/form-update-email.js'

const template = document.createElement('template')
template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
		}
		.Component {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
		}
		form-update-email {
			flex-grow: 1;
		}
		p {
			margin-top: 0;
		}
		label {
			font-style: italic;
			margin-right: 0.5rem;
		}
	</style>
	<div class="Component"></div>
`

class ResetPassord extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		this.label = this.getAttribute('label') || false
		this.input = this.getAttribute('input') || false
		this.email = this.getAttribute('email') || null

		const $firebaseApp = document.querySelector('firebase-app')

		if (window.firebase) {
			this.handleDatabaseReady({
				detail: window.firebase
			})
			this.handleUserLoggedIn({
				detail: window.firebase.auth().currentUser
			})
		}

		if ($firebaseApp) {
			$firebaseApp.addEventListener('firebaseReady', this.handleDatabaseReady, false)
			$firebaseApp.addEventListener('userLoggedIn', this.handleUserLoggedIn, false)
			this.shadowRoot.addEventListener('userSubmitFormUpdateEmail', this.handleUserEmail, false)
		}
	}

	disconnectedCallback() {
		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.removeEventListener('firebaseReady', this.handleDatabaseReady)
			$firebaseApp.removeEventListener('userLoggedIn', this.handleUserLoggedIn)
			this.shadowRoot.removeEventListener('userSubmitFormUpdateEmail', this.handleUserEmail)
		}
	}

	handleDatabaseReady = ({detail}) => {
		this.firebase = detail
		this.render()
	}

	handleUserLoggedIn = ({detail}) => {
		this.user = detail
		this.render()
	}

	handleReset = async () => {
		await this.resetPassword(this.email)
	}

	handleUserEmail = async (event) => {
		const {detail} = event
		const {email} = detail
		if (!email) return
		await this.resetPassword(email)
		this.render()
	}

	resetPassword = async (email) => {
		let res = null
		try {
			res = await sendPasswordResetEmail(this.firebase, email)
		} catch (error) {
			console.log('Error verifying user email', error)
		}
	}

	render() {
		this.$component.innerHTML = ''

		if (this.label) {
			const $label = document.createElement('label')
			$label.innerText = 'Forgot your password?'
			this.$component.appendChild($label)
		}

		if (this.input) {
			const $formEmail = document.createElement('form-update-email')
			$formEmail.setAttribute('submit-text', 'Send reset password link')
			this.$component.appendChild($formEmail)
		} else {
			const $resetPassword = document.createElement('button')
			$resetPassword.innerText = 'Send reset password link'
			$resetPassword.title = 'To change your password, send a reset password link to your current email.'
			$resetPassword.onclick = this.handleReset
			this.$component.appendChild($resetPassword)
		}
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('reset-password', ResetPassord)

export default ResetPassord

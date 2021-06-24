import {
	sendVerificationEmail
} from './api.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
		}
		p {
			margin-top: 0;
		}
		label {
			font-style: italic;
			margin-right: 0.3rem;
		}
	</style>
	<div class="Component"></div>
`

class VerifyEmail extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		this.label = this.getAttribute('label') || false
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
		}
	}

	disconnectedCallback() {
		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.removeEventListener('firebaseReady', this.handleDatabaseReady)
			$firebaseApp.removeEventListener('userLoggedIn', this.handleUserLoggedIn)
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

	handleVerify = async ({detail}) => {
		const {email, password} = detail
		let emailVerified = null
		try {
			emailVerified = await sendVerificationEmail(this.firebase, email, password)
		} catch (error) {
			console.log('Error verifying user email', error)
		}
	}

	render() {
		this.$component.innerHTML = ''

		if (this.user && this.user.emailVerified) return

		const $buttonVerify = document.createElement('button')
		$buttonVerify.innerText = 'Send verification email.'
		$buttonVerify.onclick = this.handleVerify
		$buttonVerify.title = 'Verify the ownership of this email address. Look your inbox, for a verification mail sent by us.'

		if (this.label) {
			const $label = document.createElement('label')
			$label.innerText = 'Your email is not verified:'
			this.$component.appendChild($label)
		}

		this.$component.appendChild($buttonVerify)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('verify-email', VerifyEmail)

export default VerifyEmail

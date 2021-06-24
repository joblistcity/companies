import {
	initFirebaseApp,
	updateUserEmail
} from './api.js'
import VerifyEmail from './verify-email.js'
import ResetPassword from './reset-password.js'
import DeleteUser from './delete-user.js'
import FormUpdateEmail from '../form/form-update-email.js'

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
			margin-right: 0.4rem;
		}
		.Component {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
		}
		.Component > * {
			margin-bottom: 1rem;
		}
		form-update-email {
			flex-grow: 1;
		}
		list-buttons {
			width: 100%;
			display: flex;
			flex-wrap: wrap;
		}
		list-buttons verify-email,
		list-buttons reset-password {
			margin-right: 0.3rem;
		}
	</style>
	<div class="Component"></div>
`

class FirebaseUser extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		if (window.firebase) {
			this.handleDatabaseReady({
				detail: window.firebase
			})
			this.handleUser({
				detail: window.firebase.auth().currentUser
			})
		}

		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.addEventListener('firebaseReady', this.handleDatabaseReady, false)
			$firebaseApp.addEventListener('userLoggedIn', this.handleUser, false)
			this.shadowRoot.addEventListener('userSubmitFormUpdateEmail', this.handleUserEmail, false)
		}
		this.render()
	}

	disconnectedCallback() {
		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.removeEventListener('firebaseReady', this.handleDatabaseReady)
			$firebaseApp.removeEventListener('userLoggedIn', this.handleUser)
		}
	}

	handleDatabaseReady = ({detail}) => {
		this.firebase = detail
		this.render()
	}

	handleUser = ({detail}) => {
		this.user = detail
		this.render()
	}

	handleUserEmail = async ({detail}) => {
		const {email} = detail
		if (!email) return

		try {
			const res = await updateUserEmail(this.firebase, email)
		} catch (error) {
			console.log('Error updating user email', error)
		}
		this.render()
	}

	render() {
		this.$component.innerHTML = ``

		if (!this.user) {
			const $messageNoUser = document.createElement('p')
			$messageNoUser.innerText = 'No user to display, you are logged out.'
			this.$component.appendChild($messageNoUser)
			return
		}

		const $formUpdateEmail = document.createElement('form-update-email')
		$formUpdateEmail.setAttribute('label', true)
		$formUpdateEmail.setAttribute('email', this.user.email)

		const $listButtons = document.createElement('list-buttons')
		const $verifyEmail = document.createElement('verify-email')
		$verifyEmail.setAttribute('label', true)

		const $resetPassword = document.createElement('reset-password')
		$resetPassword.setAttribute('email', this.user.email)

		const $deleteUser = document.createElement('delete-user')

		$listButtons.appendChild($verifyEmail)
		$listButtons.appendChild($resetPassword)
		$listButtons.appendChild($deleteUser)

		this.$component.appendChild($formUpdateEmail)
		this.$component.appendChild($listButtons)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('firebase-user', FirebaseUser)

export default FirebaseUser

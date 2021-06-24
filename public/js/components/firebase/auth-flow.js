import {
	loginUser
} from './api.js'

import Login from './login.js'
import Register from './register.js'
import Logout from './logout.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
		}
		form {
			display: flex;
			flex-direction: column;
		}
		input {
			margin-bottom: 1rem;
		}
		p {
			margin-top: 0;
		}

		firebase-login,
		firebase-logout,
		firebase-register,
		reset-password,
		firebase-user {
			display: block;
			margin-bottom: 2rem;
		}
	</style>
	<div class="Component"></div>
`

class AuthFlow extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.addEventListener('firebaseReady', this.handleDatabaseReady, false)
			$firebaseApp.addEventListener('userLoggedIn', this.handleUserLoggedIn, false)
			this.shadowRoot.addEventListener('userSubmitFormEmailPassword', this.handleUserLogin, false)
		}
	}

	disconnectedCallback() {
		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.removeEventListener('firebaseReady', this.handleDatabaseReady)
			$firebaseApp.removeEventListener('userLoggedIn', this.handleUserLoggedIn)
			this.shadowRoot.removeEventListener('userSubmitFormEmailPassword', this.handleUserLogin)
		}
	}

	handleDatabaseReady = ({detail}) => {
		this.firebase = detail
		this.render()
	}

	handleUserLoggedIn = (event) => {
		this.user = event.detail
		this.render()
	}

	handleUserLogin = async ({detail}) => {
		const {email, password} = detail
		let user = null
		try {
			user = loginUser(this.firebase, email, password)
		} catch (error) {
			console.log('Error login user', error)
		}
		this.user = user
	}

	render() {
		this.$component.innerHTML = ''

		if (this.user) {
			const $user = document.createElement('firebase-user')
			const $logout = document.createElement('firebase-logout')
			this.$component.appendChild($logout)
			this.$component.appendChild($user)
		} else {
			const $messageLogin = document.createElement('p')
			$messageLogin.innerText = 'Login your existing account:'

			const $messageRegister = document.createElement('p')
			$messageRegister.innerText = 'If you don\'t have already, you can register a new account:'

			const $login = document.createElement('firebase-login')
			const $register = document.createElement('firebase-register')
			const $resetPassword = document.createElement('reset-password')
			$resetPassword.setAttribute('label', true)
			$resetPassword.setAttribute('input', true)

			this.$component.appendChild($messageLogin)
			this.$component.appendChild($login)
			this.$component.appendChild($resetPassword)
			this.$component.appendChild($messageRegister)
			this.$component.appendChild($register)
		}
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('auth-flow', AuthFlow)

export default AuthFlow

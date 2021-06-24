import notify from '../notification/index.js'

import {
	loginUser
} from './api.js'


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
	</style>
	<div class="Component"></div>
`

class FirebaseLogin extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
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
			user = await loginUser(this.firebase, email, password)
		} catch (error) {
			notify(error)
		}
		this.user = user
	}

	render() {
		this.$component.innerHTML = ''

		if (this.user) {
			const p = document.createElement('p')
			p.innerHTML = 'You are already logged in.'
			this.$component.appendChild(p)
			return
		}

		const form = document.createElement('form-email-password')
		form.setAttribute('submit-text', 'Login')
		form.addEventListener('submit', event => {
			event.preventDefault()
			this.handleLogin()
		})

		this.$component.appendChild(form)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('firebase-login', FirebaseLogin)

export default FirebaseLogin

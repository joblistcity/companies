import notify from '../notification/index.js'

import {
	initFirebaseApp,
	registerUser
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
	</style>
	<div class="Component"></div>
`

class FirebaseRegister extends HTMLElement {
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
			$firebaseApp.addEventListener('firebaseReady', this.handleDatabaseReady, true)
			$firebaseApp.addEventListener('userLoggedIn', this.handleUserLoggedIn, true)
			this.shadowRoot.addEventListener('userSubmitFormEmailPassword', this.handleUserRegister, true)
		}
	}
	disconnectedCallback() {
		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.removeEventListener('firebaseReady', this.handleDatabaseReady)
			$firebaseApp.removeEventListener('userLoggedIn', this.handleUserLoggedIn)
			this.shadowRoot.addEventListener('userSubmitFormEmailPassword', this.handleUserRegister)
		}
	}

	handleUserLoggedIn = (event) => {
		this.user = event.detail
		this.render()
	}

	handleDatabaseReady = (event) => {
		this.firebase = event.detail
		this.render()
	}

	handleUserRegister = async ({detail}) => {
		const {email, password} = detail
		let user
		try {
			user = await registerUser(this.firebase, email, password)
		} catch (error) {
			notify(error)
		}
	}

	render() {
		this.$component.innerHTML = ''

		if (this.user) {
			const p = document.createElement('p')
			p.innerHTML = 'You already have an account, and are logged into it.'
			this.$component.appendChild(p)
			return
		}

		const form = document.createElement('form-email-password')
		form.setAttribute('submit-text', 'Register')
		form.addEventListener('submit', event => {
			event.preventDefault()
			this.handleRegister()
		})
		this.$component.appendChild(form)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('firebase-register', FirebaseRegister)

export default FirebaseRegister

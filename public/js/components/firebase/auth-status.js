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
			--color-auth-status-login: green;
			--color-auth-status-logout: lightgray;
		}
		:host {
			display: none;
		}
		:host([visual]) {
		}
		:host([visual]) .Component {
			height: 0.5rem;
			width: 0.5rem;
			margin-bottom: 0.2rem;
		}
		:host([auth="true"]) {
			display: inline-block;
			background-color: var(--color-auth-status-login);
		}
		:host([auth="false"]) {
			background-color: var(--color-auth-status-logout);
		}
		p {
			margin-top: 0;
		}
	</style>
	<div class="Component"></div>
`

class AuthStatus extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		this.quiet = this.getAttribute('quiet')
		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.addEventListener('userLoggedIn', this.handleUserLoggedIn, false)
		}
	}

	disconnectedCallback() {
		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.removeEventListener('userLoggedIn', this.handleUserLoggedIn)
		}
	}

	handleUserLoggedIn = (event) => {
		this.user = event.detail
		if (this.user) {
			this.setAttribute('auth', true)
		} else {
			this.setAttribute('auth', false)
		}
		this.render()
	}

	render() {
		this.$component.innerHTML = ''

		if (this.quiet) return

		if (this.user) {
			const messageLogin = document.createElement('span')
			messageLogin.innerText = 'up'
			this.setAttribute('title', 'Logged in')
			this.$component.appendChild(messageLogin)
		} else {
			const messageLogout = document.createElement('span')
			messageLogout.innerText = 'down'
			this.title = "Logged out"
			this.$component.appendChild(messageLogout)
		}
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('auth-status', AuthStatus)

export default AuthStatus

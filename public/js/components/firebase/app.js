import {
	initFirebaseApp,
	loginUser
} from './api.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {}
		p {
			margin-top: 0;
		}
	</style>
	<div class="Component"></div>
`

class FirebaseApp extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		this.appId = this.getAttribute('app-id')
		this.messagingSenderId = this.getAttribute('messaging-sender-id')
		this.storageBucket = this.getAttribute('storage-bucket')
		this.projectId = this.getAttribute('project-id')
		this.databaseURL = this.getAttribute('database-url')
		this.authDomain = this.getAttribute('auth-domain')
		this.apiKey = this.getAttribute('api-key')

		this.initApp()
	}

	attributeChangedCallback = (attribute, oldValue, newValue) => {
		console.log('attre', attribute)
		console.log('this.appId 0', this.appId)
		this[attribute] = newValue
		this.initApp()
	}

	initApp = () => {
		if (!this.appId ||
				!this.messagingSenderId ||
				!this.storageBucket ||
				!this.projectId ||
				!this.databaseURL ||
				!this.authDomain ||
				!this.apiKey) {
			console.log('Missing required key')
			return
		}

		const config = {
			apiKey: this.apiKey,
			authDomain: this.authDomain,
			databaseURL: this.databaseURL,
			projectId: this.projectId,
			storageBucket: this.storageBucket,
			messagingSenderId: this.messagingSenderId,
			appId: this.appId
		}

		initFirebaseApp(config, this.handleFirebaseReady)
	}

	handleFirebaseReady = async (firebaseApp) => {
		this.firebaseApp = firebaseApp

		const firebaseReady = new CustomEvent('firebaseReady', {
			bubbles: true,
			detail: firebaseApp
		})

		this.dispatchEvent(firebaseReady)
		firebaseApp.auth().onAuthStateChanged(this.handleAuthChanged)
	}

	handleAuthChanged = (user) => {
		if (user) {
			this.user = user
		} else {
			this.user = null
		}
		const event = new CustomEvent('userLoggedIn', {
			bubbles: true,
			detail: this.user
		})
		this.dispatchEvent(event)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('firebase-app', FirebaseApp)

export default FirebaseApp

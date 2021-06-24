const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		.Component {
			display: flex;
			align-items: center;
		}
		p {
			margin-top: 0;
		}
		label {
			font-style: italic;
			margin-right: 0.4rem;
		}
	</style>
	<div class="Component"></div>
`

class FirebaseLogout extends HTMLElement {
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
		}
	}

	disconnectedCallback() {
		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.removeEventListener('firebaseReady', this.handleDatabaseReady)
			$firebaseApp.removeEventListener('userLoggedIn', this.handleUserLoggedIn)
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

	handleLogout = async () => {
		return await this.firebase.auth().signOut()
	}

	render() {
		this.$component.innerHTML = ''

		const messageStatus = document.createElement('label')
		messageStatus.innerText = 'You are logged in'
		this.$component.appendChild(messageStatus)

		if (this.user) {
			const $logout = document.createElement('button')
			$logout.innerText = 'Log out'
			$logout.title = 'Click here to log-out of your account.'
			$logout.onclick = this.handleLogout
			this.$component.appendChild($logout)
			return
		}

		const $login = document.createElement('p')
		$login.innerText = 'You are logged out.'
		this.$component.appendChild($login)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('firebase-logout', FirebaseLogout)

export default FirebaseLogout

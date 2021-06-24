import {
	deleteUser
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
		label {
			font-style: italic;
			margin-right: 0.5rem;
		}
	</style>
	<div class="Component"></div>
`

class DeleteUser extends HTMLElement {
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

	handleDelete = async () => {
		console.log('delete')
		const confirmMessage = 'Do you really want to delete your user account? It will delete all your user data, including all your jobs; no way back!'
		if (window.confirm(confirmMessage)) { 
			await this.deleteAccount()
		}
	}

	deleteAccount = async () => {
		let res = null
		try {
			res = await deleteUser(this.firebase)
		} catch (error) {
			console.log('Error deleting user', error)
		}
	}

	render() {
		this.$component.innerHTML = ''

		if (this.label) {
			const $label = document.createElement('label')
			$label.innerText = 'Delete your user account and all related user data?'
			this.$component.appendChild($label)
		}

		const $deleteUser = document.createElement('button')
		$deleteUser.innerText = 'Delete user account'
		$deleteUser.title = 'Deletes all your user data, no way back! ~/'
		$deleteUser.onclick = this.handleDelete
		this.$component.appendChild($deleteUser)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('delete-user', DeleteUser)

export default DeleteUser

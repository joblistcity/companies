import {
	onJob,
	deleteJob
} from '../firebase/api.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {}
	</style>
	<div class="Component"></div>
`

class JobDelete extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

	connectedCallback() {
		this.jobId = this.getAttribute('job-id')

		if (window.firebase) {
			this.handleDatabaseReady({
				detail: window.firebase
			})
		}

		const $firebaseApp = document.querySelector('firebase-app')
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
	attributeChangedCallback = (name, oldValue, newValue) => {
		this[name] = newValue
		this.render()
	}
	handleUserLoggedIn = ({detail}) => {
		this.user = detail
		this.render()
	}
	handleDatabaseReady = async ({detail}) => {
		this.firebase = detail
		try {
			await onJob(this.firebase, this.jobId, this.handleJob)
		} catch (error) {
			console.log('Error deleting job', error)
		}
		this.render()
	}
	handleJob = (job) => {
		this.job = job
		this.render()
	}

	handleClick = async (event) => {
		let deleted
		try {
			deleted = await deleteJob(this.firebase, this.jobId)
		} catch (error) {
			console.log('error deleting job', this.jobId, error)
		}
		return deleted
	}

	render() {
		this.$component.innerHTML = ''

		if (
			this.job
			&& this.job.isOwner
			&& Object.keys(this.job).length
		) {
			let deleteButton = document.createElement('button')
			deleteButton.innerText = 'Delete job'
			deleteButton.onclick = this.handleClick
			this.$component.appendChild(deleteButton)
		}
	}
}

customElements.define('job-delete', JobDelete)

export default JobDelete

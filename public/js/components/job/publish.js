import {
	onJob,
	publishJob,
	unpublishJob
} from '../firebase/api.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {}
	</style>
	<div class="Component"></div>
`

class JobPublish extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

	connectedCallback() {
		this.jobId = this.getAttribute('job-id')
		this.job = {}

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

	handleDatabaseReady = ({detail}) => {
		this.firebase = detail
	}

	handleUserLoggedIn = async ({detail}) => {
		this.user = detail
		try {
			await onJob(this.firebase, this.jobId, this.handleJob)
		} catch (error) {
			console.log('Error getting job', error)
		}
		this.render()
	}
	handleJob = (job = {}) => {
		this.job = job
		this.render()
	}

	handleClick = async (event) => {

		if (this.job && this.job.isPublished) {
			let unpublished
			try {
				unpublished = await unpublishJob(this.firebase, this.jobId)
			} catch (error) {
				console.log('error unpublishing job', this.jobId, error)
			}
		} else {
			let published
			try {
				published = await publishJob(this.firebase, this.jobId)
			} catch (error) {
				console.log('error publishing job', this.jobId, error)
			}
		}
		this.render()
	}

	render() {
		this.$component.innerHTML = ''
		if (
			!Object.keys(this.job).length
			|| !this.job.isOwner
		) return

		let publishButton = document.createElement('button')
		publishButton.onclick = this.handleClick

		if (this.job.isPublished) {
			publishButton.innerText = 'Unpublish job'
			publishButton.title = 'Removes the job from the homepage'
		} else {
			publishButton.innerText = 'Publish job'
			publishButton.title = 'When a job is published, it is visible on the homepage.'
		}

		this.$component.appendChild(publishButton)
	}
}

customElements.define('job-publish', JobPublish)

export default JobPublish

import {
	createJob,
	getJob
} from '../firebase/api.js'

import FormJob from '../form/form-job.js'
import JobItemInternal from './item-internal.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }

		p {
			margin-top: 0;
		}

		/* the job that was just created */
		job-item-internal {
			margin-top: 1rem;
		}
	</style>
	<div class="Component"></div>
`

class JobCreate extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

	connectedCallback() {
		this.submitText = this.getAttribute('submit-text') || 'Submit'

		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.addEventListener('firebaseReady', this.handleDatabaseReady, false)
			$firebaseApp.addEventListener('userLoggedIn', this.handleUserLoggedIn, false)
			this.shadowRoot.addEventListener('jobChanged', this.handleJobChanged, false)
		}
	}

	disconnectedCallback() {
		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.removeEventListener('firebaseReady', this.handleDatabaseReady)
			$firebaseApp.removeEventListener('userLoggedIn', this.handleUserLoggedIn)
			this.shadowRoot.removeEventListener('jobChanged', this.handleJobChanged)
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

	handleJobChanged = async ({detail}) => {
		const jobData = detail

		if (!jobData.title) {
			return
		}

		this.submitting = true
		createJob(this.firebase, jobData, this.user.uid)
			.then(async (jobRes) => {
				const job = await getJob(this.firebase, jobRes.id)
				this.job = job
				this.render()
			})
		this.render()
	}

	render() {
		this.$component.innerHTML = ''

		if (!this.user) {
			const userMessage = document.createElement('p')
			userMessage.innerText = 'You need to be logged in to create a job.'
			this.$component.appendChild(userMessage)
			return
		}

		const form = document.createElement('form-job')
		if (this.submitting) {
			form.setAttribute('submitting', true)
		}
		form.setAttribute('submit-text', 'Create new job')
		this.$component.appendChild(form)

		if (this.job) {
			const newJobItem = document.createElement('job-item-internal')
			newJobItem.setAttribute('job-id', this.job.id)
			newJobItem.setAttribute('title', this.job.title)
			newJobItem.setAttribute('body', this.job.body)
			newJobItem.setAttribute('url', this.job.url)
			newJobItem.setAttribute('is-new', true)
			this.$component.appendChild(newJobItem)
		}
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('job-create', JobCreate)

export default JobCreate

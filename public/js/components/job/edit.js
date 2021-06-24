import {
	onJob,
	editJob
} from '../firebase/api.js'

import FormJob from '../form/form-job.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
			box-sizing: border-box;
		}
		p {
			margin-top: 0;
		}
		p[right] {
			text-align: right;
		}
	</style>
	<div class="Component"></div>
`

class JobEdit extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

	connectedCallback() {
		this.submitText = this.getAttribute('submit-text') || 'Edit job'
		this.jobId = this.getAttribute('job-id') || ''
		this.quiet = this.getAttribute('quiet') || false

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

	handleDatabaseReady = async ({detail}) => {
		this.firebase = detail
		try {
			await onJob(this.firebase, this.jobId, this.handleJob)
		} catch (error) {
			console.log('Error getting job', error)
		}
		this.render()
	}

	handleJob = (job) => {
		this.job = job
		this.render()
	}

	handleUserLoggedIn = ({detail}) => {
		this.user = detail
		this.render()
	}

	handleJobChanged = async ({detail}) => {
		let job
		try {
			job = await editJob(this.firebase, detail)
		} catch (error) {
			console.log('error editing job', error)
		}
	}

	render() {
		this.$component.innerHTML = ''

		if (!this.user) {
			const messageUserRequired = document.createElement('p')
			messageUserRequired.innerHTML = 'You need to be logged in to edit a job.'
			!this.quiet && this.$component.appendChild(messageUserRequired)
			return
		}

		if (!this.job
				|| !Object.keys(this.job).length) {
			const messageJobRequired = document.createElement('p')
			messageJobRequired.innerHTML = 'Cannot edit; no job exists with this job-id.'
			!this.quiet && this.$component.appendChild(messageJobRequired)
			return false
		}

		if (this.job.user
				&& this.job.user !== this.user.uid) {
			const messageUserOwner = document.createElement('p')
			messageUserOwner.innerHTML = 'You do not have the rights to edit this job.'
			this.$component.appendChild(messageUserOwner)
			return
		}

		if (this.job.isPublished) {
			const messageJobPublished = document.createElement('p')
			messageJobPublished.setAttribute('right', true)
			messageJobPublished.innerHTML = 'Jobs cannot be edited while pusblished.'
			this.$component.appendChild(messageJobPublished)
			return
		}

		const {
			title,
			url,
			body
		} = this.job

		const form = document.createElement('form-job')
		form.setAttribute('job-id', this.jobId)
		form.setAttribute('submit-text', this.submitText)
		form.setAttribute('title', title)
		form.setAttribute('url', url)
		form.setAttribute('body', body)
		this.$component.appendChild(form)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('job-edit', JobEdit)

export default JobEdit

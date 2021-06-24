import {
	onJob
} from '../firebase/api.js'

import JobItemInternal from './item-internal.js'
import JobEdit from './edit.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
			font-size: 1.2rem;
		}
		p {
			margin-top: 0;
		}
	</style>
	<article class="Component"></article>
`

class JobCard extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

	connectedCallback() {
		this.jobId = this.getAttribute('job-id')
		this.job = null

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
	handleDatabaseReady = async ({detail}) => {
		this.firebase = detail
		this.render()
	}
	handleUserLoggedIn = async ({detail}) => {
		if (!this.jobId) return

		this.user = detail
		try {
			await onJob(this.firebase, this.jobId, this.handleJob)
		} catch(error) {
			console.log('Error fetching user jobs', error)
		}
	}
	handleJob = (job) => {
		this.job = job
		this.render()
	}

	render() {
		this.$component.innerHTML = ''

		const jobExists = this.job && Object.keys(this.job).length
		if (!jobExists) {
			let noJobs = document.createElement('p')
			noJobs.innerHTML = 'This job does not seem to exist.'
			this.$component.appendChild(noJobs)
			return
		}

		const {
			id,
			url,
			bodyTruncated,
			body,
			title,
			tags,
			isPublished
		} = this.job


		let jobHeader = document.createElement('job-item-internal')
		title && jobHeader.setAttribute('title', title)
		url && jobHeader.setAttribute('url', url)
		id && jobHeader.setAttribute('job-id', id)
		tags && tags.length && jobHeader.setAttribute('tags', JSON.stringify(tags))
		isPublished && jobHeader.setAttribute('featured', true)

		let jobBody = document.createElement('job-body')
		title && jobBody.setAttribute('body', body)

		this.$component.append(jobHeader)
		this.$component.append(jobBody)
	}
}

/* here as eaxmple; how to define a custom-element web component */
customElements.define('job-card', JobCard)

export default JobCard

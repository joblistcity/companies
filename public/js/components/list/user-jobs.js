import {
	getUserJobs
} from '../firebase/api.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {}
	</style>
	<div class="Component"></div>
`

class ListUserJobs extends HTMLElement {
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
	handleUserLoggedIn = async ({detail}) => {
		this.user = detail

		let jobs
		if (!this.user) {
			jobs = []
		} else {
			try {
				jobs = await getUserJobs(this.firebase, this.user.uid)
			} catch(error) {
				console.log('Error fetching user jobs', error)
			}
		}

		this.jobs = jobs
		this.render()
	}

	render() {
		this.$component.innerHTML = ''

		if (!this.user) {
			const requireLogin = document.createElement('p')
			requireLogin.innerText = 'You need to be logged in to list the jobs you created.'
			this.$component.appendChild(requireLogin)
			return
		}

		if (!this.jobs.length) {
			let noJobs = document.createElement('p')
			noJobs.innerText = 'You have not yet created any job.'
			this.$component.appendChild(noJobs)
			return
		}

		if (this.jobs.length) {
			this.jobs.forEach(item => {
				let jobUrl
				const {
					id,
					url,
					title,
					isPublished,
					bodyTruncated
				} = item

				let job = document.createElement('job-item-internal')

				title && job.setAttribute('title', title)
				url && job.setAttribute('url', url)
				id && job.setAttribute('job-id', id)
				isPublished && job.setAttribute('featured', true)
				bodyTruncated && job.setAttribute('body', bodyTruncated)
				this.$component.append(job)
			})
		}
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('list-user-jobs', ListUserJobs)

export default ListUserJobs

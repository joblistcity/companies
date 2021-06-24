import {
	getLatestJobs
} from '../firebase/api.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
			display: flex;
		}
		.Button--createJob {
			color: var(--color-button-create);
			background-color: var(--color-button-create-brackground);
			padding-left: 0.2rem;
			padding-right: 0.2rem;
		}
		.Component {
			width: 100%;
		}
		p {
			margin-top: 0;
		}
		job-item {
			font-size: 1.1rem;
		}
	</style>
	<div class="Component"></div>
`

class JobListCityFeaturedJobs extends HTMLElement {
	model = []

	constructor() {
		super()
		this.attachShadow({
			mode: 'open'
		})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
	}

	connectedCallback() {
		this.tag = this.getAttribute('tag') || '4all'

		if (window.firebase) {
			this.handleDatabaseReady({
				detail: window.firebase
			})
		}

		const $firebaseApp = document.querySelector('firebase-app')
		if ($firebaseApp) {
			$firebaseApp.addEventListener('firebaseReady', this.handleDatabaseReady, false)
		}
	}

	handleDatabaseReady = async ({detail}) => {
		this.firebase = detail
		const latestJobs = await getLatestJobs(this.firebase, this.tag)
		this.model = latestJobs
		this.render()
	}

	render() {
		const $component = this.shadowRoot.querySelector('.Component')

		let newJobUrl = `${window.location.origin}/job/new/`

		let newJob = document.createElement('p')
		newJob.innerHTML = `<i>All published jobs with the hashtag <strong>#${this.tag}</strong> in their description, are listed here; <a href="${newJobUrl}" class="Button Button--createJob">create a new job</a>.</i>`
		$component.append(newJob)

		if (this.model.length) {
			this.model.forEach(item => {
				let jobUrl
				const {
					id,
					url,
					title,
					tags,
					bodyTruncated
				} = item

				let job = document.createElement('job-item-internal')

				title && job.setAttribute('title', title)
				url && job.setAttribute('url', url)
				bodyTruncated && job.setAttribute('body', bodyTruncated)
				id && job.setAttribute('job-id', id)
				tags && tags.length && job.setAttribute('tags', JSON.stringify(tags))
				job.setAttribute('featured', true)
				$component.append(job)
			})
		}
	}
}

customElements.define('joblistcity-featured-jobs', JobListCityFeaturedJobs)

export default JobListCityFeaturedJobs

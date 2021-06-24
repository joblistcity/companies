const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host {
			--color-text: inherit;
			--color-link: blue;
			--color-new: blue;
			--color-link-featured: green;
			--color-job-featured: #eeeeee;
			--color-link-visited: #800080;
		}
		:host([hidden]) { display: none }
		:host {
			display: block;
			margin-bottom: 0.5rem;
			border-left: 0.3rem solid transparent;
		}
		:host([featured]) {
			margin-bottom: 1rem;
		}
		:host([featured]) .Title {
			color: var(--color-link-featured);
			text-decoration: none;
			font-size: 1rem;
		}
		:host([featured]) .ItemExternalUrl {
			color: var(--color-text);
		}
		:host([is-new]) {
			border-left-color: var(--color-new);
			padding-left: 0.5rem;
		}

		.Component {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
		}

		a {
			color: var(--color-link);
			text-decoration: none;
		}

		a.Title:hover {
			text-decoration: underline;
		}
		p {
			margin-top: 0;
		}
		.Tags {
			display: flex;
			flex-wrap: wrap;
		}
		.Tag {
			margin-left: 0.5rem;
			font-size: 0.7rem;
			font-style: italic;
		}
		.LinkExternal {
			color: var(--color-text);
			text-decoration: non;
			width: 100%;
			font-size: 0.8rem;
		}
		.AddJob {
			font-weight: bold;
			background-color: var(--color-job-featured);
			color: var(--color-add-job);
		}
	</style>
	<div class="Component"></div>
`

class JobItem extends HTMLElement {
	setInitialAttributes = () => {
		this.urlVisible = this.getAttribute('url-visible') || false
		this.isNew = this.getAttribute('is-new') || false

		this.title = this.getAttribute('title') || 'Untitled'
		this.url = this.getAttribute('url') || '#'
		this.titleUrl = this.getAttribute('title-url') || null
		this.tags = JSON.parse(this.getAttribute('tags')) || []
		this.tagsUrl = this.getAttribute('tags-url') || `${window.location.origin}/tags`

		this.requirements = this.getAttribute('requirements')
		this.department = this.getAttribute('department')
		this.category = this.getAttribute('category')
		this.employmentType = this.getAttribute('employment-type')

		this.tagsDefault = [
			this.employmentType,
			this.category,
			this.departement
		].filter(item => item)
	}

	constructor() {
		super()
		this.attachShadow({
			mode: 'open'
		})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
	}

	connectedCallback() {
		this.setInitialAttributes()
		this.render()
	}
	render() {
		const $component = this.shadowRoot.querySelector('.Component')

		let jobTitle = document.createElement('a')
		jobTitle.setAttribute('href', this.titleUrl || this.url)
		jobTitle.setAttribute('class', 'Title')
		jobTitle.innerText = this.title
		$component.append(jobTitle)

		let $tagsContainer = document.createElement('aside')
		this.tags && this.tags.forEach(tag => {
			let $tag = document.createElement('span')
			$tag.setAttribute('class', 'Tag')
			$tag.innerText = tag
			$tagsContainer.append($tag)
		})

		this.tagsDefault && this.tagsDefault.forEach(tag => {
			let $tag = document.createElement('i')
			$tag.setAttribute('class', 'Tag')
			$tag.innerText = tag
			$tagsContainer.append($tag)
		})

		if (this.tags || this.tagsDefault) {
			$tagsContainer.setAttribute('class', 'Tags')
			$component.append($tagsContainer)
		}

		if (this.urlVisible) {
			let jobUrl = document.createElement('a')
			jobUrl.setAttribute('href', this.url)
			jobUrl.setAttribute('external', true)
			jobUrl.setAttribute('class', 'LinkExternal')
			jobUrl.innerText = this.url
			$component.append(jobUrl)
		}
	}
}

customElements.define('job-item', JobItem)

export default JobItem

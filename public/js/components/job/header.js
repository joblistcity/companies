const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host {
			--color-text: inherit;
			--color-link: blue;
			--color-link-featured: green;
			--color-job-featured: #eeeeee;
			--color-link-visited: #800080;
		}
		:host([hidden]) { display: none }
		:host {
			display: block;
		}
		.Component {
			display: flex;
			flex-direction: column;
		}
		p {
			margin-top: 0;
		}
	</style>
	<div class="Component"></div>
`

class JobItem extends HTMLElement {
	setInitialAttributes = () => {
		this.title = this.getAttribute('title') || 'Untitled'
		this.url = this.getAttribute('url') || '#'

		this.requirements = this.getAttribute('requirements')
		this.department = this.getAttribute('department')
		this.category = this.getAttribute('category')
		this.employmentType = this.getAttribute('employment-type')
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

		const tagsDefault = [
			this.employmentType,
			this.category,
			this.departement
		].filter(item => item)

		let jobTitle = document.createElement('a')
		jobTitle.setAttribute('href', this.url)
		jobTitle.innerText = this.title
		$component.append(jobTitle)

		/* our possible values */
		if (this.url) {
			let $url = document.createElement('a')
			$url.setAttribute('href', this.url)
			$url.setAttribute('class', 'ItemExternalUrl')
			$url.innerText = this.url
			$component.append($url)
		}

		tagsDefault.forEach(tag => {
			let $tag = document.createElement('span')
			$tag.setAttribute('class', 'ItemTag')
			$tag.innerText = tag
			$component.append($tag)
		})
	}
}

customElements.define('job-item', JobItem)

export default JobItem

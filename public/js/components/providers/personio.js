import JobItem from '../job/item.js'

/*
	 docs:
	 - https://developer.personio.de/docs/retrieving-open-job-positions
	 - https://developer.personio.de/docs/integration-of-open-positions
 */

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
		}
	</style>
	<div class="Component"></div>
`

class ListJobsPersonio extends HTMLElement {
	initialAttributes = ['hostname', 'country', 'city']
	language = 'en'
	baseUrl = ''
	providerUrl = ''
	model = []

	setInitialAttributes = () => {
		const values = this.initialAttributes.map(attr => this.getAttribute(attr))
		const allAttrSet = values.filter(Boolean).length === this.initialAttributes.length

		if (allAttrSet) {
			this.initialAttributes.forEach(attr => {
				this[attr] = this.getAttribute(attr)
			})
		} else {
			console.log('Missing required attributes', this.initialAttributes)
		}
	}

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.setInitialAttributes()
		this.baseUrl = `https://${this.hostname}-jobs.personio.de`
		this.providerUrl = `${this.baseUrl}/xml?language=${this.language}`
		this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  async connectedCallback() {
		let res
		try {
			res = await fetch(this.providerUrl).then((res) => {
				if (res.status >= 200 && res.status < 300) {
					return res.text()
				}
			})
		} catch (error) {
			console.log('Error', error, this.providerUrl)
		}

		if (res) {
			const data = this.serialize(this.parse(res))
			this.model = data.filter(item => {
				if (!item.office) return
				let search = ''
				if (this.city) {
					search = this.city
				} else {
					search = this.country
				}
				search = search.toLowerCase()
				return item.office.toLowerCase().indexOf(search) > -1
			})
			this.render()
		}

	}

	serialize = (data) => {
		return data.map(({
			name,
			id,
			office,
			employmentType,
			occupationCategory
		}) => {
			return {
				title: name,
				url: `${this.baseUrl}/job/${id}`,
				office,
				employmentType,
				occupationCategory
			}
		})
	}

	parse = textRes => {
		const params = ['id','name', 'occupationCategory','employmentType','office']
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(textRes, "text/xml");

		const xmlJobs = xmlDoc.getElementsByTagName('workzag-jobs')[0]
		const positions = xmlDoc.getElementsByTagName('position')

		const jsonJobs = Object.entries(positions).map(item => {
			const job = item[1]
			const newJob = {}
			const setParam = param => {
				let el
				try {
					el = job.getElementsByTagName(param)
				} catch (error) {
				}
				if (el && el[0]) {
					newJob[param] = el[0].childNodes[0].nodeValue
				}
			}
			params.forEach(setParam)
			return newJob
		})
		return jsonJobs
	}

	render() {
		const $component = this.shadowRoot.querySelector('.Component')
		const model = this.model
		model.forEach(({title, url}) => {
			if (!title || !url) return
			let newJobItem = document.createElement('job-item')
			newJobItem.setAttribute('title', title)
			newJobItem.setAttribute('url', url)

			newJobItem.innerHTML = title
			$component.append(newJobItem)
		})
	}
}

customElements.define('list-jobs-personio', ListJobsPersonio)

export default ListJobsPersonio

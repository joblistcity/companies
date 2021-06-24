import JobItem from './item.js'

class JobItemInternal extends JobItem {
	setInitialAttributes = () => {
		this.id = this.getAttribute('job-id')
		this.title = this.getAttribute('title') || 'Untitled'
		this.requirements = this.getAttribute('requirements')
		this.department = this.getAttribute('department')
		this.category = this.getAttribute('category')
		this.employmentType = this.getAttribute('employment-type')
		this.tags = JSON.parse(this.getAttribute('tags'))

		this.url = this.getAttribute('url') || '#'
		this.titleUrl = `${window.location.origin}/job/?id=${this.id}`
		this.urlVisible = true
	}
}

customElements.define('job-item-internal', JobItemInternal)

export default JobItemInternal

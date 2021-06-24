class MapMarker extends HTMLElement {
    initialAttributes = ['position', 'text']
    constructor() {
	super()
	this.attachShadow({mode: 'open'})
	this.setInitialAttributes()
    }

    connectedCallback() {}

    setInitialAttributes = () => {
	const position = JSON.parse(this.getAttribute('position'))
	if (position && position.coordinates) {
	    this.latitude = position.coordinates[0]
	    this.longitude = position.coordinates[1]
	}

	this.text = this.getAttribute('text') || ''
	console.log(this)
    }
}

customElements.define('map-marker', MapMarker)

export default MapMarker

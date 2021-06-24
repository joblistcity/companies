const template = document.createElement('template')

template.innerHTML = `
    <link
	 rel="stylesheet"
	 href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
	 integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
	 crossorigin=""/>
	<style>
		:host([hidden]) { display: none }
		:host {
			display: block;
			width: 100%;
		}
		.Component {
			height: 100%;
			min-height: 17rem;
		}
		.leaflet-marker-icon {
			/* background-color: red; */
		}

		.leaflet-popup-content  {
			margin: 0.3rem;
		}
		.leaflet-popup-content a {
			display: block;
			padding: 0.8rem;
		}
	</style>
	<div class="Component"></div>
`

class MapList extends HTMLElement {
    initialAttributes = ['position', 'zoom']

    constructor() {
	super()
	this.attachShadow({mode: 'open'})
	this.setInitialPosition()
	this.shadowRoot.appendChild(template.content.cloneNode(true))
    }

   setInitialPosition() {
       const position = JSON.parse(this.getAttribute('position'))
       if (position && position.coordinates) {
	   this.longitude = position.coordinates[0]
	   this.latitude = position.coordinates[1]
	}
    }

    connectedCallback() {
	const $component = this.shadowRoot.querySelector('.Component')
	const markerData = Object.keys(this.children).map(index => {
	    const $item = this.children[index]
	    let item = {}
	    $item.getAttributeNames().forEach(attr => {
		if (attr === 'position') {
		    item[attr] = JSON.parse($item.getAttribute(attr))
		} else {
		    item[attr] = $item.getAttribute(attr)
		}
	    })
	    return item
	})

	if (true || this.checkDependencies()) {
	    this.renderLeaflet($component, markerData)
	}
    }

    checkDependencies = () => {
	typeof L === 'undefined' ? false : true
    }

    renderLeaflet = ($el, markerData) => {
	const zoom = this.zoom || 12
	var map = L.map($el).setView([this.latitude, this.longitude], zoom)
	map.zoomControl.setPosition('topright');
	
	const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
	const mapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	L.tileLayer(tileUrl, {
	    attribution: mapAttribution,
	    position:'bottomleft'
	}).addTo(map)

	const iconUrl = 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

	markerData.forEach(data => {
	    var icon = L.icon({
		iconUrl,
		iconSize: [20, 20],
		popupAnchor: [0, -15]
	    })

	    if (data.position) {
		const [longitude, latitude] = data.position.coordinates
		L.marker([latitude, longitude], {icon}).addTo(map).bindPopup(data.text)
	    }
	})
    }
}

customElements.define('map-list', MapList)

export default MapList

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
			--color-notifications-background: lightgray;
		}
		:host {
			display: block;
			margin-bottom: 0.2rem;
		}
		article {
			background-color: var(--color-notifications-background);
			padding: 0.5rem;
			cursor: pointer;
		}
	</style>
	<div class="Component"></div>
`

class NotificationItem extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		this.message = this.getAttribute('message') || ''
		this.code = this.getAttribute('code') || null
		this.delay = this.getAttribute('delay') || 20000

		this.scheduleAutoDelete()
		this.render()
	}

	scheduleAutoDelete = () => {
		if (typeof this.delay !== 'number') return
		setTimeout(() => {
			this.remove()
		}, this.delay)
	}

	render(notification) {
		let $notif = document.createElement('article')
		$notif.innerText = this.message
		this.onclick = () => {
			this.remove()
		}
		this.$component.appendChild($notif)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('notification-item', NotificationItem)

export default NotificationItem

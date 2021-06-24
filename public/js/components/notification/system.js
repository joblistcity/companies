import NotificationItem from './item.js'

const template = document.createElement('template')

template.innerHTML = `
	<style>
		:host([hidden]) { display: none }
		:host {
			--color-notification-background: lightgray;
			--color-notifications-background: transparent;
		}
		:host([fixed]) {
			z-index: 1;
			position: fixed;
			bottom: 0;
			right: 0;
			background-color: var(--color-notifications-background)
		}
	</style>
	<div class="Component"></div>
`

class NotificationComponent extends HTMLElement {
	/* default web component methods */
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))
		this.$component = this.shadowRoot.querySelector('.Component')
  }

  connectedCallback() {
		this.notifications = []
	}

	newNotification = (message) => {
		this.renderNotification(message)
	}

	notify = (data) => {
		const notification = this.serializeData(data)
		this.newNotification(notification)
	}

	serializeData = (data) => {
		let notification = {}
		if (typeof data === 'string') {
			notification.message = data
		} else {

			if (typeof data === 'object') {
				notification.message = data.message
				notification.code = data.code
			}
		}
		return notification
	}

	renderNotification({message, code}) {
		let $notif = document.createElement('notification-item')
		$notif.setAttribute('message', message)
		this.$component.appendChild($notif)
	}
}

/* here as example; how to define a custom-element web component */
customElements.define('notification-system', NotificationComponent)

export default NotificationComponent

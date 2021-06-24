export default (message) => {
	const ns = document.querySelector('notification-system')
	let notify = ns.notify
	if (typeof notify !== 'function') {
		notify = () => {
			console.info
		}
	}
	return notify(message)
}

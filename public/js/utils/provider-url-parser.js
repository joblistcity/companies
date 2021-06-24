const findId = (url, provider, extractMethod) => {
	if(!provider) return null

	if (typeof extractMethod !== 'function') return null

	let extractedId = extractMethod(url)

	if (!extractedId) return null

	return extractedId
}

const findProvider = (url, providersList) => {
	let hostId;
	try {
		hostId = extractHostId(new URL(url).host)
	} catch(error) {
		console.info('Cannot find provider from url', url, error)
	}

	// from the hostId, find the provider id
	// and fallback to file.
	const hostExsists = providersList[hostId]
	if (hostExsists) {
		return providersList[hostId]
	}
	return undefined
}

const extractHostId = (host) => {
	let els = host.split('.')
	// the top domain name and its extension
	return els
		.slice(els.length - 2, els.length)
		.join('.')
}

// enforces the presence of a `host` in the url
const normalizeUrl = (url) => {
	// triiim it one last time
	url = url.trim()
	if (!url.startsWith('http')) {
		url = `https://${url}`
	}
	return url
}

const find = (inputUrl, providersList, providerMethods) => {
	// 0. normalize url, so it can be parsed homogenously
	const url = normalizeUrl(inputUrl)
	let id;

	// 1. detect which provider's url it is
	let provider = findProvider(url, providersList)

	if (!provider) {
		console.info('Could not detect a known provider: %s', url)
	} else {
		// 2. find a media/hostname `id` served by this provider
		id = findId(url, provider, providerMethods[provider])
		if (!id) {
			console.info('Could not detect id from provider: %s; url: %s', provider, url)
		}
	}

	// 3. return a result object
	return { url, provider, id }
}

export {
	find
}

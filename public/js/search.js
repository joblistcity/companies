import {
    AlgoliaSearch,
    createAlgoliaScript
} from 'https://cdn.skypack.dev/joblist-algolia-search'

const init = async () => {
    try {
	await createAlgoliaScript()
    } catch (error) {
	console.log('Error inserting Algolia scripts')
	return
    }
    customElements.define('algolia-search', AlgoliaSearch)
    console.log('Inited algolia scripts, and algolia-search')
}

init()

export default {
    createAlgoliaScript,
    AlgoliaSearch
}


const nodeFetch = require('node-fetch')
const { createApi } = require('unsplash-js')
const debug = require('debug')('unsplash')

const unsplash = createApi({
  accessKey: 'bOm4lBhTiEfPzQgcoNXs2Pbc88lBFiPoCZfisuJD7E0',
  fetch: nodeFetch
});


async function getCollectionPhotos (collId,
	 urlExtra = url => url + '?q=90&w=960&h=960&fit=crop') {
	let currentPage = 1
	const photoUrls = []

	while (true) {
		debug('fetching ' + collId, ' page ' + currentPage)
		const result = await unsplash.collections.getPhotos({
			collectionId: collId,
			perPage: 30
		})
		debug('fetched')
		const response = result.response;

		if (response.results && response.results.length) {
			for (let photo of response.results) {
		    	const url = urlExtra(photo.urls.raw)
		    	photoUrls.push(url)
		    	debug('->', url)
		    }
		    currentPage ++
		} else {
			break
		}
	}    
 }


getCollectionPhotos('2437762')
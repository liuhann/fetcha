process.env.DEBUG = '*'
const nodeFetch = require('node-fetch')
const { createApi } = require('unsplash-js')
const debug = require('debug')('unsplash')
const { downloadList } = require('../utils')

const unsplash = createApi({
  accessKey: 'bOm4lBhTiEfPzQgcoNXs2Pbc88lBFiPoCZfisuJD7E0',
  fetch: nodeFetch
});

async function getCollectionPhotos (collId,
	 urlExtra = url => url + '&q=90&w=960&h=960&fit=crop') {
	let currentPage = 1
	const photoUrls = []

	while (true) {
		debug('fetching ' + collId, ' page ' + currentPage)
		const result = await unsplash.collections.getPhotos({
			collectionId: collId,
			page: currentPage,
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
	return photoUrls
 }


const collections = [{
	id: '2437762',
	author: 'Ethan Hunter',
	name: 'Hot Air Balloons'
}, {
	id: '2437762',
	author: 'Ethan Hunter',
	name: 'Hot Air Balloons'
}]
(async () => {
	const photos = await getCollectionPhotos('2437762')
	downloadList(photos, './Ethan Hunter')
})()

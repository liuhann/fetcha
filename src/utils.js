const MongoDBService = require('./mongodb')
async function getMongoColl () {
  const mds = new MongoDBService({
    url: 'mongodb://127.0.0.1:27017',
    dbName: 'picture'
  })

  await mds.connect()
  const imgColl = (await mds.getDb()).collection('images')
  return imgColl
}

// from https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
function fileExtension (fname) {
  return fname.slice((fname.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase()
}

async function sleep (mill) {
  return new Promise(resolve => {
      setTimeout(resolve, mill)
  })
}

module.exports = {
  sleep,
  fileExtension,
  getMongoColl
}

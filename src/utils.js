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

module.exports = {
  getMongoColl
}
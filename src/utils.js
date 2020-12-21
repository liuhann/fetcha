const MongoDBService = require('./mongodb')
const download = require('download')
const debug = require('debug')('utils')
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


async function downloadList (list, target, endFix) {

  let index = 1;
  for (let url of list) {
    // 下载到本地download目录
    debug('download url', url)
    await download(url, target, {
      filename: 'image-' + index + '.' + (endFix || 'jpg')
    })
    index ++
  }
}

function replaceSVGRatio (content) {
  if (content.indexOf('preserveAspectRatio')>-1) {
    return content.replace(/preserveAspectRatio="[^"]+"/, 'preserveAspectRatio="none"')
  } else {
    return content.replace(/<svg/, '<svg preserveAspectRatio="none"')
  }
}

module.exports = {
  replaceSVGRatio,
  downloadList,
  sleep,
  fileExtension,
  getMongoColl
}

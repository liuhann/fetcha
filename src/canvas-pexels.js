const path = require('path')
const fs = require('fs-extra')
const axios = require('axios')
const request = require('request')
const download  = require ('download')
const RestDAO = require('./restdao')
const { fileExtension, sleep } = require('./utils')

const dao = new RestDAO(axios.create({
  headers: {
    token: 'D0IX1ziF3nJ6UMgu'
  }
}), 'http://www.danke.fun/api/danke/public/image')

/**
 * 抽取har到image store, 对已经存在的则直接忽略
 * @param file canvas.cn上面截取的har
 * @returns {Promise<void>}
 */
async function extractFromFile (file, vendor) {
  let store = []
  try {
    store = await fs.readJson('./image-store.json')
  } catch (e) {
  }
  const read = await fs.readJson(file)
  const mediasRequests = read.log.entries.filter(entry => entry.request.url.startsWith('https://www.canva.cn/_ajax/search/media2-untokenized'))

  for (let mediaRequest of mediasRequests) {
    const jsonRead = JSON.parse(mediaRequest.response.content.text.substring(20))
    debugger
    mergeResponseToStore(store, jsonRead, vendor)
  }
  console.log('completed', store.length)

  await fs.writeJson('./image-store.json', store)
}


function mergeResponseToStore (store, response, vendor) {
  response.A.forEach(img => {
    const ll = img.V.reduce((lt,item) => {
      if (item.width > lt.width) {
        return item
      } else {
        return lt
      }
    }, {width: 0})
    const result = {
      tag: img.U,
      url: ll.url,
      width: ll.width,
      height: ll.height
    }
    vendorResult(result, img, vendor)
    if (store.filter(each => each.title === result.title).length == 0) {
      console.log('adding ', result.title)
      store.push(result)
    } else {
      console.log('ignore', result.title)
    }
  })
}


const vendorResult = (o, img, vendor) => {
  if (vendor === 'pexel') {
    Object.assign(o, {
      title: img.G
    })
  } else if (vendor === 'pixa') {
    Object.assign(o, {
      title: img.F
    })
  }
}

// 检查图片是否上传
const checkImageUploaded = async img => {
  const found = await dao.findOne({
    title: img.title
  })
  return found
}

// 上传一个单独的文件但shopen，包括记录和文件上传
const uploadAndCreateImage = async img => {
  const fileName = img.title + '.' + (fileExtension(img.url) || 'jpg')
  img.fileName = fileName
  // 下载到本地download目录
  await download(img.url, '../downloads/', {
    filename: fileName
  })
  try {
    const result = await uploadFile(fileName)
    img.canvasUrl = img.url
    img.url = JSON.parse(result).data.name
    // 创建对象
    await dao.create(img)
    console.log('image created', img.title)
    await sleep(500)
  } catch (e) {
    console.log(e)
  }
}


// only upload with local file name
const uploadFile = async fileName => {
  return new Promise((resolve, reject) => {
    request({
        method: 'POST',
        preambleCRLF: true,
        postambleCRLF: true,
        uri: `http://www.danke.fun/api/dankev3/image/upload?path=public/${fileName}&public=true`,
        multipart: [
          {
            'content-type': 'image/' + fileExtension(fileName),
            body: fs.createReadStream(path.resolve('../downloads/', fileName))
          }
        ]
      },
      function (error, response, body) {
        if (error) {
          reject(error)
        } else {
          resolve(body)
        }
      });
  })
}

/**
 * 同步 image-store 里面的标准图片到 danke，其中记录存放在 danke， 图片上传到cdn
 * @returns {Promise<void>}
 */
const syncPublicImages = async () => {
  let store = []
  try {
    store = await fs.readJson('./image-store.json')
  } catch (e) {
  }

  for (let i = 0; i < store.length; i++) {
    const img = store[i]
    const isUploaded = await checkImageUploaded(img)
    if (!isUploaded) {
      await uploadAndCreateImage(img)
      console.log('uploaded', img.title)
    }
    if (i > 30) {
      break
    }
  }
}

module.exports = {
  syncPublicImages,
  extractFromFile
}

const path = require('path')
const fs = require('fs-extra')
const axios = require('axios')
const request = require('request')
const download  = require ('download')
const RestDAO = require('../restdao')
const { fileExtension, sleep } = require('../utils')

const dao = new RestDAO(axios.create({
  headers: {
    token: 'D0IX1ziF3nJ6UMgu'
  }
}), 'http://www.danke.fun/api/danke/public/image')

const vectordao = new RestDAO(axios.create({
  headers: {
    token: 'D0IX1ziF3nJ6UMgu'
  }
}), 'http://www.danke.fun/api/danke/public/vector')


/**
 * 获取JSON文件中所有可用的图片实体
 * @param file  页面截取下载的HAR文件
 * @returns {Promise<[]>}
 */
async function getItemEntries (file) {
  const entries = []
  const read = await fs.readJson(file)

  const mediasRequests = read.log.entries.filter(entry => entry.request.url.startsWith('https://www.canva.cn/_ajax/search/media2-untokenized'))

  for (let mediaRequest of mediasRequests) {
    const jsonRead = JSON.parse(mediaRequest.response.content.text.substring(20))

    jsonRead.A.forEach(img => {
      entries.push(img)
    })
  }
  return entries
}

/**
 * 转换Canvas图片项目 - 自动检测
 * @param item
 * @returns {Promise<void>}
 */
function convertImageItemEntry (item) {
  const img = {}

  img.uid = item['B']
  img.title = item['G'] || item['F']
  img.tags = item['U']
  if (item['W'] === 'VECTOR') {
    img.type = 'vct' // vector
    let maxWidth = 0
    for (let preview of item['V']) {
      if (preview.url.endsWith('.svg')) {
        img.canvasUrl = preview.url
        img.w = preview.width
        img.h = preview.height
        break
      } else {
        if (preview.width > maxWidth && preview.watermarked !== true) {
          img.canvasUrl = preview.url
          maxWidth = preview.width
          img.w = preview.width
          img.h = preview.height
        }
      }
    }
    // 用svg path方式定义的
    if (item.g) {
      delete img.canvasUrl
      img.svg = {
        // 设置SVG实体内容
        vp: [item.g['A']['A'], item.g['A']['B'], item.g['A']['C'], item.g['A']['D']], // viewport
        ps: item.g['B'].map(path => ({ // path list
          p: path['A'], // path信息
          f: path['B']['C'] // fill Color
        }))
      }
      img.w = item.g['A']['C']
      img.h = item.g['A']['D']

    }
  } else {
    img.type = 'img' // raster
    let maxWidth = 0
    for (let preview of item['V']) {
      if (preview.width > maxWidth && preview.watermarked !== true) {
        img.canvasUrl = preview.url
        img.w = preview.width
        img.h = preview.height
        maxWidth = preview.width
      }
    }
  }
  return img
}

// 检查图片是否上传
const checkImageUploaded = async img => {
  if (img.type === 'img') {
    return await dao.findOne({
      uid: img.uid
    })
  } else if (img.type === 'vct') {
    return await vectordao.findOne({
      uid: img.uid
    })
  }
}


const uploadImage = async img => {
  if (img.canvasUrl) {
    const ext = fileExtension(img.canvasUrl)
    const fileName = img.uid + '.' + (ext || 'jpg')
    // 下载到本地download目录
    await download(img.canvasUrl, '../downloads/', {
      filename: fileName
    })
    try {
      const result = await uploadFile(fileName)
      img.url = JSON.parse(result).data.name
    } catch (e) {
      console.log(e)
    }
  }
  if (img.type === 'img') {
    await dao.create(img)
  } else if (img.type === 'vct') {
    await vectordao.create(img)
  }
}

// only upload with local file name
const uploadFile = async fileName => {
  return new Promise((resolve, reject) => {
    const ext = fileExtension(fileName)
    const folder = (ext === 'svg')? 'vectors': 'images'
    request({
        method: 'POST',
        preambleCRLF: true,
        postambleCRLF: true,
        uri: `http://www.danke.fun/api/dankev3/image/upload?path=public/${folder}/${fileName}&public=true`,
        multipart: [
          {
            'content-type': 'image/' + ext,
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



module.exports = {
  getItemEntries,
  uploadImage,
  convertImageItemEntry,
  checkImageUploaded
}

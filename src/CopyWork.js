const debug = require('debug')('copy')
const path = require('path')
const fs = require('fs-extra')
const axios = require('axios')
const request = require('request')
const download  = require ('download')
const RestDAO = require('./restdao')
const sizeOf = require('image-size')
const got = require('got')
module.exports = class CopyWork {
  constructor (props) {
    this.currentPage = 1
    this.dao = new RestDAO(axios.create({
      headers: {
        token: 'D0IX1ziF3nJ6UMgu'
      }
    }), 'http://www.danke.fun/api/danke/public/image')

    this.vectordao = new RestDAO(axios.create({
      headers: {
        token: 'D0IX1ziF3nJ6UMgu'
      }
    }), 'http://www.danke.fun/api/danke/public/vector')

    this.deleteddao = new RestDAO(axios.create({
      headers: {
        token: 'D0IX1ziF3nJ6UMgu'
      }
    }), 'http://www.danke.fun/api/danke/public/deleted')
  }



// from https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
  fileExtension (fname) {
    return fname.slice((fname.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase()
  }
  async uploadImage (img) {
    const imageUrl = this.getImageUrl(img)
    if (imageUrl) {
      const ext = this.fileExtension(imageUrl)
      const fileName = img.uid + '.' + (ext || 'jpg')
      // 下载到本地download目录
      await download(imageUrl, '../downloads/', {
        filename: fileName
      })
      if (!img.w) {
        const dimensions = sizeOf('../downloads/' + fileName);
        img.w = dimensions.width
        img.h = dimensions.height
      }
      try {
        const result = await this.uploadFile(fileName)
        img.url = JSON.parse(result).data.name
      } catch (e) {
        console.log(e)
      }
    }
    if (img.type === 'img') {
      await this.dao.create(img)
    } else if (img.type === 'vct') {
      await this.vectordao.create(img)
    }
  }

// only upload with local file name
  async uploadFile (fileName) {
    return new Promise((resolve, reject) => {
      const ext = this.fileExtension(fileName)
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


// 检查图片是否上传
  async checkImageUploaded(img) {
    const deleted = await this.deleteddao.findOne({
      uid: img.uid
    })
    if (deleted) {
      debug('deleted ', img.uid, img.title)
      return deleted
    }
    if (img.type === 'img') {
      return await this.dao.findOne({
        uid: img.uid
      })
    } else if (img.type === 'vct') {
      return await this.vectordao.findOne({
        uid: img.uid
      })
    }
  }

  async fetchPageItems() {}
  convertImageItemEntry (item) {}
  getImageUrl (img) {}

  async run () {
    let total = 0
    let uploaded = 0
    let skipped = 0
    while (true) {
      const items = await this.fetchPageItems()
      total += items.length
      if (items.length === 0) break
      for (let item of items) {
        const img = this.convertImageItemEntry(item)
        try {
          const checkFound = await this.checkImageUploaded(img)
          if (checkFound) {
            if (checkFound.title) {
              debug('☺ 图片已经上传', img.uid, img.title,  `${uploaded}/${total}`)
            } else {
              debug('× 图片已经删除', img.uid,  `${uploaded}/${total}`)
            }
            skipped ++
            continue
          }
          await this.uploadImage(img)
          uploaded ++
          debug('√ 图片上传完成', img.uid, img.title, `${skipped}/${uploaded}/${total}`)
        } catch (e) {
          debug('处理异常-->', e)
        }
      }
      this.currentPage ++
    }
  }

}

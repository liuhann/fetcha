process.env.DEBUG='canvas'
const { getItemEntries, convertImageItemEntry, checkImageUploaded, uploadImage } = require('./utils')
const { sleep } = require('../utils')
const debug = require('debug')('canvas')

async function extractCanvasImageAndUpload (har) {
  const entries = await getItemEntries(har)
  debug (`Total ${entries.length} entries`)
  for (let entry of entries) {
    try {
      const img = convertImageItemEntry(entry)
      const uploaded = await checkImageUploaded(img)
      if (!uploaded) {
        await uploadImage(img)
        debug('图片上传完成', img.uid, img.title)
      } else {
        debug('图片已经存在', img.uid, img.title)
      }
    } catch (e) {
      console.log('图片处理错误：' , e, entry)
    }
    await sleep(500 + Math.random() * 500)
  }
}


extractCanvasImageAndUpload('d:/防疫专题.har')

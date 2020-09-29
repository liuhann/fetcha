process.env.DEBUG='canvas'
const { getItemEntries, convertImageItemEntry, checkImageUploaded, uploadImage } = require('./utils')
const { sleep } = require('../utils')
const debug = require('debug')('canvas')

async function extractCanvasImageAndUpload (har) {
  const entries = await getItemEntries(har)
  debug (`Total ${entries.length} entries`)
  let i = 1
  let uploadCount = 0
  let duplicated = 0
  for (let entry of entries) {
    try {
      const img = convertImageItemEntry(entry)
      if (!img) continue
      const uploaded = await checkImageUploaded(img)
      if (!uploaded) {
        await uploadImage(img)
        uploadCount ++
        debug(i, '√ 图片上传完成', img.uid, img.title)
      } else {
        duplicated ++
        debug(i, '× 图片已经存在', img.uid, img.title)
      }
    } catch (e) {
      console.log('图片处理错误：' , e, entry)
    }
    await sleep(500 + Math.random() * 500)
    i ++
  }

  debug('所有图片已经处理完成 成功 %d, 重复跳过 %d', uploadCount, duplicated)
}


extractCanvasImageAndUpload('d:/花丛.har')

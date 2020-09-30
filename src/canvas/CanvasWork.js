const CopyWork = require('../CopyWork')
const path = require('path')
const fs = require('fs-extra')
const axios = require('axios')
const request = require('request')
const download  = require ('download')
const RestDAO = require('../restdao')
const debug = require('debug')('canvas')

module.exports = class CanvasWork extends CopyWork {

  constructor ({ har }) {
    super()
    this.har = har
  }

  async fetchPageItems() {
    if (!this.har) {
      return []
    }
    const entries = []
    const read = await fs.readJson(this.har)
    this.har = null
    const mediasRequests = read.log.entries.filter(entry => entry.request.url.startsWith('https://www.canva.cn/_ajax/search/media2-untokenized'))

    for (let mediaRequest of mediasRequests) {
      if (!mediaRequest.response.content.text) continue
      const jsonRead = JSON.parse(mediaRequest.response.content.text.substring(20))

      jsonRead.A.forEach(img => {
        entries.push(img)
      })
    }
    return entries
  }

  /**
   * 转换图片项目 - 自动检测
   * @param item
   * @returns {Promise<void>}
   */
  convertImageItemEntry (item) {
    const img = {}

    if (item['D'] === 'STICKER') {
      // 动画暂时不处理
      return null
    }
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
          vp: [item.g['A']['A'], item.g['A']['B'], item.g['A']['D'], item.g['A']['C']], // viewport
          ps: item.g['B'].map(path => ({ // path list
            p: path['A'], // path信息
            f: path['B']['C'] // fill Color
          }))
        }
        img.w = item.g['A']['D']
        img.h = item.g['A']['C']
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
    img.type = 'vct' // vector
    return img
  }

  getImageUrl (img) {
    return img.canvasUrl
  }
}

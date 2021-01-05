/**
 * 去掉目录下svg文件的 width\height 并设置所有 preserveAspectRatio="none"
 * @type {string}
 */
process.env.DEBUG='copy,work,canvas'
const BaseWork = require('../BaseWork')
const { replaceSVGRatio } = require('../utils')

const work = new BaseWork({
 dir: './basic-shape'
})

work.eachFile(content => {
 return replaceSVGRatio(content)
})


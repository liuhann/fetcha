process.env.DEBUG='copy,work,canvas'
const SVGWork = require('./SvgWork')
const BaseWork = require('../BaseWork')
const { replaceSVGRatio } = require('../utils')

// const work = new SVGWork({
//  har : 'd:/temp.har',
//  dir: './brush'
// })
// work.run()
//
const work = new BaseWork({
 har : 'd:/temp.har',
 dir: './svg-brush'
})

work.eachFile(content => {
 return replaceSVGRatio(content)
})


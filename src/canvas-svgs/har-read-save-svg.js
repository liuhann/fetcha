process.env.DEBUG='copy,work,canvas'
const SVGWork = require('./SvgWork')

const work = new SVGWork({
 har : 'd:/temp.har',
 dir: './temp-texture'
})
work.run()


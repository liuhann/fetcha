process.env.DEBUG='copy,work,canvas'
const SVGWork = require('./SvgWork')

// weibo work

const work = new SVGWork({
 har : 'd:/temp.har'
})

work.run()

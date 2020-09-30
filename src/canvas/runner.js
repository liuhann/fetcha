process.env.DEBUG='copy,work,canvas'
const CanvasWork = require('./CanvasWork')

// weibo work

const work = new CanvasWork({
 har : 'd:/temp.har'
})

work.run()

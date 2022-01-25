const fs = require('fs-extra')
const htmlparser2 = require("htmlparser2")
const iconv = require('iconv-lite')

class HTMLParser {

  parse(url) {
    let readStr = iconv.decode(fs.readFileSync(url), 'GB2312')
    console.log(readStr);
  }
}


const hp = new HTMLParser()

hp.parse('E:\\迅雷下载\\2021年1024社区BT合集总汇\\03月合集\\21-03-02-00-59-43.html')
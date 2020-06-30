const got = require('got')
const download = require('download')
const fs = require('fs')
const { getMongoColl } = require('./utils')

async function gotSonyClockPictures (dist) {
  const response = await got('https://www.sony.net/united/clock/assets/js/heritage_data.js')

  const coll = await getMongoColl()
  eval(response.body)

  // 获取到67个拍摄地点信息
  // console.log(a_clock_heritage_data)

  for (let place of a_clock_heritage_data) {
    const name = place.id

    console.log('start ' + name)

    // 下载每个地点12张照片
    for (let i = 1; i <= 12; i++) {
      const imgOrder = String(i).padStart(2, '0')
      const fileName = imgOrder + '.jpg'
      // 这个是照片地址
      const fileUrl = `https://www.sony.net/united/clock/share/img/photo/${name}/fp_hd/${fileName}`
      await coll.update({
        image_id: 'sony-' + name + '-' + imgOrder
      }, {
        path: dist + '/' + name,
        image_id: 'sony-' + name + '-' + imgOrder,
        caption: place.name.zh + '#' + place.fp[imgOrder].substr(0,2) + ':' + place.fp[imgOrder].substr(2,4),
        lat: parseFloat(place.latitude),
        long: parseFloat(place.longitude),
        url: fileUrl
      }, {
        upsert: true
      })
      if (!fs.existsSync(dist + '/' + name + `/` + fileName)) {
        console.log('fetching ' + fileUrl)
        await download(fileUrl, dist + '/' + name)
      }
    }
  }
}

gotSonyClockPictures('./sony/clock')
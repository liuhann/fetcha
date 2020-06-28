const got = require('got')
const download = require('download')
const fs = require('fs')

async function gotSonyClockPictures (dist) {
  const response = await got('https://www.sony.net/united/clock/assets/js/heritage_data.js')

  eval(response.body)

  // 获取到67个拍摄地点信息
  console.log(a_clock_heritage_data)

  for (let place of a_clock_heritage_data) {
    const name = place.id

    console.log('start ' + name)

    // 下载每个地点12张照片
    for (let i = 1; i <= 12; i++) {
      if (!fs.existsSync(dist + '/' + name + `/${String(i).padStart(2, '0')}.jpg`)) {
        // 这个是照片地址
        const fileUrl = `https://www.sony.net/united/clock/share/img/photo/${name}/fp_hd/${String(i).padStart(2, '0')}.jpg`
        console.log('fetching ' + fileUrl)
        await download(`https://www.sony.net/united/clock/share/img/photo/${name}/fp_hd/${String(i).padStart(2, '0')}.jpg`, dist + '/' + name)
      }
    }
  }
}

gotSonyClockPictures('./sony/clock')
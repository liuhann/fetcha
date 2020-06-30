const got = require('got')
const download = require('download')
const fs = require('fs')
const { getMongoColl } = require('./utils')


// 按微博用户和相册专辑获取所有图片到本地
async function fetchWeiboAlbum (userId, albumId, cookie, dist) {
  let page = 10

  const imgColl = await getMongoColl()

  // 分页处理 下载每一页
  while (await fetchAlbumPage(userId, albumId, page, cookie, dist, imgColl)) {
    page ++
  }
}


async function fetchAlbumPage (userId, albumId, page, cookie, dist, imgColl) {
  const url = `https://photo.weibo.com/photos/get_all?uid=${userId}&album_id=${albumId}&count=30&page=${page}&type=3`
  
  console.log('fetching page', url)

  // 获取一页下的图片， 这里需要提供weibo的cookie
  const response = await got(url, {
    responseType: 'json',
    headers: {
      cookie: cookie
    }
  })

  const paging = response.body.data

  let ignoreCount = 0
  for (let photo of paging.photo_list) {
    const picName = photo.pic_name
     // 这个是照片地址
    const fileUrl = `https://wx3.sinaimg.cn/large/${picName}`

    // 处理插入 upsert
    if (imgColl) {
      await imgColl.update({
        image_id: 'weibo-' + picName
      }, {
        path: dist,
        image_id: 'weibo-' + picName,
        caption: photo.caption_render,
        t: new Date(photo.timestamp * 1000),
        url: fileUrl
      }, {
        upsert: true
      })
    }
    if (!fs.existsSync(dist + '/' + picName)) {
      console.log('fetching ' + picName)
      await download(fileUrl, dist)
    } else {
      ignoreCount ++
      console.log('ignore ' + picName)
    }
  }

  console.log(paging.photo_list.length + ' picture downloaded')
  if (paging.photo_list.length === 0) {
    return false
  } else {
    return true
  }
}

const COOKIE = 'SINAGLOBAL=3932756360715.0483.1530498967014; _ga=GA1.2.1789688452.1533018791; __gads=ID=a92d8a56c95ddee9:T=1533018792:S=ALNI_MZPGrMgPKMJiDGGBO0s5DDzapitow; UOR=club.huawei.com,widget.weibo.com,login.sina.com.cn; wvr=6; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WhfHqWFzgG5wGA1wWc1E_uz5JpX5KMhUgL.Foz01hBcSo5peK52dJLoIEBLxKqL1KqL1hMLxKML1K5L1hqLxKnL1h5L1h2LxKML1KBL1-qt; ALF=1625023097; SSOLoginState=1593487098; SCF=AnMQqno_SA3t0EjrfvRVQYOFyBCUgGcZZMuG2gd4RC1oyz7LRpqe9xyk5dpB7Ne_ylLicMFJO84qQxSpF8SHb2k.; SUB=_2A25z_t6tDeRhGeRN41YX9i7NyjyIHXVQjbdlrDV8PUNbmtANLWPTkW9NU4FmkzqBEAAB1t8lgHN4ZbAz2y1vJk6y; SUHB=0cSm5Jo-GtDaAZ; _s_tentry=login.sina.com.cn; Apache=8947282801972.963.1593487107226; ULV=1593487107340:87:22:3:8947282801972.963.1593487107226:1593391018150; webim_unReadCount=%7B%22time%22%3A1593494351469%2C%22dm_pub_total%22%3A0%2C%22chat_group_client%22%3A0%2C%22chat_group_notice%22%3A0%2C%22allcountNum%22%3A0%2C%22msgbox%22%3A0%7D'

// fetchWeiboAlbum('3911906785', '3683090382875326', COOKIE, 'weibo/album/梁木辛')
fetchWeiboAlbum('2001314285', '3576180035969481', COOKIE, 'weibo/album/黎不朽')


const got = require('got')
const download = require('download')
const fs = require('fs')


async function fetchWeiboAlbum (userId, albumId, cookie, dist) {
  let page = 1
  while (await fetchAlbumPage(userId, albumId, page, cookie, dist)) {
    page ++
  }
}


async function fetchAlbumPage (userId, albumId, page, cookie, dist) {
  const url = `https://photo.weibo.com/photos/get_all?uid=${userId}&album_id=${albumId}&count=30&page=${page}&type=3`
  
  console.log('fetching page', url)
  const response = await got(url, {
    responseType: 'json',
    headers: {
      cookie: cookie
    }
  })

  const paging = response.body.data


  for (let photo of paging.photo_list) {
    const picName = photo.pic_name
    if (!fs.existsSync(dist + '/' + picName)) {
      // 这个是照片地址
      const fileUrl = `https://wx3.sinaimg.cn/large/${picName}`
      console.log('fetching ' + picName)
      await download(fileUrl, dist)
    } else {
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


const COOKIE = 'SINAGLOBAL=3932756360715.0483.1530498967014; _ga=GA1.2.1789688452.1533018791; __gads=ID=a92d8a56c95ddee9:T=1533018792:S=ALNI_MZPGrMgPKMJiDGGBO0s5DDzapitow; UOR=club.huawei.com,widget.weibo.com,login.sina.com.cn; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WhfHqWFzgG5wGA1wWc1E_uz5JpX5KMhUgL.Foz01hBcSo5peK52dJLoIEBLxKqL1KqL1hMLxKML1K5L1hqLxKnL1h5L1h2LxKML1KBL1-qt; ALF=1624848336; SSOLoginState=1593312337; SCF=AnMQqno_SA3t0EjrfvRVQYOFyBCUgGcZZMuG2gd4RC1o4yyftThBBWjM5AedXvNQ6X9QH2cl9OGTuOcmx_1OOk4.; SUB=_2A25z_HQEDeRhGeRN41YX9i7NyjyIHXVQiOLMrDV8PUNbmtANLRLxkW9NU4FmkwBZ2vuhX1Y61GgXn69f0zlvFh3A; SUHB=0BLpl8BvqS1HTe; wvr=6; _s_tentry=login.sina.com.cn; Apache=9842718627416.283.1593312343154; ULV=1593312343249:85:20:1:9842718627416.283.1593312343154:1592966433844; WBStorage=42212210b087ca50|undefined; webim_unReadCount=%7B%22time%22%3A1593313188338%2C%22dm_pub_total%22%3A0%2C%22chat_group_client%22%3A0%2C%22chat_group_notice%22%3A0%2C%22allcountNum%22%3A1%2C%22msgbox%22%3A0%7D'

fetchWeiboAlbum('3911906785', '3683090382875326', COOKIE, 'weibo/album/梁木辛')


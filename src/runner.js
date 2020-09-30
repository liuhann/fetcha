process.env.DEBUG='copy,weibo'
const WeiboWork = require('./weibo/WeiboWork')

// weibo work

const WEIBO_COOKIE = 'SINAGLOBAL=7444182573808.214.1599456738036; UOR=,,login.sina.com.cn; wvr=6; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WhfHqWFzgG5wGA1wWc1E_uz5JpX5K-hUgL.Foz01hBcSo5peK52dJLoIEBLxKqL1KqL1hMLxKML1K5L1hqLxKnL1h5L1h2LxKML1KBL1-qt; SCF=Avg7A24DqEGxggWg7es7UdAX39-zakzwi_N5LZfZFG6fOJ6t5WsVCkov213VgSgqlnFa_2AIYRtB4wwFVk1Wnw4.; SUB=_2A25yd6AZDeRhGeRN41YX9i7NyjyIHXVRBJbRrDV8PUJbmtANLWrHkW9NU4Fmk0DoTMf0CSILA9-l8p1yYkFqMCGm; SUHB=0ebsnGJDJMqcFY; ALF=1632961477; SSOLoginState=1601425481; _s_tentry=login.sina.com.cn; Apache=9580041071708.129.1601425486701; ULV=1601425486754:17:17:4:9580041071708.129.1601425486701:1601362333699; WBStorage=70753a84f86f85ff|undefined; webim_unReadCount=%7B%22time%22%3A1601431129570%2C%22dm_pub_total%22%3A0%2C%22chat_group_client%22%3A0%2C%22chat_group_notice%22%3A0%2C%22allcountNum%22%3A1%2C%22msgbox%22%3A0%7D'
const weiboWork = new WeiboWork({
  userId: '5284966736',
  albumId: '3751515106024067',
  cookie: WEIBO_COOKIE,
  tags: ['旅行家小胡胡', '微博', '旅行', '风景'],
  start: 76
})

weiboWork.run()

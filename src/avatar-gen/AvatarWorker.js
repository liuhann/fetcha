process.env.DEBUG = 'avatar'
const puppeteer = require('puppeteer')
const path = require('path')
const EventEmitter = require('events')
const debug = require('debug')('avatar')
const request = require('request')
const fs = require('fs-extra')
const axios = require('axios')
const { sleep } = require('../utils')
const instance = axios.create({
    headers: {
        token: 'D0IX1ziF3nJ6UMgu'
    }
})

async function uploadFile (filePath, id) {
    return new Promise((resolve, reject) => {
        request({
                method: 'POST',
                preambleCRLF: true,
                postambleCRLF: true,
                uri: `http://www.danke.fun/api/dankev3/image/upload?path=avatar/${id}.png&public=true`,
                multipart: [
                    {
                        'content-type': 'image/png',
                        body: fs.createReadStream(filePath)
                    }
                ]
            },
            function (error, response, body) {
                if (error) {
                    reject(error)
                } else {
                    resolve(body)
                }
            });
    })
}

(async () => {
    const browser = await puppeteer.launch()
    const ee = new EventEmitter()
    const page = await browser.newPage()
    page.setViewport({
        width: 960,
        height: 960
    })
    page.exposeFunction('avatarReady', async (e) => {
        ee.emit('page-loaded', e)
    });
    debug('puppeteer started')
    while (true) {
        try {
            const response = await instance.get(`http://www.danke.fun/api/danke/avatar/queue`)
            let follow = response.data.data.follow
            if (follow) {
                debug('Follow Gen :' , follow)
                await new Promise(async resolve => {
                    page.goto('http://localhost/work/follow/' + follow);
                    ee.once('page-loaded', async () => {
                        const filePath = path.resolve(__dirname, follow + '-example.png')
                        await page.screenshot({path: filePath})
                        const uploadResult = await uploadFile(filePath, follow)
                        const url = JSON.parse(uploadResult).data.name
                        debug('fileUploaded ', url)
                        await instance.get(`http://www.danke.fun/api/danke/avatar/ready?id=` + follow + '&snapshot=' + url)
                        resolve()
                    })
                })
                debug('resolved')
            }
        } catch (e) {
            console.log('error:skip to next')
        }
        await sleep(500)
    }
})()
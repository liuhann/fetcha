process.env.DEBUG = 'avatar'
const puppeteer = require('puppeteer')
const path = require('path')
const EventEmitter = require('events')
const debug = require('debug')('avatar')
const request = require('request')
const fs = require('fs-extra')
const config = require('../../config')
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
                uri: `http://www.danke.fun/api/dankev3/image/upload?path=snapshot/${id}.png&public=true`,
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
module.exports = async function (app) {
    const browser = await puppeteer.launch()
    const ee = new EventEmitter()
    const page = await browser.newPage()
    page.exposeFunction('avatarReady', async (e) => {
        ee.emit('page-loaded', e)
    });
        
    debug('puppeteer started');

    (async () => {
        while (true) {
            try {
                const response = await instance.get(`http://www.danke.fun/api/danke/preview/queue`)
                let { workId, viewBox } = response.data.data
                if (workId && viewBox) {
                    debug('Follow Gen :' , workId, viewBox)
                    page.setViewport({
                        width: parseInt(viewBox.width) || 360,
                        height: parseInt(viewBox.height) || 360
                    })
                    await Promise.race([new Promise(async resolve => {
                        page.goto(`http://localhost:${config.port}/work/snapshot/${workId}`);
                        ee.once('page-loaded', async () => {
                            await sleep(300)
                            const filePath = path.resolve(__dirname, workId + '-example.png')
                            await page.screenshot({path: filePath, omitBackground: true})
                            const uploadResult = await uploadFile(filePath, workId)
                            const url = JSON.parse(uploadResult).data.name
                            debug('fileUploaded ', url)
                            await instance.get(`http://www.danke.fun/api/danke/preview/ready?id=` + workId + '&snapshot=' + url)
                            fs.unlink(filePath)
                            resolve()
                        })
                    }), sleep(20000)])
                    debug('resolved')
                }
            } catch (e) {
                console.log(e)
                console.log('error:skip to next')
            }
            await sleep(500)
        }
    })()
}
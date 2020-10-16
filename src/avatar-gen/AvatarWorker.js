const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setViewport({
        width: 960,
        height: 960
    })
    await page.goto('http://localhost/capture/image/20WCy4Mk62');

    page.on('domcontentloaded', async () => {
        await page.screenshot({path: 'example.png'});
    })
})();
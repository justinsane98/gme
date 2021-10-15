const puppeteer = require('puppeteer');
const fs = require('fs');

(async function scrape() {
    const baseUrl = "https://www.gamestop.com/search/"
    const timeout = 60000;
    const itemsPerPage = 100;
    const query = "new"
    const startingItem = 0
    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36');
    await page.setDefaultNavigationTimeout(timeout);
    // PAGE
    await page.goto(baseUrl + '?lang=default&q=' + query +'&start='+ startingItem +'&sz='+ itemsPerPage);

    // STARTING SELECTOR
    await page.waitForSelector('.product-grid');
    let data = await page.evaluate(() => {
        let elem = document.body.querySelectorAll('.product-grid .product-tile');
        let data = Object.values(elem).map(x => {
            return {
                name: x.querySelector('.product-tile-link').title ?? null,
                link: x.querySelector('.product-tile-link').href ?? null,
                sku: x.dataset.pid ?? null,
            }
        });
        return data;
    });
    console.log(data);
    console.log("*********************************");
    console.log("PRODUCTS: " + data.length);
    console.log("*********************************");

    let dataJson = JSON.stringify(data)

    // FILENAME
    fs.writeFileSync('./data/' + query + "-" + startingItem + "-"+ (startingItem+itemsPerPage) + '.json',dataJson);
    await browser.close();

})();

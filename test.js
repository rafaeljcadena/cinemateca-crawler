const puppeteer = require('puppeteer');

async function getPic() {
  const browser = await puppeteer.launch();
  // const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 2000, height: 1000 })
  await page.goto('https://www.google.com');
  await page.screenshot({ path: 'google.png' });

  await browser.close();
}

getPic();
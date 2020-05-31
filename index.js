const puppeteer = require('puppeteer');

async function scrape() {
  console.log('Iniciando')
  const browser = await puppeteer.launch()
  // const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage();
  await page.goto('http://cinematecapernambucana.com.br/acervo/filmes/', { waitUntil: 'domcontentloaded' })
  await page.setViewport({ width: 1600, height: 770 })

  const paginationHandler = await page.$('#post-215 > div > div.paginacao');
  const paginationListCount = await paginationHandler.evaluate(node => node.children.length)
  // console.log('paginationListCount:', paginationListCount)

  let links = []
  await page.waitFor(1000);
  
  for (let index = 1; index <= paginationListCount; index++) {
    const pageHandler = await page.$(`#post-215 > div > div.paginacao > a:nth-child(${index})`)
    pageHandler.click()

    await page.waitFor(1000);

    const listLinksHandler = await page.$('#post-215 > div > ul')
    const items = await listLinksHandler.evaluate(node => Array.from(node.children).map(l => {
      if (l.children[0]) return l.children[0].getAttribute('href')
    }))
    links = [...links, ...items.filter(i => i)]
  }

  const fetchContent = require('./fetchContent')
  const contents = await fetchContent(page, links)

  browser.close();
  return contents
}

function exportToCSV(contents){
  let rows = ''
  for (let content of contents) {
    let row = Object.values(content).join("\t")
    rows = rows + row + "\n"
  }

  let headers = ["Título", "Sinopse", "Link"].join("\t");
  let writeStream = headers + "\n" + rows

  let fs = require("fs");
  
  new Promise((resolve, reject) => {
    fs.writeFile('file.csv', writeStream, function (err) {
      if (err) return reject(err)
      resolve(console.log('CSV Exportado!'))
    });
  })
}

scrape().then(async (contents) => {
  
  await exportToCSV(contents)

  console.log('Finalizado!')
  console.log(contents)
}).catch(err => {
  throw err
})
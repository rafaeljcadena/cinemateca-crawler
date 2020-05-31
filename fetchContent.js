async function fetchContent(page, links){
  const data = []

  for (let index = 0; index < links.length; index++) {
    const link = links[index];
    await page.goto(link, { waitUntil: 'domcontentloaded' })
    const contents = await page.evaluate(() => {

      // Posição da sinopse pode variar
      const fetchSinopse = () => {
        let sinopse = '';
        for (let index = 5; index < 15; index++) {
          const element = document.querySelector(`#post-372 > div > p:nth-child(${index})`);

          let text = ''
          if(element){
            text = element.innerText
          }

          if (/Sinopse:/.test(text)) {
            sinopse = text
            break
          }

        }

        return sinopse
      }

      let title = document.querySelector('#post-372 > header > h1').innerText;
      let sinopse = fetchSinopse()

      let availableMessage = document.querySelector('#post-372 > div > p:nth-child(4)').innerText;
      
      if (!/Esse filme só pode ser assistido/.test(availableMessage)) {
        sinopse = sinopse.split("\n").join('')
        return { title, sinopse: sinopse.split('Sinopse:')[1] || ' '  }
      }

      return null
    })

    if (contents) {
      data.push({ ...contents, link })
    }
  }

  return data
}

module.exports = fetchContent
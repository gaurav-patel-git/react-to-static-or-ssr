import express from 'express'
import compression from 'compression'
import path from 'path'
import fs from 'fs'

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { renderRoutes, matchRoutes } from 'react-router-config'
import routes from '../../src/routes'

// @ts-ignore
import { JssProvider, SheetsRegistry } from 'react-jss'

import { Helmet } from 'react-helmet'
import indexHtml from '../lib/indexHtml'
import { StoreProvider } from '../../src/store/store'

let assets

const port = process.env.PORT || 3070
const app = express()

app.use(compression())

app.use('/static', express.static(path.resolve(__dirname, '../../dist/static')))

app.get('*', (req, res) => {
  // remove trailing slash
  let trailingSlashRegex = /\/$/
  if (req.path !== '/' && req.path.match(trailingSlashRegex)) {
    return res.redirect(req.path.replace(trailingSlashRegex, ''))
  }

  // serve the html without .html extenstion
  let url = req.path === '/' ? 'index' : req.path
  fs.readFile(path.resolve(__dirname, `../../dist/${url}.html`), 'utf8', (err, data) => {
    if (err) res.status(404).send('404_PAGE')
    return res.send(data)
  })
})

const generateStaticHtml = async () => {
  const context: { url?: string } = {}

  const rootUrl = '/'

  let pagesToCrawl: { url: string; crawled: boolean }[] = [{ url: rootUrl, crawled: false }]

  const remainingPagesToCrawl = () => {
    return pagesToCrawl.filter(url => !url.crawled).length
  }

  while (remainingPagesToCrawl() > 0) {
    const uncrawledUrls = pagesToCrawl.filter(url => {
      return !url.crawled
    })
    const url = uncrawledUrls[0].url
    pagesToCrawl.forEach(page => {
      if (page.url === url) page.crawled = true
    })

    const sheets = new SheetsRegistry()

    // load async data
    const promises = matchRoutes(routes, url).map(({ route }) => {
      return route.loadData ? route.loadData() : null
    })

    // wait for all promises to load
    // and get all states from the async fetch requests
    let initialState = {}
    await Promise.all(promises)
      .then(results => {
        results.forEach(state => {
          if (state !== null) {
            if (Array.isArray(state)) {
              state.forEach(s => {
                initialState = { ...initialState, ...s }
              })
            } else initialState = { ...initialState, ...state }
          }
        })
      })
      .catch(error => console.error('ERROR: Promise.all(): ' + error.message))

    const html = ReactDOMServer.renderToString(
      <JssProvider registry={sheets}>
        <StoreProvider initialState={initialState}>
          <StaticRouter location={url} context={context}>
            {renderRoutes(routes)}
          </StaticRouter>
        </StoreProvider>
      </JssProvider>
    )

    const helmet = Helmet.renderStatic()

    const ensureDirectoryExistence = filePath => {
      var dirname = path.dirname(filePath)
      if (fs.existsSync(dirname)) {
        return true
      }
      ensureDirectoryExistence(dirname)
      fs.mkdirSync(dirname, { recursive: true })
    }

    // const filename = url === '/' ? 'index.html' : `${url}/index.html`
    const filename = url === '/' ? 'index.html' : `${url}.html`
    const filePath = path.resolve(__dirname, `../../dist/${filename}`)
    ensureDirectoryExistence(filePath)
    fs.writeFile(filePath, indexHtml(html, assets, sheets, helmet, initialState), err => {
      if (err) {
        return console.log(err)
      }
    })

    // display all links to crawl
    const internalLinkRegexp = /href="(\/[\d\w\/-]+)"/gm
    let match = internalLinkRegexp.exec(html)
    while (match !== null && typeof match[1] === 'string') {
      const detectedUrl = match[1]
      // @ts-ignore
      if (pagesToCrawl.filter(page => page.url === detectedUrl).length === 0)
        pagesToCrawl.push({ url: detectedUrl, crawled: false })

      match = internalLinkRegexp.exec(html)
    }

    if (context.url) console.log('Handle redirect to ' + context.url)
  }
}

fs.readFile(path.resolve(__dirname, '../../dist/assets.json'), 'utf8', (err, data) => {
  if (err) throw err
  assets = JSON.parse(data)
  generateStaticHtml()
  app.listen(port, () => {
    console.log('static server listening on http://localhost:' + port)
  })
})

require('module-alias/register')

require('dotenv').config({
  path: './server/.env'
})

const http = require('http')
const express = require('express')
const morgan = require('morgan')
const multiparty = require('multiparty')
const stream = require('stream')
const tar = require('tar-fs')
const config = require('@server/config')

const app = express()
const registerDNS = require('@server/registerDNS')

app.use(morgan('dev')) // requests logger

app.get('/', (_, res) => {
  res.json({ test: 'Hello world from static-publisher api' })
})

app.post('/api/push', (req, res, next) => {
  const form = new multiparty.Form()
  form.parse(req, async (err, fields, _) => {
    if (err) next(err)
    else if (!fields.assets || !fields.root || !fields.domain) {
      const paramErr = new Error('Missing parameter(s)')
      paramErr.statusCode = 400
      next(paramErr)
    } else {
      const receivedBuffer = fields.assets[0]
      console.log('received', receivedBuffer.length)

      const receivedStream = new stream.PassThrough()
      receivedStream.end(receivedBuffer)

      // Extract tar and create folder in /var/www/subdomains/[subdomain] or update /var/www/default (for root domain)
      const extractPath = fields.root
        ? config.NGINX.ROOT_DOMAIN_FOLDER
        : config.NGINX.SUB_DOMAINS_FOLDER

      receivedStream.pipe(tar.extract(extractPath)).on('finish', () => {
        res.json({ res: 'Uploaded' })
      })

      await registerDNS()
      // Reload nginx ?
      // Wait for DNS propagation
    }
  })
})

// Middleware error handler
app.use((err, req, res, _) => {
  console.error(err.message)
  const code = err.statusCode || 500
  res.status(code).json({
    code,
    message: err.message
  })
})

http.createServer(app).listen(config.PORT, () => {
  console.log(`Express server listening on ${config.PORT}`)
})

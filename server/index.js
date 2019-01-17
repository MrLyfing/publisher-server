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
const boom = require('boom')
const { PORT, NGINX, ROOT_DOMAIN_NAME } = require('@server/config')

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
    else if (
      // Check parameters existence
      !fields.assets ||
      (fields.root && fields.subdomain) ||
      (!fields.root && !fields.subdomain)
    ) {
      next(boom.badRequest('Form data is incorrect'))
    } else {
      // Fields values returned by multiparty are array types
      const [receivedBuffer, root] = [fields.assets[0], !!(fields.root && fields.root[0])]
      let extractPath
      let finalDomainName
      if (root) {
        extractPath = NGINX.ROOT_DOMAIN_FOLDER
        finalDomainName = ROOT_DOMAIN_NAME
      } else {
        const subdomain = fields.subdomain[0]
        // Register new DNS record if assets are not pushed on root domain
        try {
          const resDNS = await registerDNS(subdomain)
          console.log(`[DIGITAL_OCEAN_API]: ${resDNS}`)
        } catch (errDNS) {
          next(errDNS)
          return
        }
        extractPath = `${NGINX.SUB_DOMAINS_FOLDER}/${subdomain}`
        finalDomainName = `${subdomain}.${ROOT_DOMAIN_NAME}`
      }

      const receivedStream = new stream.PassThrough()
      receivedStream.end(receivedBuffer)
      receivedStream
        .pipe(tar.extract(extractPath))
        .on('error', errStream => {
          next(errStream)
        })
        .on('finish', () => {
          // Extract tar and move assets to SUB_DOMAINS_FOLDER or update ROOT_DOMAIN_FOLDER (for root domain)
          res.json({
            statusCode: 200,
            message: `Assets were succesfully deployed on "${finalDomainName}"`,
            data: {
              domain: finalDomainName
            }
          })
        })
    }
  })
})

// Middleware error handler
app.use((err, req, res, _) => {
  let error = err
  if (!err.isBoom) {
    // Log not boom error as they might contain important error info
    console.error(err)
    error = err instanceof Error ? boom.boomify(err) : boom.badImplementation("Something's wrong")
  }
  const code = error.output.statusCode
  res.status(code).json(error.output.payload)
})

http.createServer(app).listen(PORT, () => {
  console.log(`Express server listening on ${PORT}`)
})

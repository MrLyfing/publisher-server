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
const { matchSingleSubdomainLvl } = require('@common/utils')
const { responseJSON } = require('@server/utils')

const app = express()
const registerDNS = require('@server/registerDNS')

app.use(morgan('dev')) // requests logger

app.get('/', (_, res) => {
  responseJSON(res, 200, 'Welcome on the static-publisher API')
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
      next(
        boom.badRequest('Only characters are allowed (a-z, A-Z, 0-9 and -))')
      )
    } else {
      // Fields values returned by multiparty are array types
      const root = !!(fields.root && fields.root[0])
      let extractPath, finalDomainName
      if (root) {
        extractPath = NGINX.ROOT_DOMAIN_FOLDER
        finalDomainName = ROOT_DOMAIN_NAME
      } else {
        try {
          const subdomain = fields.subdomain[0]
          if (!matchSingleSubdomainLvl(subdomain)) {
            throw boom.badRequest('Subdomain is incorrectly formatted')
          }
          // Register new DNS record only if assets aren't pushed on root domain
          await registerDNS(subdomain)
          extractPath = `${NGINX.SUB_DOMAINS_FOLDER}/${subdomain}`
          finalDomainName = `${subdomain}.${ROOT_DOMAIN_NAME}`
        } catch (errDNS) {
          next(errDNS)
          return
        }
      }

      const receivedBuffer = fields.assets[0]
      const receivedStream = new stream.PassThrough()
      receivedStream.end(receivedBuffer)
      receivedStream
        .pipe(tar.extract(extractPath))
        .on('error', errStream => {
          next(errStream)
        })
        .on('finish', () => {
          // Extract tar and move assets to SUB_DOMAINS_FOLDER or update ROOT_DOMAIN_FOLDER (for root domain)
          responseJSON(
            res,
            200,
            `Assets were succesfully deployed on "${finalDomainName}"`,
            {
              domain: finalDomainName
            }
          )
        })
    }
  })
})

// Middleware error handler
app.use((err, req, res, _) => {
  if (!err.isBoom) {
    // Log not boom error as they might contain important error info
    console.error(typeof err === 'object' ? JSON.stringify(err) : err)
    err =
      err instanceof Error
        ? boom.boomify(err)
        : boom.badImplementation("Something's wrong")
  }
  const code = err.output.statusCode
  res.status(code).json(err.output.payload)
})

http.createServer(app).listen(PORT, () => {
  console.log(`Express server listening on ${PORT}`)
})

const multiparty = require('multiparty')
const stream = require('stream')
const tar = require('tar-fs')
const boom = require('boom')
const fs = require('fs')

const { NGINX, ROOT_DOMAIN_NAME } = require('@/config')
const { deleteFolder, isDirectoryExists, responseJSON } = require('@/utils')

const { registerDNS } = require('@/dns')

module.exports = (req, res, next) => {
  const form = new multiparty.Form()
  form.parse(req, async (err, fields, files) => {
    if (err) next(err)
    else if (
      // Check parameters existence
      !fields.assets ||
      (fields.root && fields.subdomain) ||
      (!fields.root && !fields.subdomain)
    ) {
      next(boom.badData('Form data is incorrect'))
    } else {
      // Fields values returned by multiparty are array types
      const root = !!(fields.root && fields.root[0])

      let extractPath = NGINX.ROOT_DOMAIN_FOLDER
      let fullDomain = ROOT_DOMAIN_NAME
      let isNewRecord = false // New DNS record creation
      try {
        if (!root) {
          // Deploying for a subdomain
          const subdomain = fields.subdomain[0]
          isNewRecord = await registerDNS(subdomain)
          extractPath = `${NGINX.SUB_DOMAINS_FOLDER}/${subdomain}`
          fullDomain = `${subdomain}.${ROOT_DOMAIN_NAME}`
        }
        if (isDirectoryExists(extractPath)) {
          // Whether the DNS record is new or already registred, delete folder content if exists
          await deleteFolder(`${extractPath}/*`)
          console.log(`[API|PUSH] - Clear ${extractPath} folder content`)
        } else {
          fs.mkdirSync(extractPath) // Create folder otherwise
          console.log(`[API|PUSH] - Create ${extractPath} folder`)
        }
      } catch (errDNS) {
        next(errDNS)
        return
      }

      const receivedBuffer = fields.assets[0]
      const receivedStream = new stream.PassThrough()
      receivedStream.end(receivedBuffer)
      // Extract tar and move assets to SUB_DOMAINS_FOLDER or update ROOT_DOMAIN_FOLDER
      receivedStream
        .pipe(tar.extract(extractPath))
        .on('error', errStream => {
          next(errStream)
        })
        .on('finish', () => {
          responseJSON(
            res,
            200,
            `Assets were succesfully deployed on "${fullDomain}"`,
            { fullDomain: fullDomain, root, isNewRecord }
          )
        })
    }
  })
}

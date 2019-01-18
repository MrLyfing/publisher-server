const { getRecord } = require('@server/dns')
const boom = require('boom')

async function lookupSubdomain(req, res, next) {
  try {
    const { subdomain } = req.params
    const record = await getRecord(subdomain)
    if (!record) {
      next(boom.notFound(`Subdomain ${subdomain} does not exist`))
    } else {
      res.locals.record = record
      next()
    }
  } catch (err) {
    next(err)
  }
}

module.exports = { lookupSubdomain }

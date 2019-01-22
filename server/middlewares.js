const { getAllRecords } = require('@server/dns')
const boom = require('boom')

async function lookupSubdomain(req, res, next) {
  // Check whether subdomain already exists
  try {
    const { subdomain } = req.params
    const records = await getAllRecords()
    const A = records.find(
      ({ type, name }) => type === 'A' && name === subdomain
    )

    if (A) {
      // Passing data through middleware
      Object.assign(res.locals, { A, records })
      next()
    } else {
      next(boom.notFound(`Subdomain ${subdomain} does not exist`))
    }
  } catch (err) {
    next(err)
  }
}

module.exports = { lookupSubdomain }

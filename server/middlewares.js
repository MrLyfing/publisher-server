const { getAllRecords } = require('@server/dns')
const boom = require('boom')

async function lookupSubdomain(req, res, next) {
  try {
    const { subdomain } = req.params
    const records = await getAllRecords(subdomain)
    const [A, CNAME] = [
      records.find(({ type, name }) => type === 'A' && name === subdomain),
      records.find(
        ({ type, name }) => type === 'CNAME' && name === `www.${subdomain}`
      )
    ]

    if (A && CNAME) {
      // Passing data through middleware
      Object.assign(res.locals, { A, CNAME })
      next()
    } else if (!A && !CNAME) {
      next(boom.notFound(`Subdomain ${subdomain} does not exist`))
    } else {
      // As seach ubdomain always have a A and CNAME corresponding. This condition should never
      // never be reached.
      next(
        boom.badData(
          `Something is wrong. Only ${
            A ? 'A' : 'CNAME'
          } record exists. Please check your data.`
        )
      )
    }
  } catch (err) {
    next(err)
  }
}

module.exports = { lookupSubdomain }

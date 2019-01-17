// Create CNAME and A DNS record with subdomain passed from the request
const boom = require('boom')
const request = require('request')
const { DIGITAL_OCEAN_API_KEY, ROOT_DOMAIN_NAME, IPV4_ADDRESS } = require('@server/config')

const DIGITAL_OCEAN_API = URI => `https://api.digitalocean.com/v2/${URI}`

module.exports = subdomain =>
  new Promise((resolve, reject) => {
    request.post(
      {
        url: DIGITAL_OCEAN_API(`/domains/${ROOT_DOMAIN_NAME}/records`),
        headers: {
          Authorization: `Bearer ${DIGITAL_OCEAN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        form: {
          type: 'A',
          name: subdomain,
          data: IPV4_ADDRESS,
          ttl: 3600 // Default value when set from Digital Ocean dashboard
        }
      },
      (errMessage, { statusCode }, body) => {
        if (errMessage) {
          reject(boom.badImplementation(errMessage))
        } else if (statusCode >= 400) {
          console.log(`[DIGITAL_OCEAN_API]: ${body}`)
          reject(boom.serverUnavailable(body))
        } else resolve(body)
      }
    )
  })

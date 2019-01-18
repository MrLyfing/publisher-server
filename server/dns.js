// Create CNAME and A DNS record with subdomain passed from the request
const boom = require('boom')
const request = require('request')
const {
  DIGITAL_OCEAN_API_KEY,
  ROOT_DOMAIN_NAME,
  IPV4_ADDRESS
} = require('@server/config')
const { matchSingleSubdomainLvl } = require('@common/utils')

const DEFAULT_REQUEST_OPTIONS = (uri, options) => ({
  url: `https://api.digitalocean.com/v2/${uri}`,
  headers: {
    Authorization: `Bearer ${DIGITAL_OCEAN_API_KEY}`
  },
  json: true,
  ...options
})

const requestHandler = (resolve, reject) => (
  errMessage,
  { statusCode },
  body
) => {
  body && console.log(`[DIGITAL_OCEAN_API] - ${JSON.stringify(body)}`)
  if (errMessage) {
    reject(boom.badImplementation(errMessage))
  } else if (statusCode >= 400) {
    reject(boom.serverUnavailable(JSON.stringify(body)))
  } else {
    resolve(body)
  }
}

async function getRecords(filterFunc = () => true) {
  const data = await new Promise((resolve, reject) => {
    request.get(
      DEFAULT_REQUEST_OPTIONS(`/domains/${ROOT_DOMAIN_NAME}/records`),
      requestHandler(resolve, reject)
    )
  })
  if (data.domain_records && Array.isArray(data.domain_records)) {
    return data.domain_records.filter(filterFunc)
  }
  throw boom.serverUnavailable('Cannot process Digital Ocean response format')
}

function createRecord(form) {
  return new Promise((resolve, reject) => {
    request.post(
      DEFAULT_REQUEST_OPTIONS(`/domains/${ROOT_DOMAIN_NAME}/records`, { form }),
      requestHandler(resolve, reject)
    )
  })
}

async function registerDNS(subdomain) {
  // Return true if new DNS record was created
  if (!matchSingleSubdomainLvl(subdomain)) {
    throw boom.badRequest('Only characters are allowed (a-z, A-Z, 0-9 and -))')
  }
  var records = await getRecords(record => record.type === 'A')
  records = records.map(record => record.name)
  if (!records.includes(subdomain)) {
    await createRecord({
      type: 'A',
      name: subdomain,
      data: IPV4_ADDRESS,
      ttl: 3600 // Default value when set from Digital Ocean dashboard
    })
    await createRecord({
      type: 'CNAME',
      name: `www.${subdomain}`,
      data: `${subdomain}.${ROOT_DOMAIN_NAME}.`, // Data needs to end with a dot (.) for CNAME
      ttl: 43200
    })
    return true
  }
  return false
}

module.exports = {
  getRecords,
  registerDNS
}

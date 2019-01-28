const boom = require('boom')
const request = require('request')
const {
  DIGITAL_OCEAN_API_KEY,
  ROOT_DOMAIN_NAME,
  IPV4_ADDRESS
} = require('@/config')
const { matchSingleSubdomainLvl } = require('@/utils')

const DEFAULT_REQUEST_OPTIONS = (uri, options = {}) => ({
  url: `https://api.digitalocean.com/v2/${uri}`,
  headers: {
    Authorization: `Bearer ${DIGITAL_OCEAN_API_KEY}`
  },
  json: true,
  ...options
})

const UNPROCESSABLE_DATA_MESSAGE =
  'Cannot process Digital Ocean response format'

const requestHandler = (resolve, reject) => (errMessage, res, body) => {
  body && console.log(`[DIGITAL_OCEAN_API] - ${JSON.stringify(body)}`)
  if (errMessage) {
    reject(boom.badImplementation(errMessage))
  } else if (res.statusCode >= 400) {
    reject(boom.serverUnavailable(JSON.stringify(body)))
  } else {
    resolve(body)
  }
}

async function getAllDomains() {
  const data = await new Promise((resolve, reject) => {
    request.get(
      DEFAULT_REQUEST_OPTIONS(`/domains`),
      requestHandler(resolve, reject)
    )
  })
  if (data.domains) {
    return data.domains
  }
  throw boom.serverUnavailable(UNPROCESSABLE_DATA_MESSAGE)
}

async function getAllRecords() {
  const data = await new Promise((resolve, reject) => {
    request.get(
      DEFAULT_REQUEST_OPTIONS(`/domains/${ROOT_DOMAIN_NAME}/records`),
      requestHandler(resolve, reject)
    )
  })
  if (data.domain_records && Array.isArray(data.domain_records)) {
    return data.domain_records
  }
  throw boom.serverUnavailable(UNPROCESSABLE_DATA_MESSAGE)
}

async function createDomain(name, IPAddress) {
  return new Promise((resolve, reject) => {
    request.post(
      DEFAULT_REQUEST_OPTIONS(`/domains`, {
        form: {
          name,
          ip_address: IPAddress
        }
      }),
      requestHandler(resolve, reject)
    )
  })
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
  const record = (await getAllRecords()).find(
    record => record.type === 'A' && record.name === subdomain
  )
  if (!record) {
    // DNS record doesn't exist
    await createRecord({
      type: 'A',
      name: subdomain,
      data: IPV4_ADDRESS,
      ttl: 3600 // Default value when set from Digital Ocean dashboard
    })
    return true
  }
  return false
}

async function removeRecord(id) {
  await new Promise((resolve, reject) => {
    request.delete(
      DEFAULT_REQUEST_OPTIONS(`/domains/${ROOT_DOMAIN_NAME}/records/${id}`),
      requestHandler(resolve, reject)
    )
  })
}

async function updateRecord(id, form = {}) {
  await new Promise((resolve, reject) => {
    request.put(
      DEFAULT_REQUEST_OPTIONS(`/domains/${ROOT_DOMAIN_NAME}/records/${id}`, {
        form
      }),
      requestHandler(resolve, reject)
    )
  })
}

module.exports = {
  getAllDomains,
  getAllRecords,
  createDomain,
  registerDNS,
  createRecord,
  removeRecord,
  updateRecord
}

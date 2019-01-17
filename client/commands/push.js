const tar = require('tar-fs')
const request = require('request')

const { isDirectoryExists, isString } = require('@common/utils')

const URL = 'http://localhost:3000/api/push'

function pack(path) {
  return new Promise((resolve, reject) => {
    const chunks = []
    tar
      .pack(path)
      .on('data', chunk => {
        chunks.push(chunk)
      })
      .on('error', err => {
        reject(err)
      })
      .on('end', () => {
        resolve(Buffer.concat(chunks))
      })
  })
}

module.exports = async args => {
  const path = args._[1] || '.' // Default to current location if <path> not provided
  const { root, subdomain } = args

  if (!isString(subdomain) && !root) {
    throw new Error('Option --subdomain <name> is missing or incorect')
  }
  if (subdomain && root) {
    throw new Error('Options --subdomain and --root cannot be used together')
  }

  if (isDirectoryExists(path)) {
    const buffer = await pack(path)

    console.log('[PUSH] Data sent :', buffer.length)
    const formData = { assets: buffer }
    if (root) {
      // root parameter is casted as formData can only accept key-value (string)
      formData.root = true.toString()
    } else {
      formData.subdomain = subdomain
    }
    const res = await new Promise((resolve, reject) => {
      request.post({ url: URL, formData }, (err, _, body) => {
        if (err) reject(new Error(`Request to ${URL} failed`))
        else {
          resolve(body)
        }
      })
    })
    console.log('[PUSH] API response :', res)
  } else {
    throw new Error(`<path> ${path} does not exist or is not a directory`)
  }
}

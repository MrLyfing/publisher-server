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
    throw new Error('Option --subdomain <name> is missing')
  }
  if (subdomain && root) {
    throw new Error('Option --subdomain <name> is not allowed')
  }

  if (isDirectoryExists(path)) {
    const buffer = await pack(path)
    console.log('[PUSH] Data sent :', buffer.length)

    // root option is Boolean type and is converted
    // to string as formData can only accepts string values
    const formData = { assets: buffer, root: root.toString() }
    if (!root) {
      formData.subdomain = subdomain
    }
    await new Promise((resolve, reject) => {
      request.post({ url: URL, formData }, (err, _, body) => {
        if (err) reject(new Error(`Request to ${URL} failed`))
        else {
          console.log('[PUSH] API response :', body)
          resolve()
        }
      })
    })
  } else {
    throw new Error(`<path> ${path} does not exist or is not a directory`)
  }
}

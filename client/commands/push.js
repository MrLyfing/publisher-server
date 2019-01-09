const tar = require('tar-fs')
const request = require('request')

const { isDirectoryExists, isString } = require('@common/utils')

const URL = 'http://localhost:3000/api/push'

function pack(path) {
  return new Promise((resolve, reject) => {
    const chunks = []
    tar
      .pack(path) // TODO: Compress tar
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
  const path = args._[1]
  const domain = args.d || args.domain

  if (!path) {
    throw new Error('Argument [path] is missing')
  }
  if (!isString(domain)) {
    throw new Error('Option <domain> is missing')
  }

  if (isDirectoryExists(path)) {
    const buffer = await pack(path)
    console.log('[PUSH] Data sent :', buffer.length)
    await new Promise(() => {
      request.post(
        {
          url: URL,
          formData: { copress_file: buffer }
        },
        (err, _, body) => {
          if (err) throw new Error(`Request to ${URL} failed`)
          console.log('[PUSH] API response :', body)
        }
      )
    })
  } else {
    throw new Error(`Path ${path} does not exist or is not a directory`)
  }
}

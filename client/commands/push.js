const zlib = require('zlib')
const tar = require('tar-fs')
const request = require('request')

const { isDirectoryExists, isString } = require('@common/utils')

const URL = 'http://localhost:3000/api/push'

function pack(path) {
  return new Promise(resolve => {
    const chunks = []
    tar
      .pack(path)
      .pipe(zlib.createGzip())
      .on('data', chunk => {
        chunks.push(chunk)
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
    console.log('send', buffer)
    request.post(
      {
        url: URL,
        formData: { compress_file: buffer }
      },
      (err, res, body) => {
        if (err) throw new Error(`Request to ${URL} failed`)
        console.log(body)
      }
    )
  } else {
    throw new Error(`Path ${path} does not exist or is not a directory`)
  }
}

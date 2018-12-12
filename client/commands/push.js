const zlib = require('zlib')
const resolve = require('path').resolve

const { isDirectoryExists, isString } = require('@common/utils')

module.exports = (args) => {
  var path = args._[1]
  const domain = args.d || args.domain

  if (!path) {
    throw new Error('Argument [path] is missing')
  }
  if (!isString(domain)) {
    throw new Error('Option <domain> is missing')
  }

  path = resolve(__dirname, path)
  if (isDirectoryExists(path)) {


  } else {
    throw new Error(`Path "${path}" does not exist`)
  }
}
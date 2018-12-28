const zlib = require('zlib')
const tar = require('tar-fs')
const fs = require('fs')
const { basename } = require('path')

const { isDirectoryExists, isString } = require('@common/utils')

function package(path) {
  return new Promise((resolve, reject) => {
    const filename = `${basename(path)}.tar.gz`
    tar.pack(path)
      .pipe(zlib.createGzip())
      .pipe(fs.createWriteStream(filename))
      .on('finish', err => {
        if (err) reject(new Error('Packaging directory failed'))
        resolve(filename)
      })
  })
}

module.exports = async (args) => {
  var path = args._[1]
  const domain = args.d || args.domain

  if (!path) {
    throw new Error('Argument [path] is missing')
  }
  if (!isString(domain)) {
    throw new Error('Option <domain> is missing')
  }

  if (isDirectoryExists(path)) {
    const filename = await package(path)
    // send data to server
  } else {
    throw new Error(`Path ${path} does not exist or is not a directory`)
  }
}
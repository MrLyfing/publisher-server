const fs = require('fs')

function isDirectoryExists(path) {
  return fs.existsSync(path) && fs.statSync(path).isDirectory()
}

function isString(val) {
  return typeof val === 'string' || val instanceof String
}

module.exports = {
  isDirectoryExists,
  isString
}
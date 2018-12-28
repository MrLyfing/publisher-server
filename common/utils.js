const fs = require('fs')

function isDirectoryExists(path) {
  try {
    return fs.existsSync(path) && fs.statSync(path).isDirectory()
  } catch (err) {
    return false
  }
}

function isString(val) {
  return typeof val === 'string' || val instanceof String
}

module.exports = {
  isDirectoryExists,
  isString
}
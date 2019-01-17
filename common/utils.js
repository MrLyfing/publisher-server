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

function matchSingleSubdomainLvl(str) {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,70}[a-zA-Z0-9]$/.test(str)
}

module.exports = {
  isDirectoryExists,
  isString,
  matchSingleSubdomainLvl
}

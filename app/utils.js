const fs = require('fs')
const rimraf = require('rimraf')

function isDirectoryExists(path) {
  try {
    return fs.existsSync(path) && fs.statSync(path).isDirectory()
  } catch (err) {
    throw err
  }
}

function matchSingleSubdomainLvl(str) {
  // Subdomain validator
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,70}[a-zA-Z0-9]$/.test(str)
}

function deleteFolder(pattern) {
  return new Promise((resolve, reject) => {
    rimraf(pattern, err => {
      if (err) reject(err)
      resolve()
    })
  })
}

function responseJSON(res, statusCode, message, data = {}) {
  return res.status(statusCode).json({
    statusCode,
    message,
    data
  })
}

module.exports = {
  isDirectoryExists,
  matchSingleSubdomainLvl,
  deleteFolder,
  responseJSON
}

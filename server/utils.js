function responseJSON(res, statusCode, message, data = {}) {
  return res.status(statusCode).json({
    statusCode,
    message,
    data
  })
}

module.exports = {
  responseJSON
}

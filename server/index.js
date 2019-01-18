require('module-alias/register')
require('dotenv').config({ path: './server/.env' })

const http = require('http')
const express = require('express')
const morgan = require('morgan')
const boom = require('boom')

const { PORT } = require('@server/config')
const api = require('@server/api')

const app = express()

app.use(morgan('dev')) // requests logger
app.use('/api', api)

// Middleware error handler
app.use((err, req, res, next) => {
  if (!err.isBoom) {
    // Log not boom error as they might contain important error info
    let errMessage = '[INTERNAL_ERROR] - '
    errMessage += typeof err === 'object' ? JSON.stringify(err) : err
    console.error(errMessage)
    err =
      err instanceof Error
        ? boom.boomify(err)
        : boom.badImplementation("Something's wrong")
  }
  const code = err.output.statusCode
  res.status(code).json(err.output.payload)
})

http.createServer(app).listen(PORT, () => {
  console.log(`Express server listening on ${PORT}`)
})

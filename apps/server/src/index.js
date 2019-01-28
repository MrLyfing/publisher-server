require('module-alias/register')

const http = require('http')
const express = require('express')
const morgan = require('morgan')
const boom = require('boom')
const bodyParser = require('body-parser')

const { PORT } = require('@/config')
const api = require('@/api')
const initialize = require('@/init')

const app = express()
const server = http.createServer(app)

app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(morgan('dev')) // requests logger
app.use('/', api)

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

async function run() {
  try {
    await initialize()
    server.listen(PORT, () => {
      console.log(`[API | INIT] Success. Express server listening on ${PORT}`)
    })
  } catch (errMessage) {
    console.error(`[API | INIT] Failed. ${errMessage}`)
  }
}

run()

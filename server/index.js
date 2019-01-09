const http = require('http')
const express = require('express')
const morgan = require('morgan')
const multiparty = require('multiparty')
const stream = require('stream')
const tar = require('tar-fs')

const app = express()
const PORT = 3000

const server = http.createServer(app)

app.use(morgan('dev')) // requests logger

app.get('/', (req, res) => {
  res.json({ test: 'Hello world from static-publisher api' })
})

app.post('/api/push', (req, res, next) => {
  const form = new multiparty.Form()
  form.parse(req, (err, fields, _) => {
    if (err) next(err)
    else if (!fields.compress_file) {
      const paramErr = new Error('compress_file parameter missing')
      paramErr.statusCode = 400
      next(paramErr)
    } else {
      const receivedBuffer = Buffer.from(fields.compress_file[0])
      console.log('received', receivedBuffer.length)

      const receivedStream = new stream.PassThrough()
      receivedStream.end(Buffer.from(fields.compress_file[0]))
      receivedStream.pipe(tar.extract('./dir-received')).on('finish', () => {
        res.json({ res: 'Uploaded' })
      })
    }
  })
})

server.listen(PORT, () => {
  console.log(`Express server listening on ${PORT}`)
})

// Middleware error handler
app.use((err, req, res, _) => {
  console.error(err.message)
  const code = err.statusCode || 500
  res.status(code).json({
    code,
    message: err.message
  })
})

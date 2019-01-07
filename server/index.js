const http = require('http')
const express = require('express')
const morgan = require('morgan')

const app = express()
const PORT = 3000

const server = http.createServer(app)

app.use(morgan('dev')) // requests logger

app.get('/', (req, res) => {
  res.json({ test: 'Hello world from static-publisher api' })
})

app.post('/api/push', (req, res) => {
  const chunks = []
  let buffer
  req.on('data', chunk => {
    chunks.push(chunk)
  })
  req.on('end', () => {
    buffer = Buffer.concat(chunks)
    console.log('received', buffer)
    res.send('Done')
  })
})

server.listen(PORT, () => {
  console.log(`Express server listening on ${PORT}`)
})

require('dotenv').config()

const ws = require('ws')
const http = require('http')
const path = require('path')
const redis = require('redis')
const express = require('express')
const bodyParser = require('body-parser')

const { promisify } = require('util')

// Configure the redis instance

const r = redis.createClient(process.env.REDIS_URL || 'redis://localhost:6379')

r.on('error', function (err) {
  console.error(err)
})

// Configure the express instance

const app = express()

// Reuse the HTTP server instance to implement websockets
// https://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen
const server = http.createServer(app)
const wss = new ws.Server({ server })

// Define the websocket instance
wss.on('connection', s => {
  // Conneciton is up
  s.on('message', raw => {
    const json = JSON.parse(raw)
    if ('filename' in json) {
      console.log(`Your filename ${json.filename}`)
    }
    setTimeout(() => s.send('Thank you for your message'), 3000)
  })
  // Send a welcoming message
  s.send('Hi, I\'m ready to serve you')
})

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json({
  limit: '50mb',
  extended: true
}))
app.use(express.static(path.join(__dirname, path.normalize('../client/build/'))))

app.post('/send', (req, res) => {
  console.log('SERVER : Received message - sending to WORKER')

  console.log(req.body)

  const status = r.publish('sweco', JSON.stringify(req.body))

  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify({
    status: status ? 'OK' : 'NOK'
  }))
})

app.get('/download/:fileId', (req, res) => {
  res.json(req.params)
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, path.normalize('../build/index.html')))
})

const port = process.env.PORT || 5000

server.listen(port, () => console.log(`Express server http://localhost:${port}`))

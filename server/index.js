require('dotenv').config()

const ws = require('ws')
const http = require('http')
const path = require('path')
const uuid = require('uuid')
const redis = require('redis')
const process = require('process')
const express = require('express')
const bodyParser = require('body-parser')

console.log = m => {
  process.stdout.write(m + '\n')
}

// Configure the redis instance

const r = redis.createClient(process.env.REDIS_URL || 'redis://localhost:6379')

r.on('error', err => console.error(err))

// Configure the express instance

const app = express()

// Reuse the HTTP server instance to implement websockets
// https://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen
const server = http.createServer(app)
const wss = new ws.Server({
  server
})

// Define the websocket instance
wss.on('connection', s => {
  // Start new subscriber and publisher
  const subscriber = r.duplicate()
  // Conneciton is up
  const id = uuid.v4()
  const queue = `queue-${id}`
  const broadcast = `broadcast-${id}`
  // Listen to incomming messages of the `Client`
  s.on('message', buffer => {
    // Start a new publisher
    const publisher = r.duplicate()
    // Publish the job to the queue
    publisher.publish(queue, buffer)
    // Send a message back to the client
    console.log('SERVER - Queing the job... ')
  })
  // Listen to incomming messages of the `Worker`
  subscriber.subscribe(broadcast)
  subscriber.on('message', (channel, message) => {
    // Send the result of the job
    s.send(message)
  })
  // Send a welcoming message
  console.log(`SERVER - New socket started - ID: ${id}`)
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
  console.log(`Download started - File ID: ${req.params.fileId}`)
  res.sendFile(path.join(__dirname, path.normalize(`../worker/temp/${req.params.fileId}`)))
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, path.normalize('./index.html')))
})

const port = process.env.PORT || 5000

server.listen(port, () => console.log(`Express server http://localhost:${port}`))

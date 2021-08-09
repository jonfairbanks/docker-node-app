const express = require('express')
const app = express()
const os = require('os')
const dayjs = require('dayjs')
const advancedFormat = require('dayjs/plugin/advancedFormat')

app.set('view engine', 'ejs')
dayjs.extend(advancedFormat)

// Sample Middleware
app.use((_req, res, next) => {
  res.removeHeader('X-Powered-By')
  res.setHeader('X-Hostname', os.hostname())
  res.setHeader('X-Timestamp', Date.now())
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.setHeader('Expires', '-1')
  res.setHeader('Pragma', 'no-cache')
  next()
})

// Create a public directory for Images/CSS/etc.
app.use(express.static(__dirname + '/public'))

// Handle Incoming Requests
app.get('/', (req, res) => {
  const ip =
    req.headers['x-original-forwarded-for'] ||
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : 'Unknown')

  res.render('index', {
    ip: ip,
    hostname: os.hostname(),
    user_agent: req.headers['user-agent'],
    timestamp: dayjs().format('MMM Do YYYY, h:mm:ss A'),
  })
})

// Handle livenessProbe
app.get('/healthz', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  res
    .send({
      response: {
        msg: 'docker-node-app is up and running...',
        host: os.hostname(),
        clientSourceIP: ip,
      },
    })
    .status(200)
})

module.exports = app

'use strict';

const express = require('express');

// Constants
const HOST = '0.0.0.0';
const PORT = 8080;

// App
const app = express();

// Middleware
app.use(function (req, res, next) {
  res.removeHeader("X-Powered-By");
  res.setHeader('X-Timestamp', Date.now()) // Tag all requests with a timestamp
  res.setHeader('X-Words-of-Wisdom', '"You come at the king, you best not miss." - Omar Little') // Yo dawg...
  next();
});

// Handle Requests
app.get('/', (req, res) => {
  res.send('Hello world!\n' + 'Request:' + JSON.stringify(req.headers, null, ' '));
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

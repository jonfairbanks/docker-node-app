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
  next();
});

// Handle Requests
app.get('/', (req, res) => {
  res.send('Hello world!\n' + 'Request:' + JSON.stringify(req.headers, null, ' '));
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

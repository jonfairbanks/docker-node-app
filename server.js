'use strict';

const express = require('express');
const os = require('os');

// Constants
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 8080;

// App
const app = express();

// Middleware
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.setHeader('X-Timestamp', Date.now());
  res.setHeader('X-Words-of-Wisdom', '"You come at the king, you best not miss." - Omar Little');
  next();
});

// Handle Requests
app.get('/', (req, res) => {
  res.send(
    'Hello from ' + os.hostname() + '!\n\r' + 
    'IP: ' + req.headers['x-forwarded-for'] + '\n\r' +
    'User Agent: ' + req.headers['user-agent'] + '\n\r' + 
    'Timestamp: ' + Date.now()
  );
});

app.listen(PORT, HOST);
console.log(`Express is up and running...`);

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
  res.setHeader('X-Hostname', os.hostname());
  res.setHeader('X-Words-of-Wisdom', 'You come at the king, you best not miss. - Omar Little');
  next();
});

// Handle Requests
app.get('/', (req, res) => {
  var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : "Unknown");

  var body = '<html<head><title>docker-node-app</title></head><body>' + 
  'Hello from ' + os.hostname() + '\n\r' + 
  'IP: ' + ip + '\n\r' +
  'User Agent: ' + req.headers['user-agent'] + '\n\r' + 
  'Timestamp: ' + Date.now() + '\n\r' +
  '</body></html>';

  res.writeHead(200,{"Content-Type" : "text/html"});
  res.write(body);
});

app.listen(PORT, HOST);
console.log(`Express is up and running...`);

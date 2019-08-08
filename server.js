// Constants
const express = require('express');
const os = require('os');

// Setup Express
const PORT = process.env.PORT || 8080;
const app = express();

// Sample Middleware
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Hostname', os.hostname());
  res.setHeader('X-Timestamp', Date.now());
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');
  next();
});

// Handle Incoming Requests
app.get('/', (req, res) => {
  const ip = req.headers['x-forwarded-for']
     || req.connection.remoteAddress
     || req.socket.remoteAddress
     || (req.connection.socket ? req.connection.socket.remoteAddress : 'Unknown');

  const body = `${'<html<head><meta http-equiv="refresh" content="3"><title>docker-node-app</title></head><body>'
  + 'Hello from <b>'}${os.hostname()}</b>!<br/><br/>`
  + `Request IP: ${ip}<br/><br/>`
  + `User Agent: ${req.headers['user-agent']}<br/><br/>`
  + `Timestamp: ${Date.now()}<br/><br/>`
  + 'This page will automatically reload and connect to new hosts...'
  + '</body></html>';

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(body);
  res.end();
});

// Launch the App
app.listen(PORT, '0.0.0.0');
console.log(`Express is up and running...`); // eslint-disable-line

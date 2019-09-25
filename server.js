// Constants
const express = require('express');
const os = require('os');
const moment = require('moment');

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

  const body = `
    <html>
      <head>
        <link rel="shortcut icon" href="https://yo.fairbanks.io/dna-favicon"/>
        <link href="https://fonts.googleapis.com/css?family=Lato&display=swap" rel="stylesheet">
        <meta http-equiv="refresh" content="5"><title>docker-node-app</title>
      </head>
      <style>
        #body {
            background-color: #DEF1F9;
            font-family: 'Lato', sans-serif;
        }

        #container {
            max-width: 500px;
            margin: auto;
            padding-top: 10px;
        }

        #img {
            display:block;
            margin:auto;
        }

        #content {
            display:block;
            margin:auto;
            text-align: center;
        }

        table {
            border-collapse: inherit;
            border-spacing: 0 25px;
            text-align: center;
        }

        .spinner {
            margin: 2px auto;
            width: 20px;
            height: 20px;
            position: relative;
        }

        .cube1, .cube2 {
            background-color: #333;
            width: 7px;
            height: 7px;
            position: absolute;
            top: 0;
            left: 0;
            
            -webkit-animation: sk-cubemove 1.8s infinite ease-in-out;
            animation: sk-cubemove 1.8s infinite ease-in-out;
        }

        .cube2 {
            -webkit-animation-delay: -0.9s;
            animation-delay: -0.9s;
        }

        @-webkit-keyframes sk-cubemove {
            25% { -webkit-transform: translateX(21px) rotate(-90deg) scale(0.5) }
            50% { -webkit-transform: translateX(21px) translateY(21px) rotate(-180deg) }
            75% { -webkit-transform: translateX(0px) translateY(21px) rotate(-270deg) scale(0.5) }
            100% { -webkit-transform: rotate(-360deg) }
        }

        @keyframes sk-cubemove {
            25% { 
                transform: translateX(21px) rotate(-90deg) scale(0.5);
                -webkit-transform: translateX(21px) rotate(-90deg) scale(0.5);
            } 50% { 
                transform: translateX(21px) translateY(21px) rotate(-179deg);
                -webkit-transform: translateX(21px) translateY(21px) rotate(-179deg);
            } 50.1% { 
                transform: translateX(21px) translateY(21px) rotate(-180deg);
                -webkit-transform: translateX(21px) translateY(21px) rotate(-180deg);
            } 75% { 
                transform: translateX(0px) translateY(21px) rotate(-270deg) scale(0.5);
                -webkit-transform: translateX(0px) translateY(21px) rotate(-270deg) scale(0.5);
            } 100% { 
                transform: rotate(-360deg);
                -webkit-transform: rotate(-360deg);
            }
        }
      </style>
      <body id="body">
        <div id="container">
          <a href="https://github.com/jonfairbanks/docker-node-app" target="_blank" rel="noopener noreferrer">
            <img id="img" src="https://yo.fairbanks.io/dna-icon" height=175vh>
          </a>
          <div id="content">
            <table>
              <tr>
                <td>
                  Hello from <b>${os.hostname()}</b>!
                </td>
              </tr>
              <tr>
                <td>
                  Request IP: ${ip}
                </td>
              </tr>
              <tr>
                <td>
                  User Agent: ${req.headers['user-agent']}
                </td>
              </tr>
              <tr>
                <td>
                  Timestamp: ${moment().format('MMM Do YYYY, h:mm:ss A')}
                </td>
              </tr>
              <tr>
                <td>
                  This page will automatically reload and connect to new hosts...
                </td>
              </tr>
            </table>
          </div>
          <div class="spinner">
            <div class="cube1"></div>
            <div class="cube2"></div>
          </div>
        </div>
      </body>
    </html>
  `;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(body);
  res.end();
});

// Handle livenessProbe
app.get('/healthz', (res) => {
  res.sendStatus(200);
});

// Launch the App
app.listen(PORT, '0.0.0.0');
console.log(`docker-node-app is up and running...`); // eslint-disable-line

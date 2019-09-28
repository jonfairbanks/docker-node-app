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
        <link rel="shortcut icon" href="https://raw.githubusercontent.com/jonfairbanks/docker-node-app/master/images/favicon.png"/>
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
          padding-top: 20px;
        }

        #img {
          display:block;
          margin:auto;
          padding-bottom: 5px;
        }

        #content {
          display:block;
          margin:auto;
          text-align: center;
        }

        table {
          border-collapse: inherit;
          border-spacing: 0 30px;
          text-align: center;
        }

        span {
          font-size: 16px;
        }
        
        sub {
          vertical-align: sub;
          font-size: 12px;
          font-weight: 900;
          display: inline-block;
          padding-top: 5px;
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
            <img id="img" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwMCIgaGVpZ2h0PSIyMTAwIiB2aWV3Qm94PSIwIDAgMjU2IDIxNSIgeG1s%0D%0AbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9%0D%0AImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zOC42MTcgMTczLjk4NHYtMTYuMzYyYzAtMi4xNSAxLjM0NC0z%0D%0ALjg3NyAzLjU3LTMuODc3aC42MTZjMi4yMjUgMCAzLjU2MyAxLjcyOSAzLjU2MyAzLjg3N3YzNC40%0D%0ANDdjMCA4LjQtNC4xNSAxNS4wODQtMTEuMzgyIDE5LjM0MmEyMS4zNzQgMjEuMzc0IDAgMCAxLTEw%0D%0ALjk0NSAyLjk4NWgtMS41MzdjLTguNDAyIDAtMTUuMDc3LTQuMTUzLTE5LjM0Mi0xMS4zOGEyMS4z%0D%0AMTQgMjEuMzE0IDAgMCAxLTIuOTg0LTEwLjk0N3YtMS41MzVjMC04LjQwMyA0LjE1Mi0xNS4wODMg%0D%0AMTEuMzc4LTE5LjM0OWEyMS4yOTggMjEuMjk4IDAgMCAxIDEwLjk0OC0yLjk4NWgxLjUzN2M1LjY4%0D%0ANiAwIDEwLjUxIDIuMjA0IDE0LjU3OCA1Ljc4NHpNNy45MjQgMTkxLjNjMCA2LjA2OCAyLjk0MSAx%0D%0AMC42MyA4LjI1OCAxMy41NCAyLjE1IDEuMTc2IDQuNDg0IDEuODA4IDYuOTM3IDEuODA4IDUuOTU2%0D%0AIDAgMTAuMzc0LTIuODEgMTMuNDIxLTcuODU3IDEuNDE3LTIuMzQ4IDIuMDc3LTQuOTE3IDIuMDc3%0D%0ALTcuNjQ4IDAtNS4yNi0yLjQ5LTkuMzY1LTYuNzI5LTEyLjQxNC0yLjU3LTEuODQ4LTUuNDYzLTIu%0D%0ANzc1LTguNjE4LTIuNzc1LTYuNDkyIDAtMTEuMTY0IDMuMjgtMTMuOTY4IDkuMTA2LS45NDYgMS45%0D%0ANy0xLjM3OCA0LjA2MS0xLjM3OCA2LjI0em02NS4zMjQtMjMuMWgxLjA3NGM4Ljk3OCAwIDE1Ljgw%0D%0ANiA0LjM1NSAyMC4xMzMgMTIuMTkyIDEuNzMgMy4xMzUgMi42NTYgNi41NTcgMi42NTYgMTAuMTQy%0D%0AdjEuNTM1YzAgOC40LTQuMTQyIDE1LjA5My0xMS4zODUgMTkuMzQzLTMuMzUzIDEuOTY3LTcuMDU3%0D%0AIDIuOTg0LTEwLjk0MyAyLjk4NGgtMS41MzVjLTguNDAyIDAtMTUuMDc5LTQuMTUzLTE5LjM0Mi0x%0D%0AMS4zOGEyMS4zMTYgMjEuMzE2IDAgMCAxLTIuOTg3LTEwLjk0N3YtMS41MzVjMC04LjQwNCA0LjE2%0D%0AOS0xNS4wNjIgMTEuMzc3LTE5LjM0NyAzLjM1MS0xLjk5MSA3LjA1OC0yLjk4NyAxMC45NTItMi45%0D%0AODd6bS0xNC41OCAyMy4xYzAgNS44OSAyLjg5IDEwLjIyMyA3Ljg2NSAxMy4yNyAyLjMzNiAxLjQz%0D%0AIDQuOTA5IDIuMDc4IDcuNjM4IDIuMDc4IDUuODIgMCAxMC4xMjItMi45NTEgMTMuMTE2LTcuODYz%0D%0AIDEuNDI4LTIuMzQyIDIuMDc0LTQuOTE1IDIuMDc0LTcuNjQyIDAtNS40NzctMi42MzgtOS42NjEt%0D%0ANy4xNDgtMTIuNjkzLTIuNDcxLTEuNjYzLTUuMjIyLTIuNDk2LTguMTk4LTIuNDk2LTYuNDkyIDAt%0D%0AMTEuMTY0IDMuMjgtMTMuOTY3IDkuMTA2LS45NDggMS45Ny0xLjM4IDQuMDYxLTEuMzggNi4yNHpt%0D%0ANzAuNjU2LTE0LjcyN2MtMS4xNy0uNTQ4LTMuMzYtLjczLTQuNjI0LS43NzgtNi40NzQtLjI0NC0x%0D%0AMS4xNTggMy40MDItMTMuOTA2IDkuMTEzLS45NDkgMS45Ny0xLjM4MiA0LjA1NS0xLjM4MiA2LjIz%0D%0ANSAwIDYuNjM3IDMuNDg1IDExLjI4NCA5LjQwOSAxNC4xMTcgMi4xNjQgMS4wMzQgNC45NTggMS4y%0D%0AMyA3LjMyMyAxLjIzIDIuMDggMCA1LjAyLTEuMjc0IDYuODY2LTIuMTUxbC4zMi0uMTUyaDEuNDMz%0D%0AbC4xNTguMDMyYzEuNzYyLjM2NyAzLjA5MiAxLjQ4NCAzLjA5MiAzLjM4di43NjdjMCA0LjcxOC04%0D%0ALjYyMiA1Ljc5OC0xMS45MTIgNi4wMjgtMTEuNjEuODAzLTIwLjI5My01LjU3My0yMy42MDMtMTYu%0D%0ANjQ3LS41NzUtMS45MjMtLjgzNC0zLjgzMy0uODM0LTUuODM3di0xLjUzM2MwLTguNDAzIDQuMTct%0D%0AMTUuMDU5IDExLjM3Ny0xOS4zNCAzLjM1MS0xLjk5IDcuMDU3LTIuOTkgMTAuOTUtMi45OWgxLjUz%0D%0ANmM0LjEzIDAgNy45MzQgMS4xNzMgMTEuMzQ0IDMuNTAybC4yOC4xOTQuMTc3LjI5MmMuMzY4LjYx%0D%0ALjY4NSAxLjMxNi42ODUgMi4wNDJ2Ljc2N2MwIDEuOTc4LTEuNDggMy4wNDItMy4yNjYgMy4zODZs%0D%0ALS4xNDguMDI2aC0uNDU4Yy0xLjE1NiAwLTMuNzg1LTEuMTk3LTQuODE3LTEuNjgzem0yNS4xMzQg%0D%0ANS4yNDdjMy4wMS0zLjAxNCA2LjAzLTYuMDIyIDkuMDg1LTguOTg2Ljg1MS0uODI3IDQuMDc0LTQu%0D%0AMzI3IDUuMzQzLTQuMzI3aDEuMzg4bC4xNTguMDMzYzEuNzY4LjM2NyAzLjA5MiAxLjQ4NiAzLjA5%0D%0AMiAzLjM4NnYuNzY2YzAgMS4yOTYtMS41MTggMi44MDItMi4zNTUgMy42ODktMS43OCAxLjg4Ny0z%0D%0ALjY1NCAzLjcxMi01LjQ3NiA1LjU2bC05LjM2MiA5LjUwNGM0LjAzMSA0LjA0IDguMDU4IDguMDgz%0D%0AIDEyLjA1NiAxMi4xNTRhMzEzLjMwNCAzMTMuMzA0IDAgMCAxIDMuMzAxIDMuMzk2Yy4zODUuNDA1%0D%0ALjk1My45MDkgMS4yNzYgMS40Ny4zNDcuNTI2LjU2IDEuMTE5LjU2IDEuNzUydi44bC0uMDQ1LjE4%0D%0ANWMtLjQzNSAxLjc2OC0xLjU1NyAzLjE5NC0zLjUxNiAzLjE5NGgtLjYxN2MtMS4yODIgMC0yLjcz%0D%0ALTEuNDUtMy42MDgtMi4yNzktMS44MS0xLjcwNi0zLjU1Ny0zLjUtNS4zMzEtNS4yNDNsLTUuOTQ5%0D%0ALTUuODR2OS4zMzRjMCAyLjE1LTEuMzQ2IDMuODc4LTMuNTY5IDMuODc4aC0uNjFjLTIuMjI2IDAt%0D%0AMy41Ny0xLjcyOC0zLjU3LTMuODc4di01Mi41OTZjMC0yLjE1IDEuMzQ1LTMuODcgMy41Ny0zLjg3%0D%0AaC42MWMyLjIyMyAwIDMuNTY5IDEuNzIgMy41NjkgMy44N3YyNC4wNDh6bTk2LjU3Ny0xMy4zMTNo%0D%0ALjc3YzIuMzI0IDAgMy44NzUgMS41NjYgMy44NzUgMy44NzcgMCAzLjIwOC0zLjA2NyA0LjAyOS01%0D%0ALjcyIDQuMDI5LTMuNDggMC02LjgwMyAyLjEwNy05LjIwMiA0LjQ3LTIuOTkxIDIuOTQ5LTQuMyA2%0D%0ALjcyNi00LjMgMTAuODc4djE4Ljc1OWMwIDIuMTUtMS4zNDMgMy44NzYtMy41NyAzLjg3NmgtLjYx%0D%0AMmMtMi4yMjcgMC0zLjU2OS0xLjcyNS0zLjU2OS0zLjg3NnYtMTkuODM2YzAtNy42MTcgMy43MDgt%0D%0AMTMuODM1IDkuODktMTguMTk2IDMuNjkxLTIuNjA1IDcuOTE5LTMuOTggMTIuNDM4LTMuOTh6bS01%0D%0ANS4wNzQgMzcuMTc2YzIuODIuOTg1IDYuMDM1Ljg0NCA4LjkyOC4zNCAxLjQ4LS42MjkgNS4yNjQt%0D%0AMi4yOCA2LjY1Ni0yLjAzOGwuMjE3LjAzNy4yLjA5OGMuODUuNDEyIDEuNjYxLjk5NSAyLjA5NSAx%0D%0ALjg2IDEuMDE0IDIuMDI3LjUyNyA0LjA2NS0xLjQ2NSA1LjIxNmwtLjY2My4zODNjLTcuMzUgNC4y%0D%0ANDItMTUuMTY4IDMuNjU0LTIyLjQ5NS0uMzA4LTMuNTAzLTEuODk0LTYuMTgzLTQuNzA1LTguMTYt%0D%0AOC4xMzJsLS40NjItLjgwMWMtNC43MTktOC4xNzItNC4wODItMTYuNzY4IDEuMjQtMjQuNTM5IDEu%0D%0AODM3LTIuNjg2IDQuMjM4LTQuNzYxIDcuMDQ1LTYuMzg0bDEuMDYyLS42MTNjNi45MjItMy45OTYg%0D%0AMTQuMzQxLTMuNzIyIDIxLjQ1LS4yMTUgMy44MjMgMS44ODYgNi45MiA0LjY5NyA5LjA1NCA4LjM5%0D%0ANGwuMzg0LjY2NmMxLjU1IDIuNjg2LS40NTggNS4wMjYtMi41MzEgNi42MjYtMi40MDYgMS44NTYt%0D%0ANC44MzUgNC4wOS03LjE0MSA2LjA4LTUuMTQyIDQuNDM5LTEwLjI3NiA4Ljg4OC0xNS40MTQgMTMu%0D%0AMzN6bS02LjY1NS00LjY3NGM1Ljc1LTQuOTMgMTEuNTAyLTkuODY1IDE3LjIzNy0xNC44MTYgMS45%0D%0ANi0xLjY5IDQuMTA5LTMuNDQ0IDYuMDUzLTUuMjIxLTEuNTYtMS45NjYtNC4xNjYtMy4zODMtNi4z%0D%0AOC00LjIyOC00LjQ3LTEuNzAzLTguODc3LTEuMTMxLTEyLjk3NiAxLjIzNS01LjM2NSAzLjA5OC03%0D%0ALjY1IDguMDMxLTcuNDUgMTQuMTcuMDggMi40MTguNzMgNC43NDggMi4wMTMgNi44MDUuNDUyLjcy%0D%0ANS45NTcgMS40MDYgMS41MDMgMi4wNTV6TTE0Ny40ODggNDUuNzMyaDIyLjg2NnYyMy4zNzVoMTEu%0D%0ANTYxYzUuMzQgMCAxMC44MzEtLjk1MSAxNS44ODctMi42NjQgMi40ODUtLjg0MyA1LjI3My0yLjAx%0D%0ANSA3LjcyNC0zLjQ5LTMuMjI4LTQuMjE0LTQuODc2LTkuNTM1LTUuMzYtMTQuNzgtLjY2LTcuMTM1%0D%0ALjc4LTE2LjQyMSA1LjYwOC0yMi4wMDVsMi40MDQtMi43OCAyLjg2NCAyLjMwM2M3LjIxMSA1Ljc5%0D%0AMyAxMy4yNzYgMTMuODg5IDE0LjM0NSAyMy4xMTggOC42ODMtMi41NTQgMTguODc4LTEuOTUgMjYu%0D%0ANTMxIDIuNDY3bDMuMTQgMS44MTItMS42NTIgMy4yMjZDMjQ2LjkzMyA2OC45NDYgMjMzLjQgNzIu%0D%0AODYgMjIwLjE3IDcyLjE2N2MtMTkuNzk3IDQ5LjMwOS02Mi44OTggNzIuNjUzLTExNS4xNTcgNzIu%0D%0ANjUzLTI3IDAtNTEuNzctMTAuMDkzLTY1Ljg3Ni0zNC4wNDdsLS4yMzEtLjM5LTIuMDU1LTQuMTgy%0D%0AYy00Ljc2OC0xMC41NDQtNi4zNTItMjIuMDk1LTUuMjc4LTMzLjYzN2wuMzIzLTMuNDU3SDUxLjQ1%0D%0AVjQ1LjczMmgyMi44NjVWMjIuODY2aDQ1LjczM1YwaDI3LjQ0djQ1LjczMiIgZmlsbD0iIzM2NDU0%0D%0AOCIvPjxwYXRoIGQ9Ik0yMjEuNTcgNTQuMzhjMS41MzMtMTEuOTE2LTcuMzg0LTIxLjI3NS0xMi45%0D%0AMTQtMjUuNzE5LTYuMzczIDcuMzY4LTcuMzYzIDI2LjY3OCAyLjYzNSAzNC44MDgtNS41OCA0Ljk1%0D%0ANi0xNy4zMzcgOS40NDgtMjkuMzc2IDkuNDQ4SDM1LjM3Yy0xLjE3IDEyLjU2NyAxLjAzNiAyNC4x%0D%0ANCA2LjA3NSAzNC4wNDVsMS42NjcgMy4wNWE1Ni41MzYgNTYuNTM2IDAgMCAwIDMuNDU1IDUuMTg0%0D%0AYzYuMDI1LjM4NyAxMS41OC41MiAxNi42NjIuNDA4aC4wMDJjOS45ODctLjIyIDE4LjEzNi0xLjQg%0D%0AMjQuMzEyLTMuNTRhMS43NjEgMS43NjEgMCAwIDEgMS4xNTMgMy4zMjZjLS44MjIuMjg2LTEuNjc4%0D%0ALjU1Mi0yLjU2Mi44MDVoLS4wMDNjLTQuODYzIDEuMzg5LTEwLjA3OCAyLjMyMy0xNi44MDYgMi43%0D%0AMzguNC4wMDctLjQxNi4wNi0uNDE4LjA2LS4yMjkuMDE1LS41MTcuMDQ4LS43NDcuMDYtMi42NDgu%0D%0AMTQ5LTUuNTA2LjE4LTguNDI4LjE4LTMuMTk2IDAtNi4zNDMtLjA2LTkuODYyLS4yNGwtLjA5LjA2%0D%0AYzEyLjIxIDEzLjcyNCAzMS4zMDIgMjEuOTU1IDU1LjIzNCAyMS45NTUgNTAuNjQ4IDAgOTMuNjA4%0D%0ALTIyLjQ1MiAxMTIuNjMyLTcyLjg1NyAxMy40OTYgMS4zODUgMjYuNDY3LTIuMDU3IDMyLjM2Ny0x%0D%0AMy41NzUtOS4zOTgtNS40MjMtMjEuNDg0LTMuNjk0LTI4LjQ0My0uMTk2IiBmaWxsPSIjMjJBMEM4%0D%0AIi8+PHBhdGggZD0iTTIyMS41NyA1NC4zOGMxLjUzMy0xMS45MTYtNy4zODQtMjEuMjc1LTEyLjkx%0D%0ANC0yNS43MTktNi4zNzMgNy4zNjgtNy4zNjMgMjYuNjc4IDIuNjM1IDM0LjgwOC01LjU4IDQuOTU2%0D%0ALTE3LjMzNyA5LjQ0OC0yOS4zNzYgOS40NDhINDQuMDQ4Yy0uNTk4IDE5LjI0NiA2LjU0NCAzMy44%0D%0ANTUgMTkuMTggNDIuNjg3aC4wMDNjOS45ODctLjIyIDE4LjEzNi0xLjQgMjQuMzEyLTMuNTRhMS43%0D%0ANjEgMS43NjEgMCAwIDEgMS4xNTMgMy4zMjZjLS44MjIuMjg2LTEuNjc4LjU1Mi0yLjU2Mi44MDVo%0D%0ALS4wMDNjLTQuODYzIDEuMzg5LTEwLjUyNiAyLjQ0My0xNy4yNTQgMi44NTgtLjAwMiAwLS4xNjMt%0D%0ALjE1NS0uMTY1LS4xNTUgMTcuMjM3IDguODQyIDQyLjIzIDguODEgNzAuODg1LTIuMTk3IDMyLjEz%0D%0ALTEyLjM0NCA2Mi4wMjktMzUuODYgODIuODktNjIuNzU3LS4zMTQuMTQyLS42Mi4yODctLjkxNy40%0D%0AMzYiIGZpbGw9IiMzN0IxRDkiLz48cGF0aCBkPSJNMzUuNjQ1IDg4LjE4NmMuOTEgNi43MzIgMi44%0D%0AOCAxMy4wMzUgNS44IDE4Ljc3NmwxLjY2NyAzLjA1YTU2LjQzMiA1Ni40MzIgMCAwIDAgMy40NTUg%0D%0ANS4xODRjNi4wMjYuMzg3IDExLjU4MS41MiAxNi42NjQuNDA4IDkuOTg3LS4yMiAxOC4xMzYtMS40%0D%0AIDI0LjMxMi0zLjU0YTEuNzYxIDEuNzYxIDAgMCAxIDEuMTUzIDMuMzI2Yy0uODIyLjI4Ni0xLjY3%0D%0AOC41NTItMi41NjIuODA1aC0uMDAzYy00Ljg2MyAxLjM4OS0xMC40OTYgMi4zODMtMTcuMjI0IDIu%0D%0ANzk5LS4yMzEuMDE0LS42MzQuMDE3LS44NjcuMDMtMi42NDYuMTQ4LTUuNDc1LjIzOS04LjM5OC4y%0D%0AMzktMy4xOTUgMC02LjQ2My0uMDYxLTkuOTgtLjI0IDEyLjIxIDEzLjcyNCAzMS40MiAyMS45ODUg%0D%0ANTUuMzUyIDIxLjk4NSA0My4zNiAwIDgxLjA4NC0xNi40NTggMTAyLjk3OS01Mi44MjJIMzUuNjQ1%0D%0AIiBmaWxsPSIjMUI4MUE1Ii8+PHBhdGggZD0iTTQ1LjM2NyA4OC4xODZjMi41OTIgMTEuODIgOC44%0D%0AMjEgMjEuMDk5IDE3Ljg2NCAyNy40MTggOS45ODctLjIyIDE4LjEzNi0xLjQgMjQuMzEyLTMuNTRh%0D%0AMS43NjEgMS43NjEgMCAwIDEgMS4xNTMgMy4zMjZjLS44MjIuMjg2LTEuNjc4LjU1Mi0yLjU2Mi44%0D%0AMDVoLS4wMDNjLTQuODYzIDEuMzg5LTEwLjYxNSAyLjM4My0xNy4zNDQgMi43OTkgMTcuMjM2IDgu%0D%0AODQgNDIuMTU3IDguNzEzIDcwLjgxLTIuMjkzIDE3LjMzNC02LjY2IDM0LjAxNy0xNi41NzQgNDgu%0D%0AOTg0LTI4LjUxNUg0NS4zNjciIGZpbGw9IiMxRDkxQjQiLz48cGF0aCBkPSJNNTUuMjYgNDkuNTQz%0D%0AaDE5LjgxOHYxOS44MThINTUuMjZWNDkuNTQzem0xLjY1MSAxLjY1MmgxLjU2NFY2Ny43MWgtMS41%0D%0ANjRWNTEuMTk1em0yLjk0IDBoMS42MjdWNjcuNzFoLTEuNjI2VjUxLjE5NXptMy4wMDIgMGgxLjYy%0D%0AN1Y2Ny43MWgtMS42MjdWNTEuMTk1em0zLjAwNCAwaDEuNjI2VjY3LjcxaC0xLjYyNlY1MS4xOTV6%0D%0AbTMuMDAzIDBoMS42MjZWNjcuNzFINjguODZWNTEuMTk1em0zLjAwMiAwaDEuNTY1VjY3LjcxaC0x%0D%0ALjU2NVY1MS4xOTV6TTc4LjEyNiAyNi42NzdoMTkuODE5djE5LjgxN2gtMTkuODJWMjYuNjc3em0x%0D%0ALjY1MiAxLjY1MmgxLjU2M3YxNi41MTRoLTEuNTYzVjI4LjMyOXptMi45NCAwaDEuNjI2djE2LjUx%0D%0ANGgtMS42MjVWMjguMzI5em0zLjAwMiAwaDEuNjI2djE2LjUxNEg4NS43MlYyOC4zMjl6bTMuMDAz%0D%0AIDBoMS42MjZ2MTYuNTE0aC0xLjYyNlYyOC4zMjl6bTMuMDAzIDBoMS42Mjd2MTYuNTE0aC0xLjYy%0D%0AN1YyOC4zMjl6bTMuMDAyIDBoMS41NjZ2MTYuNTE0aC0xLjU2NlYyOC4zMjl6IiBmaWxsPSIjMjNB%0D%0AM0MyIi8+PHBhdGggZD0iTTc4LjEyNiA0OS41NDNoMTkuODE5djE5LjgxOGgtMTkuODJWNDkuNTQz%0D%0Aem0xLjY1MiAxLjY1MmgxLjU2M1Y2Ny43MWgtMS41NjNWNTEuMTk1em0yLjk0IDBoMS42MjZWNjcu%0D%0ANzFoLTEuNjI1VjUxLjE5NXptMy4wMDIgMGgxLjYyNlY2Ny43MUg4NS43MlY1MS4xOTV6bTMuMDAz%0D%0AIDBoMS42MjZWNjcuNzFoLTEuNjI2VjUxLjE5NXptMy4wMDMgMGgxLjYyN1Y2Ny43MWgtMS42MjdW%0D%0ANTEuMTk1em0zLjAwMiAwaDEuNTY2VjY3LjcxaC0xLjU2NlY1MS4xOTV6IiBmaWxsPSIjMzRCQkRF%0D%0AIi8+PHBhdGggZD0iTTEwMC45OTMgNDkuNTQzaDE5LjgxOHYxOS44MThoLTE5LjgxOFY0OS41NDN6%0D%0AbTEuNjUxIDEuNjUyaDEuNTYzVjY3LjcxaC0xLjU2M1Y1MS4xOTV6bTIuOTQgMGgxLjYyNlY2Ny43%0D%0AMWgtMS42MjZWNTEuMTk1em0zLjAwMyAwaDEuNjI2VjY3LjcxaC0xLjYyNlY1MS4xOTV6bTMuMDAz%0D%0AIDBoMS42MjZWNjcuNzFoLTEuNjI2VjUxLjE5NXptMy4wMDIgMGgxLjYyOFY2Ny43MWgtMS42MjhW%0D%0ANTEuMTk1em0zLjAwMyAwaDEuNTY0VjY3LjcxaC0xLjU2NFY1MS4xOTV6IiBmaWxsPSIjMjNBM0My%0D%0AIi8+PHBhdGggZD0iTTEwMC45OTMgMjYuNjc3aDE5LjgxOHYxOS44MTdoLTE5LjgxOFYyNi42Nzd6%0D%0AbTEuNjUxIDEuNjUyaDEuNTYzdjE2LjUxNGgtMS41NjNWMjguMzI5em0yLjk0IDBoMS42MjZ2MTYu%0D%0ANTE0aC0xLjYyNlYyOC4zMjl6bTMuMDAzIDBoMS42MjZ2MTYuNTE0aC0xLjYyNlYyOC4zMjl6bTMu%0D%0AMDAzIDBoMS42MjZ2MTYuNTE0aC0xLjYyNlYyOC4zMjl6bTMuMDAyIDBoMS42Mjh2MTYuNTE0aC0x%0D%0ALjYyOFYyOC4zMjl6bTMuMDAzIDBoMS41NjR2MTYuNTE0aC0xLjU2NFYyOC4zMjl6TTEyMy44NTkg%0D%0ANDkuNTQzaDE5LjgxOHYxOS44MThoLTE5LjgxOFY0OS41NDN6bTEuNjUyIDEuNjUyaDEuNTYzVjY3%0D%0ALjcxaC0xLjU2M1Y1MS4xOTV6bTIuOTQgMGgxLjYyNlY2Ny43MWgtMS42MjZWNTEuMTk1em0zLjAw%0D%0AMiAwaDEuNjI2VjY3LjcxaC0xLjYyNlY1MS4xOTV6bTMuMDAzIDBoMS42MjdWNjcuNzFoLTEuNjI3%0D%0AVjUxLjE5NXptMy4wMDMgMGgxLjYyN1Y2Ny43MWgtMS42MjdWNTEuMTk1em0zLjAwMyAwaDEuNTY0%0D%0AVjY3LjcxaC0xLjU2NFY1MS4xOTV6IiBmaWxsPSIjMzRCQkRFIi8+PHBhdGggZD0iTTEyMy44NTkg%0D%0AMjYuNjc3aDE5LjgxOHYxOS44MTdoLTE5LjgxOFYyNi42Nzd6bTEuNjUyIDEuNjUyaDEuNTYzdjE2%0D%0ALjUxNGgtMS41NjNWMjguMzI5em0yLjk0IDBoMS42MjZ2MTYuNTE0aC0xLjYyNlYyOC4zMjl6bTMu%0D%0AMDAyIDBoMS42MjZ2MTYuNTE0aC0xLjYyNlYyOC4zMjl6bTMuMDAzIDBoMS42Mjd2MTYuNTE0aC0x%0D%0ALjYyN1YyOC4zMjl6bTMuMDAzIDBoMS42Mjd2MTYuNTE0aC0xLjYyN1YyOC4zMjl6bTMuMDAzIDBo%0D%0AMS41NjR2MTYuNTE0aC0xLjU2NFYyOC4zMjl6IiBmaWxsPSIjMjNBM0MyIi8+PHBhdGggZD0iTTEy%0D%0AMy44NTkgMy44MWgxOS44MThWMjMuNjNoLTE5LjgxOFYzLjgxem0xLjY1MiAxLjY1MWgxLjU2M3Yx%0D%0ANi41MTZoLTEuNTYzVjUuNDZ6bTIuOTQgMGgxLjYyNnYxNi41MTZoLTEuNjI2VjUuNDZ6bTMuMDAy%0D%0AIDBoMS42MjZ2MTYuNTE2aC0xLjYyNlY1LjQ2em0zLjAwMyAwaDEuNjI3djE2LjUxNmgtMS42MjdW%0D%0ANS40NnptMy4wMDMgMGgxLjYyN3YxNi41MTZoLTEuNjI3VjUuNDZ6bTMuMDAzIDBoMS41NjR2MTYu%0D%0ANTE2aC0xLjU2NFY1LjQ2eiIgZmlsbD0iIzM0QkJERSIvPjxwYXRoIGQ9Ik0xNDYuNzI1IDQ5LjU0%0D%0AM2gxOS44MTh2MTkuODE4aC0xOS44MThWNDkuNTQzem0xLjY1IDEuNjUyaDEuNTY1VjY3LjcxaC0x%0D%0ALjU2NFY1MS4xOTV6bTIuOTQgMGgxLjYyN1Y2Ny43MWgtMS42MjZWNTEuMTk1em0zLjAwNCAwaDEu%0D%0ANjI3VjY3LjcxaC0xLjYyN1Y1MS4xOTV6bTMuMDAyIDBoMS42MjdWNjcuNzFoLTEuNjI3VjUxLjE5%0D%0ANXptMy4wMDQgMGgxLjYyNlY2Ny43MWgtMS42MjZWNTEuMTk1em0zLjAwMiAwaDEuNTY0VjY3Ljcx%0D%0AaC0xLjU2NFY1MS4xOTV6IiBmaWxsPSIjMjNBM0MyIi8+PHBhdGggZD0iTTk2LjcwNCAxMDEuNDky%0D%0AYTUuNDY4IDUuNDY4IDAgMSAxLS4wMDIgMTAuOTM1IDUuNDY4IDUuNDY4IDAgMCAxIC4wMDItMTAu%0D%0AOTM1IiBmaWxsPSIjRDNFQ0VDIi8+PHBhdGggZD0iTTk2LjcwNCAxMDMuMDQzYy41IDAgLjk3Ny4w%0D%0AOTQgMS40MTcuMjY1YTEuNTk4IDEuNTk4IDAgMCAwIC43OTggMi45OGMuNjA1IDAgMS4xMy0uMzM1%0D%0AIDEuNDAyLS44MzFhMy45MTUgMy45MTUgMCAxIDEtMy42MTctMi40MTRNMCA5MC4xNjJoMjU0LjMy%0D%0AN2MtNS41MzctMS40MDQtMTcuNTItMy4zMDItMTUuNTQ0LTEwLjU2LTEwLjA3IDExLjY1Mi0zNC4z%0D%0ANTMgOC4xNzUtNDAuNDgyIDIuNDMtNi44MjQgOS44OTgtNDYuNTU0IDYuMTM1LTQ5LjMyNS0xLjU3%0D%0ANi04LjU1NiAxMC4wNDEtMzUuMDY3IDEwLjA0MS00My42MjMgMC0yLjc3MyA3LjcxMS00Mi41MDIg%0D%0AMTEuNDc0LTQ5LjMyNyAxLjU3NS02LjEyOCA1Ljc0Ni0zMC40MSA5LjIyMy00MC40OC0yLjQyOEMx%0D%0ANy41MjIgODYuODYgNS41MzkgODguNzU4IDAgOTAuMTYzIiBmaWxsPSIjMzY0NTQ4Ii8+PHBhdGgg%0D%0AZD0iTTExMS4yMzcgMTQwLjg5Yy0xMy41NC02LjQyNS0yMC45NzEtMTUuMTYtMjUuMTA2LTI0LjY5%0D%0ANC01LjAzIDEuNDM1LTExLjA3NSAyLjM1My0xOC4xIDIuNzQ3LTIuNjQ2LjE0OC01LjQzLjIyNC04%0D%0ALjM1LjIyNC0zLjM2OCAwLTYuOTE3LS4xLTEwLjY0My0uMjk3IDEyLjQxNyAxMi40MSAyNy42OTIg%0D%0AMjEuOTY0IDU1Ljk3NiAyMi4xMzggMi4wODggMCA0LjE2LS4wNCA2LjIyMy0uMTE4IiBmaWxsPSIj%0D%0AQkREOUQ3Ii8+PHBhdGggZD0iTTkxLjE2IDEyNC45OTRjLTEuODczLTIuNTQzLTMuNjktNS43Mzkt%0D%0ANS4wMjYtOC44LTUuMDMgMS40MzctMTEuMDc3IDIuMzU1LTE4LjEwMyAyLjc1IDQuODI2IDIuNjE5%0D%0AIDExLjcyNyA1LjA0NiAyMy4xMyA2LjA1IiBmaWxsPSIjRDNFQ0VDIi8+PC9nPjwvc3ZnPgo=" height=175vh>
          </a>
          <div id="content">
            <table>
              <tr>
                <td>
                  <span style="font-size: 18px;">Hello from <b>${os.hostname()}</b>!</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span>${ip}</span>
                  <br/>
                  <sub>Request IP</sub>
                </td>
              </tr>
              <tr>
                <td>
                  <span>${req.headers['user-agent']}</span>
                  <br/>
                  <sub>User Agent</sub>
                </td>
              </tr>
              <tr>
                <td>
                  <span>${moment().format('MMM Do YYYY, h:mm:ss A')}</span>
                  <br/>
                  <sub>Timestamp</sub>
                </td>
              </tr>
              <tr>
                <td>
                  <span>This page will automatically reload and connect to new hosts...</span>
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
app.get('/healthz', (req, res) => {
  const ip = req.headers['x-forwarded-for']
      || req.connection.remoteAddress;
  res.send({ response: { msg: 'I am alive', host: os.hostname(), clientSourceIP: ip } }).status(200);
});

// Launch the App
app.listen(PORT, '0.0.0.0');
console.log(`docker-node-app is up and running...`); // eslint-disable-line

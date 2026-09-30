const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { test } = require('node:test');
const { createGracefulShutdown } = require('../index');

test('graceful shutdown drains an in-flight request before closing', async (t) => {
  let markRequestStarted;
  let releaseResponse;
  const requestStarted = new Promise((resolve) => {
    markRequestStarted = resolve;
  });
  const responseReleased = new Promise((resolve) => {
    releaseResponse = resolve;
  });

  const server = http.createServer(async (_request, response) => {
    markRequestStarted();
    await responseReleased;
    response.end('ok');
  });
  server.keepAliveTimeout = 10;

  t.after(() => {
    server.closeAllConnections?.();
    if (server.listening) {
      server.close();
    }
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  const responsePromise = fetch(`http://127.0.0.1:${port}`);
  await requestStarted;

  const messages = [];
  const logger = {
    log: (message) => messages.push(message),
    error: (message) => messages.push(message),
  };
  const shutdown = createGracefulShutdown(server, { timeoutMs: 1000, logger });
  let shutdownComplete = false;
  const shutdownPromise = shutdown('SIGTERM').then(() => {
    shutdownComplete = true;
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(shutdownComplete, false);

  releaseResponse();
  const response = await responsePromise;
  assert.equal(await response.text(), 'ok');
  await shutdownPromise;

  assert.equal(shutdownComplete, true);
  assert.equal(server.listening, false);
  assert.deepEqual(messages, ['Received SIGTERM; draining active connections...']);
});

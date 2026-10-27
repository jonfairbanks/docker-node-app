const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { spawn } = require('node:child_process');
const { test } = require('node:test');
const request = require('supertest');
const { app, setDraining, waitForReadinessProbe } = require('../app');
const { createGracefulShutdown } = require('../index');

const silentLogger = { log() {}, error() {} };

test.afterEach(() => setDraining(false));

test('only a successful kubelet readiness response releases the wait', async () => {
  let completed = false;
  const waiting = waitForReadinessProbe(1000).then((observed) => {
    completed = true;
    return observed;
  });
  assert.equal((await request(app).get('/readyz')).status, 200);
  assert.equal((await request(app).get('/healthz').set('User-Agent', 'kube-probe/1.35')).status, 200);
  assert.equal(completed, false);

  setDraining(true);
  assert.equal((await request(app).get('/readyz').set('User-Agent', 'kube-probe/1.35')).status, 503);
  assert.equal((await request(app).get('/readyz')).status, 503);
  assert.equal(completed, false);

  setDraining(false);
  assert.equal((await request(app).get('/readyz').set('User-Agent', 'kube-probe/1.35')).status, 200);
  assert.equal(await waiting, true);
});

test('a missed readiness response times out and leaves no stale wait', async () => {
  assert.equal(await waitForReadinessProbe(20), false);
  const waiting = waitForReadinessProbe(1000);
  await request(app).get('/readyz').set('User-Agent', 'kube-probe/1.35');
  assert.equal(await waiting, true);
});

test('shutdown keeps serving until the probe and waits only once', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  let waits = 0;
  let startWaiting;
  const started = new Promise((resolve) => { startWaiting = resolve; });
  const shutdown = createGracefulShutdown(server, {
    logger: silentLogger,
    readinessTimeoutMs: 1000,
    waitForReadiness: (timeoutMs) => {
      waits += 1;
      const waiting = waitForReadinessProbe(timeoutMs);
      startWaiting();
      return waiting;
    },
    onShutdownStart: () => setDraining(true),
  });
  const shuttingDown = shutdown('SIGTERM');
  assert.equal(shutdown('SIGTERM'), shuttingDown);
  await started;
  assert.equal((await request(server).get('/')).status, 200);
  assert.equal((await request(server).get('/readyz')).status, 200);
  assert.equal(server.listening, true);
  await request(server).get('/readyz').set('User-Agent', 'kube-probe/1.35');
  await shuttingDown;
  assert.equal(waits, 1);
  assert.equal(server.listening, false);
  assert.equal((await request(app).get('/readyz').set('User-Agent', 'kube-probe/1.35')).status, 503);
});

test('missing probe logs coordination timeout and completes an ordinary drain', async () => {
  const server = http.createServer((_req, res) => res.end('ok'));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const errors = [];
  const shutdown = createGracefulShutdown(server, {
    readinessTimeoutMs: 20,
    logger: { log() {}, error: (message) => errors.push(message) },
  });
  await shutdown('SIGTERM');
  assert.equal(server.listening, false);
  assert.deepEqual(errors, ['No kubelet readiness response within 20ms; starting drain.']);
});

test('a stalled active request still hits the bounded drain deadline', async (t) => {
  let requestStarted;
  const started = new Promise((resolve) => { requestStarted = resolve; });
  const server = http.createServer(() => requestStarted());
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const pendingRequest = fetch(`http://127.0.0.1:${server.address().port}`).catch(() => {});
  await started;
  const shutdown = createGracefulShutdown(server, {
    readinessTimeoutMs: 100,
    waitForReadiness: async () => true,
    timeoutMs: 20,
    logger: silentLogger,
  });
  await assert.rejects(shutdown('SIGTERM'), /Graceful shutdown timed out/);
  await pendingRequest;
  assert.equal(server.listening, false);
});

test('child survives duplicate SIGTERM while serving and exits after the probe', async (t) => {
  const reservation = http.createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const { port } = reservation.address();
  await new Promise((resolve) => reservation.close(resolve));
  const child = spawn(process.execPath, ['index.js'], {
    cwd: `${__dirname}/..`,
    env: { ...process.env, PORT: String(port), SHUTDOWN_READINESS_TIMEOUT_MS: '6000' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => child.kill('SIGKILL'));
  let output = '';
  child.stdout.on('data', (data) => { output += data; });
  const exited = once(child, 'exit');
  const waitForOutput = async (text) => {
    while (!output.includes(text)) {
      await once(child.stdout, 'data', { signal: AbortSignal.timeout(2000) });
    }
  };
  await waitForOutput('listening on port');
  child.kill('SIGTERM');
  await waitForOutput('serving until the next kubelet readiness probe');
  child.kill('SIGTERM');
  const root = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(root.status, 200);
  await root.text();
  const ordinary = await fetch(`http://127.0.0.1:${port}/readyz`);
  assert.equal(ordinary.status, 200);
  await ordinary.text();
  assert.equal(child.exitCode, null);
  const probe = await fetch(`http://127.0.0.1:${port}/readyz`, {
    headers: { 'User-Agent': 'kube-probe/1.35' },
  });
  assert.equal(probe.status, 200);
  await probe.text();
  const [code, signal] = await Promise.race([
    exited,
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error('Child did not exit after probe')), 2000);
      timer.unref();
      exited.finally(() => clearTimeout(timer));
    }),
  ]);
  assert.equal(code, 0);
  assert.equal(signal, null);
  assert.match(output, /Kubelet readiness response finished; starting drain/);
  assert.match(output, /Graceful shutdown complete/);
});

test('probe coordination preserves an active response through the drain', async (t) => {
  let requestStarted;
  let releaseResponse;
  const started = new Promise((resolve) => { requestStarted = resolve; });
  const released = new Promise((resolve) => { releaseResponse = resolve; });
  const server = http.createServer(async (_req, res) => {
    requestStarted();
    await released;
    res.end('completed');
  });
  server.keepAliveTimeout = 10;
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const response = fetch(`http://127.0.0.1:${server.address().port}`);
  await started;
  let releaseProbe;
  const probe = new Promise((resolve) => { releaseProbe = resolve; });
  const shutdown = createGracefulShutdown(server, {
    readinessTimeoutMs: 1000,
    waitForReadiness: () => probe,
    timeoutMs: 1000,
    logger: silentLogger,
  });
  let completed = false;
  const stopping = shutdown('SIGTERM').then(() => { completed = true; });
  releaseProbe(true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(server.listening, false);
  assert.equal(completed, false);
  assert.equal(shutdown('SIGTERM'), shutdown('SIGINT'));
  releaseResponse();
  assert.equal(await (await response).text(), 'completed');
  await stopping;
  assert.equal(completed, true);
});

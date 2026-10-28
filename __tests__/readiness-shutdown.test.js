const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { spawn } = require('node:child_process');
const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const request = require('supertest');
const { app, setDraining } = require('../app');
const { createGracefulShutdown } = require('../index');

const silentLogger = { log() {}, error() {} };

test.afterEach(() => setDraining(false));

test('shutdown starts draining without a kubelet readiness request', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  assert.equal((await request(server).get('/readyz')).status, 200);
  const shutdown = createGracefulShutdown(server, {
    logger: silentLogger,
    onShutdownStart: () => setDraining(true),
  });
  const stopping = shutdown('SIGTERM');
  assert.equal(shutdown('SIGINT'), stopping);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(server.listening, false);
  await stopping;
  for (const userAgent of ['ordinary-client', 'kube-probe/1.35']) {
    assert.equal((await request(app).get('/readyz').set('User-Agent', userAgent)).status, 503);
    assert.equal((await request(app).get('/healthz').set('User-Agent', userAgent)).status, 200);
  }
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
    timeoutMs: 20,
    logger: silentLogger,
  });
  await assert.rejects(shutdown('SIGTERM'), /Graceful shutdown timed out/);
  await pendingRequest;
  assert.equal(server.listening, false);
});

async function startChild(t, timeoutMs) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'docker-node-app-shutdown-'));
  const preload = path.join(directory, 'slow-response.cjs');
  await writeFile(preload, `
    const { app } = require(${JSON.stringify(path.resolve(__dirname, '../app'))});
    const listen = app.listen;
    app.listen = function (...args) {
      const server = listen.apply(this, args);
      server.once('listening', () => console.log('Test port: ' + server.address().port));
      return server;
    };
    app.get('/slow', (_req, res) => {
      res.write('started');
      setTimeout(() => res.end(' completed'), 1000).unref();
    });
  `);
  const child = spawn(process.execPath, ['--require', preload, 'index.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: '0', SHUTDOWN_TIMEOUT_MS: String(timeoutMs) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const exited = once(child, 'exit');
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGKILL');
      await exited;
    }
    await rm(directory, { recursive: true, force: true });
  });
  let output = '';
  let errors = '';
  child.stderr.on('data', (data) => { errors += data; });
  child.stdout.on('data', (data) => { output += data; });
  const waitForOutput = async (text) => {
    while (!output.includes(text)) {
      await once(child.stdout, 'data', { signal: AbortSignal.timeout(3000) });
    }
  };
  await waitForOutput('Test port:');
  const port = Number(output.match(/Test port: (\d+)/)[1]);
  return { child, exited, port, waitForOutput, output: () => output, errors: () => errors };
}

async function activeResponse(port) {
  const response = await fetch(`http://127.0.0.1:${port}/slow`, {
    headers: { Connection: 'close' },
  });
  const reader = response.body.getReader();
  assert.equal(new TextDecoder().decode((await reader.read()).value), 'started');
  return reader;
}

test('child drains an active response through duplicate SIGTERM and SIGINT', { timeout: 6000 }, async (t) => {
  const running = await startChild(t, 3000);
  const reader = await activeResponse(running.port);
  running.child.kill('SIGTERM');
  await running.waitForOutput('draining active connections');
  running.child.kill('SIGTERM');
  running.child.kill('SIGINT');
  assert.equal(running.child.exitCode, null);
  assert.equal(new TextDecoder().decode((await reader.read()).value), ' completed');
  assert.equal((await reader.read()).done, true);
  const [code, signal] = await running.exited;
  assert.equal(code, 0);
  assert.equal(signal, null);
  assert.equal(running.errors(), '');
  assert.equal(running.output().match(/draining active connections/g).length, 1);
  assert.equal(running.output().match(/Graceful shutdown complete/g).length, 1);
});

test('child exits nonzero when an active response exceeds the drain deadline', { timeout: 6000 }, async (t) => {
  const running = await startChild(t, 20);
  const reader = await activeResponse(running.port);
  running.child.kill('SIGTERM');
  const remainder = await reader.read().catch(() => ({ done: true }));
  assert.equal(remainder.done, true);
  const [code, signal] = await running.exited;
  assert.equal(code, 1);
  assert.equal(signal, null);
  assert.match(running.errors(), /forcing close/);
  assert.match(running.errors(), /Graceful shutdown timed out/);
  assert.doesNotMatch(running.output(), /Graceful shutdown complete/);
});

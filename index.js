// Setup Express
const PORT = process.env.PORT || 8080;
const SHUTDOWN_TIMEOUT_MS = Number.parseInt(
  process.env.SHUTDOWN_TIMEOUT_MS || '25000',
  10,
);
const app = require('./app');

function startServer({ port = PORT, host = '0.0.0.0', logger = console } = {}) {
  return app.listen(port, host, () => {
    logger.log(`docker-node-app is listening on port ${port}`);
  });
}

function createGracefulShutdown(
  server,
  { timeoutMs = SHUTDOWN_TIMEOUT_MS, logger = console } = {},
) {
  let shutdownPromise;

  return (signal) => {
    if (shutdownPromise) {
      return shutdownPromise;
    }

    logger.log(`Received ${signal}; draining active connections...`);
    shutdownPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        logger.error(`Graceful shutdown exceeded ${timeoutMs}ms; forcing close.`);
        server.closeAllConnections?.();
        reject(new Error('Graceful shutdown timed out'));
      }, timeoutMs);
      timeout.unref();

      server.close((error) => {
        clearTimeout(timeout);
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
      server.closeIdleConnections?.();
    });

    return shutdownPromise;
  };
}

if (require.main === module) {
  const server = startServer();
  const shutdown = createGracefulShutdown(server);

  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.once(signal, () => {
      shutdown(signal)
        .then(() => console.log('Graceful shutdown complete.'))
        .catch((error) => {
          console.error(error);
          process.exitCode = 1;
        });
    });
  }
}

module.exports = { createGracefulShutdown, startServer };

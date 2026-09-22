const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

const server = app.listen(config.port, () => {
  logger.info(`=================================================`);
  logger.info(`🚀 ${config.appName} listening on port ${config.port}`);
  logger.info(`🌐 Environment: ${config.nodeEnv}`);
  logger.info(`🩺 Health check: http://localhost:${config.port}/api/${config.apiVersion}/health`);
  logger.info(`=================================================`);
  // logger.info(`=================================================`);
  logger.info(`=================================================`);
});

// Graceful Shutdown
const shutdown = (signal) => {
  logger.info(`Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;

const config = require("./config/env");
const app = require("./app");
const db = require("./db/postgres");
const logger = require("./utils/logger");

let server;

async function startServer() {
  try {
    const databaseName = await db.checkConnection();
    logger.info(`PostgreSQL connected successfully: ${databaseName}`);

    server = app.listen(config.port, () => {
      logger.info(`Airfare backend running on port ${config.port} [${config.env}]`);
    });
  } catch (error) {
    logger.error(`PostgreSQL connection failed: ${error.message}`);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed.");
      try {
        await db.shutdown();
        logger.info("Postgres pool closed.");
      } catch (err) {
        logger.error(`Error closing Postgres pool: ${err.message}`);
      } finally {
        process.exit(0);
      }
    });
    setTimeout(() => {
      logger.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason instanceof Error ? reason.stack : reason}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.stack}`);
  process.exit(1);
});

startServer();
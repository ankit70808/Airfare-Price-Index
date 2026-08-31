const config = require("../config/env");
const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  const isOperational = err.isOperational === true;
  const statusCode = isOperational ? err.statusCode : 500;
  const message = isOperational ? err.message : "Internal server error";

  if (isOperational && statusCode < 500) {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode}: ${err.message}`);
  } else {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}: ${err.stack || err.message}`);
  }

  const body = { success: false, message };
  if (isOperational && err.details) body.details = err.details;
  if (!config.isProduction && !isOperational) body.stack = err.stack;

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
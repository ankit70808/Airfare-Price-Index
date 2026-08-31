const rateLimit = require("express-rate-limit");
const config = require("../config/env");
const ApiError = require("../utils/ApiError");

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests("Too many requests, please try again later"));
  },
});

module.exports = apiLimiter;
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, details);
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }
  static tooManyRequests(message = "Too many requests") {
    return new ApiError(429, message);
  }
  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }
  static serviceUnavailable(message = "Service temporarily unavailable") {
    return new ApiError(503, message);
  }
}

module.exports = ApiError;
const db = require("../db/postgres");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const live = (req, res) => {
  new ApiResponse(200, { status: "ok", service: "airfare-backend" }, "Service is live").send(res);
};

const ready = asyncHandler(async (req, res) => {
  try {
    const databaseName = await db.checkConnection();
    new ApiResponse(200, { status: "ready", database: databaseName }, "Service is ready").send(res);
  } catch (error) {
    throw ApiError.serviceUnavailable("Database connection is unavailable");
  }
});

module.exports = { live, ready };
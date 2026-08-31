const service = require("../services/compositeIndex.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const getDaily = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 30;
  new ApiResponse(200, { history: await service.getDailyIndex(limit) }, "Daily index fetched").send(res);
});

const getLatestDaily = asyncHandler(async (req, res) => {
  new ApiResponse(200, await service.getLatestDailyIndex(), "Latest daily index fetched").send(res);
});

const getWeekly = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 12;
  new ApiResponse(200, { history: await service.getWeeklyIndex(limit) }, "Weekly index fetched").send(res);
});

module.exports = { getDaily, getLatestDaily, getWeekly };
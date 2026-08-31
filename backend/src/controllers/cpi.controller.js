const cpiService = require("../services/cpi.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const getCpiMetrics = asyncHandler(async (req, res) => {
  const metrics = await cpiService.getCpiMetrics();
  new ApiResponse(200, metrics, "CPI metrics fetched successfully").send(res);
});

const getMonthlyHistory = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 12;
  const history = await cpiService.getMonthlyIndexHistory(limit);
  new ApiResponse(200, { history }, "Monthly index history fetched successfully").send(res);
});

module.exports = { getCpiMetrics, getMonthlyHistory };
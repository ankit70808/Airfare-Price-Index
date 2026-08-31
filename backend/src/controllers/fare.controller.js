const fareService = require("../services/fare.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const getTrend = asyncHandler(async (req, res) => {
  const { origin, destination, purchaseWindow, class: cls = "Economy" } = req.query;
  const trend = await fareService.getFareTrend({ origin, destination, purchaseWindow, cls });
  new ApiResponse(200, trend, "Fare trend fetched successfully").send(res);
});

const getSummary = asyncHandler(async (req, res) => {
  const { origin, destination, purchaseWindow, window = "1M", class: cls = "Economy" } = req.query;
  const summary = await fareService.getFareSummary({ origin, destination, purchaseWindow, window, cls });
  new ApiResponse(200, summary, "Fare summary fetched successfully").send(res);
});

module.exports = { getTrend, getSummary };

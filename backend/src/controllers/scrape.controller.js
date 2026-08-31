const scrapeService = require("../services/scrape.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const trigger = asyncHandler(async (req, res) => {
  const { origin, destination } = req.body;
  const result = await scrapeService.triggerScrape({ origin, destination });
  new ApiResponse(202, result, "Scrape job triggered").send(res);
});

module.exports = { trigger };
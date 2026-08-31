const airportService = require("../services/airport.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const listAirports = asyncHandler(async (req, res) => {
  const airports = await airportService.listAirports();
  new ApiResponse(200, { airports }, "Airports fetched successfully").send(res);
});

module.exports = { listAirports };
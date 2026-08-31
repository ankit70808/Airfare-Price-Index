const airportRepository = require("../repositories/airport.repository");

async function listAirports() {
  return airportRepository.getDistinctAirports();
}

module.exports = { listAirports };
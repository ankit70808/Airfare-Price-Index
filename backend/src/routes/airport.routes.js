const express = require("express");
const airportController = require("../controllers/airport.controller");

const router = express.Router();
router.get("/", airportController.listAirports);

module.exports = router;
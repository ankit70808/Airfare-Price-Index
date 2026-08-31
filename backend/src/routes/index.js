const express = require("express");

const airportRoutes = require("./airport.routes");
const fareRoutes = require("./fare.routes");
const cpiRoutes = require("./cpi.routes");
const scrapeRoutes = require("./scrape.routes");
const compositeIndexRoutes = require("./compositeIndex.routes");

const router = express.Router();

router.use("/airports", airportRoutes);
router.use("/fares", fareRoutes);
router.use("/cpi", cpiRoutes);
router.use("/scrape", scrapeRoutes);
router.use("/index", compositeIndexRoutes);

module.exports = router;
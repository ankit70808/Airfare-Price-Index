const express = require("express");
const fareController = require("../controllers/fare.controller");
const { fareTrendValidator, fareSummaryValidator } = require("../validators/fare.validator");
const validate = require("../validators/validate");

const router = express.Router();

router.get("/trend", fareTrendValidator, validate, fareController.getTrend);
router.get("/summary", fareSummaryValidator, validate, fareController.getSummary);

module.exports = router;
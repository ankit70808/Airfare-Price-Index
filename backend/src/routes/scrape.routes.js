const express = require("express");
const scrapeController = require("../controllers/scrape.controller");
const { scrapeTriggerValidator } = require("../validators/scrape.validator");
const validate = require("../validators/validate");

const router = express.Router();
router.post("/trigger", scrapeTriggerValidator, validate, scrapeController.trigger);

module.exports = router;
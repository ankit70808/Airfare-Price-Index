const express = require("express");
const cpiController = require("../controllers/cpi.controller");

const router = express.Router();
router.get("/", cpiController.getCpiMetrics);
router.get("/history", cpiController.getMonthlyHistory);

module.exports = router;
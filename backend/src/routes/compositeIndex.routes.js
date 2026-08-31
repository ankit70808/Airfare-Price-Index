const express = require("express");
const controller = require("../controllers/compositeIndex.controller");

const router = express.Router();
router.get("/daily", controller.getDaily);
router.get("/daily/latest", controller.getLatestDaily);
router.get("/weekly", controller.getWeekly);

module.exports = router;
const { query } = require("express-validator");

const ALLOWED_WINDOWS = ["1W", "2W", "3W", "1M", "2M", "1Y"];
const ALLOWED_PURCHASE_WINDOWS = ["T+1", "T+7", "T+15", "T+30", "T+45"];

const airportField = (name) =>
  query(name).trim().notEmpty().withMessage(`${name} is required`)
    .isLength({ min: 3, max: 3 }).withMessage(`${name} must be a 3-letter airport code`);

const fareTrendValidator = [
  airportField("origin"),
  airportField("destination"),
  query("purchaseWindow").trim().notEmpty().withMessage("purchaseWindow is required")
    .isIn(ALLOWED_PURCHASE_WINDOWS)
    .withMessage(`purchaseWindow must be one of: ${ALLOWED_PURCHASE_WINDOWS.join(", ")}`),
];

const fareSummaryValidator = [
  ...fareTrendValidator,
  query("window").optional().trim().toUpperCase().isIn(ALLOWED_WINDOWS)
    .withMessage(`window must be one of: ${ALLOWED_WINDOWS.join(", ")}`),
];

module.exports = { fareTrendValidator, fareSummaryValidator, ALLOWED_WINDOWS, ALLOWED_PURCHASE_WINDOWS };

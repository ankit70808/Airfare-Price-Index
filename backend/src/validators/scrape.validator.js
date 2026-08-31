const { body } = require("express-validator");

const scrapeTriggerValidator = [
  body("origin").optional().trim().isLength({ min: 2, max: 50 })
    .withMessage("origin must be between 2 and 50 characters"),
  body("destination").optional().trim().isLength({ min: 2, max: 50 })
    .withMessage("destination must be between 2 and 50 characters"),
];

module.exports = { scrapeTriggerValidator };
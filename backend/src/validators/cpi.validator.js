const { query } = require("express-validator");

const cpiQueryValidator = [
  query("origin").trim().notEmpty().withMessage("origin is required")
    .isLength({ min: 2, max: 50 }).withMessage("origin must be between 2 and 50 characters"),
  query("destination").trim().notEmpty().withMessage("destination is required")
    .isLength({ min: 2, max: 50 }).withMessage("destination must be between 2 and 50 characters"),
];

module.exports = { cpiQueryValidator };
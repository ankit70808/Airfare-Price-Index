const fareRepository = require("../repositories/fare.repository");
const ApiError = require("../utils/ApiError");

// Matches the duration dropdown inside Graph.jsx exactly
const WINDOW_DAYS = { "1W": 7, "2W": 14, "3W": 21, "1M": 30, "2M": 60, "1Y": 365 };

function resolveWindowDays(window) {
  const days = WINDOW_DAYS[window];
  if (!days) {
    throw ApiError.badRequest(
      `Invalid window "${window}". Must be one of: ${Object.keys(WINDOW_DAYS).join(", ")}`
    );
  }
  return days;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function getFareTrend({ origin, destination, purchaseWindow, cls = "Economy" }) {
  const rows = await fareRepository.getFareTrend({ origin, destination, purchaseWindow, cls });

  if (rows.length === 0) {
    throw ApiError.notFound(
      `No fare data found for ${origin} -> ${destination} at ${purchaseWindow}. Have you scraped this route yet?`
    );
  }

  // Returned shape matches Graph.jsx's props exactly: data.origin, data.destination, data.dates, data.prices
  return {
    origin,
    destination,
    purchaseWindow,
    dates: rows.map((r) => formatDate(r.scrape_date)),
    prices: rows.map((r) => Number(r.avg_fare)),
  };
}

async function getFareSummary({ origin, destination, purchaseWindow, cls = "Economy", window = "1M" }) {
  const windowDays = resolveWindowDays(window);
  const summary = await fareRepository.getFareSummary({ origin, destination, purchaseWindow, cls, windowDays });

  if (!summary || summary.sample_size === null || Number(summary.sample_size) === 0) {
    throw ApiError.notFound(
      `No fare data found for ${origin} -> ${destination} at ${purchaseWindow} in the last ${windowDays} days`
    );
  }

  return {
    origin,
    destination,
    purchaseWindow,
    window,
    lowestFare: Number(summary.lowest_fare),
    averageFare: Number(summary.average_fare),
    peakFare: Number(summary.peak_fare),
    sampleSize: Number(summary.sample_size),
  };
}

module.exports = {
  getFareTrend,
  getFareSummary,
  WINDOW_DAYS,
  resolveWindowDays,
};

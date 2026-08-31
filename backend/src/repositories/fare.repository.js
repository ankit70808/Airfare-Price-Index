const db = require("../db/postgres");

const TABLE = "flight_pricing_data"; // rename here if your table is named differently

async function getFareTrend({ origin, destination, purchaseWindow, cls }) {
  const result = await db.query(
    `SELECT scrape_date, avg_fare
     FROM ${TABLE}
     WHERE origin = $1
       AND destination = $2
       AND purchasewindow = $3
       AND class = $4
     ORDER BY scrape_date ASC`,
    [origin.toUpperCase(), destination.toUpperCase(), purchaseWindow, cls]
  );
  return result.rows;
}

async function getFareSummary({ origin, destination, purchaseWindow, cls, windowDays }) {
  const result = await db.query(
    `SELECT
        MIN(avg_fare) AS lowest_fare,
        ROUND(AVG(avg_fare), 2) AS average_fare,
        MAX(avg_fare) AS peak_fare,
        COUNT(*) AS sample_size
     FROM ${TABLE}
     WHERE origin = $1
       AND destination = $2
       AND purchasewindow = $3
       AND class = $4
       AND scrape_date >= (CURRENT_DATE - $5::int)`,
    [origin.toUpperCase(), destination.toUpperCase(), purchaseWindow, cls, windowDays]
  );
  return result.rows[0];
}

module.exports = { getFareTrend, getFareSummary, TABLE };
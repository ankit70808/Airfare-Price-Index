const db = require("../db/postgres");

async function getDailyIndexHistory(limit = 30) {
  const result = await db.query(
    `SELECT travel_date, api_index, change_pct, avg_fare, total_flights, total_routes
     FROM index_daily ORDER BY travel_date DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function getLatestDailyIndex() {
  const result = await db.query(
    `SELECT travel_date, api_index, change_pct, avg_fare, total_flights, total_routes
     FROM index_daily ORDER BY travel_date DESC LIMIT 1`
  );
  return result.rows[0];
}

async function getWeeklyIndexHistory(limit = 12) {
  const result = await db.query(
    `SELECT week_start_date, api_index, avg_fare, median_fare, total_flights, total_routes, index_change_pct
     FROM index_weekly ORDER BY week_start_date DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = { getDailyIndexHistory, getLatestDailyIndex, getWeeklyIndexHistory };
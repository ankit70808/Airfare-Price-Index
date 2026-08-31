const db = require("../db/postgres");

async function getLatestMonthlyIndex() {
  const result = await db.query(
    `SELECT month_start_date, api_index, monthly_avg_fare, mom_change_pct,
            yearly_avg_fare, yoy_change_pct, dgca_reported_fare, deviation_pct
     FROM index_monthly
     ORDER BY month_start_date DESC
     LIMIT 1`
  );
  return result.rows[0];
}

async function getMonthlyIndexHistory(limit = 12) {
  const result = await db.query(
    `SELECT month_start_date, api_index, monthly_avg_fare, mom_change_pct,
            yearly_avg_fare, yoy_change_pct
     FROM index_monthly
     ORDER BY month_start_date DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = { getLatestMonthlyIndex, getMonthlyIndexHistory };
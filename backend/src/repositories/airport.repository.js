const db = require("../db/postgres");
const { TABLE } = require("./fare.repository");

async function getDistinctAirports() {
  const result = await db.query(
    `SELECT DISTINCT airport FROM (
       SELECT origin AS airport FROM ${TABLE}
       UNION
       SELECT destination AS airport FROM ${TABLE}
     ) AS airports ORDER BY airport ASC`
  );
  return result.rows.map((r) => r.airport);
}

module.exports = { getDistinctAirports };

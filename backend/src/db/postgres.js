const { Pool } = require("pg");
const config = require("../config/env");
const logger = require("../utils/logger");

const pool = new Pool({
  connectionString: config.db.connectionString,
  ssl: config.db.ssl,
  max: config.db.maxPoolSize,
  idleTimeoutMillis: config.db.idleTimeoutMillis,
  connectionTimeoutMillis: config.db.connectionTimeoutMillis,
});

pool.on("error", (err) => {
  logger.error(`Unexpected Postgres pool error: ${err.message}`);
});

async function query(text, params = []) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const durationMs = Date.now() - start;
  logger.debug(`Query executed in ${durationMs}ms: ${text}`);
  return result;
}

async function getClient() {
  const client = await pool.connect();
  return client;
}

async function checkConnection() {
  const result = await pool.query("SELECT current_database() AS database_name");
  return result.rows[0].database_name;
}

async function shutdown() {
  await pool.end();
}

module.exports = { pool, query, getClient, checkConnection, shutdown };
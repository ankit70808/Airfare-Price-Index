require("dotenv").config();

const REQUIRED_VARS = ["DATABASE_URL", "PORT", "NODE_ENV"];

function getMissingVars() {
  return REQUIRED_VARS.filter((key) => !process.env[key] || process.env[key].trim() === "");
}

function validateEnv() {
  const missing = getMissingVars();
  if (missing.length > 0) {
    console.error(
      `[FATAL] Missing required environment variable(s): ${missing.join(", ")}\n` +
        `Check your .env file against .env.example.`
    );
    process.exit(1);
  }

  const port = Number(process.env.PORT);
  if (!Number.isInteger(port) || port <= 0) {
    console.error(`[FATAL] PORT must be a positive integer, got: ${process.env.PORT}`);
    process.exit(1);
  }
}

validateEnv();

const config = {
  env: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT),

  db: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    maxPoolSize: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
    connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS || 5000),
  },

  cors: {
    allowedOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 100),
  },

  scraper: {
    scriptPath: process.env.SCRAPER_SCRIPT_PATH || "",
    pythonBin: process.env.PYTHON_BIN || "python3",
  },

  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
};

module.exports = config;
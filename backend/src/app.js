const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const config = require("./config/env");
const logger = require("./utils/logger");
const healthRoutes = require("./routes/health.routes");
const apiRoutes = require("./routes/index");
const apiLimiter = require("./middleware/rateLimiter");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.cors.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(
  morgan(config.isProduction ? "combined" : "dev", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Airfare Price Index backend is running" });
});

app.use("/health", healthRoutes);
app.use("/api", apiLimiter, apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
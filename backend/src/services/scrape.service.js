const { spawn } = require("child_process");
const config = require("../config/env");
const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");

let isScrapeRunning = false;

async function triggerScrape({ origin, destination } = {}) {
  if (!config.scraper.scriptPath) {
    throw ApiError.serviceUnavailable(
      "Scraper is not configured yet (SCRAPER_SCRIPT_PATH missing in .env)"
    );
  }
  if (isScrapeRunning) {
    throw ApiError.tooManyRequests("A scrape is already in progress. Try again shortly.");
  }

  const args = [config.scraper.scriptPath];
  if (origin) args.push("--origin", origin);
  if (destination) args.push("--destination", destination);

  isScrapeRunning = true;

  const child = spawn(config.scraper.pythonBin, args, { detached: true, stdio: "ignore" });

  child.on("error", (err) => {
    isScrapeRunning = false;
    logger.error(`Failed to start scraper process: ${err.message}`);
  });

  child.on("exit", (code) => {
    isScrapeRunning = false;
    logger.info(`Scraper process exited with code ${code}`);
  });

  child.unref();

  logger.info(`Scrape triggered${origin ? ` for ${origin} -> ${destination}` : " (full run)"}`);

  return { triggered: true, status: "queued" };
}

module.exports = { triggerScrape };
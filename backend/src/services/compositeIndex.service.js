const repo = require("../repositories/compositeIndex.repository");
const ApiError = require("../utils/ApiError");

async function getDailyIndex(limit) { return repo.getDailyIndexHistory(limit); }

async function getLatestDailyIndex() {
  const latest = await repo.getLatestDailyIndex();
  if (!latest) throw ApiError.notFound("No daily index data available yet");
  return latest;
}

async function getWeeklyIndex(limit) { return repo.getWeeklyIndexHistory(limit); }

module.exports = { getDailyIndex, getLatestDailyIndex, getWeeklyIndex };
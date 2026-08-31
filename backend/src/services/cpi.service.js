const cpiRepository = require("../repositories/cpi.repository");
const ApiError = require("../utils/ApiError");

async function getCpiMetrics() {
  const latest = await cpiRepository.getLatestMonthlyIndex();
  if (!latest) throw ApiError.notFound("No CPI index data available yet");

  return {
    month: latest.month_start_date,
    apiIndex: Number(latest.api_index),
    monthlyAvgFare: Number(latest.monthly_avg_fare),
    momChangePct: latest.mom_change_pct !== null ? Number(latest.mom_change_pct) : null,
    yearlyAvgFare: latest.yearly_avg_fare !== null ? Number(latest.yearly_avg_fare) : null,
    yoyChangePct: latest.yoy_change_pct !== null ? Number(latest.yoy_change_pct) : null,
    dgcaReportedFare: latest.dgca_reported_fare !== null ? Number(latest.dgca_reported_fare) : null,
    deviationPct: latest.deviation_pct !== null ? Number(latest.deviation_pct) : null,
  };
}

async function getMonthlyIndexHistory(limit) {
  return cpiRepository.getMonthlyIndexHistory(limit);
}

module.exports = { getCpiMetrics, getMonthlyIndexHistory };
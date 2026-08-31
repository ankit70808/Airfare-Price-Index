const fareService = require("../../src/services/fare.service");

describe("fare.service resolveWindowDays", () => {
  test("maps known windows to day counts", () => {
    expect(fareService.resolveWindowDays("1M")).toBe(30);
    expect(fareService.resolveWindowDays("1Y")).toBe(365);
  });

  test("throws ApiError on unknown window", () => {
    expect(() => fareService.resolveWindowDays("2M")).toThrow(/Invalid window/);
  });
});

describe("fare.service computeTrendDirection", () => {
  test("returns 'flat' for fewer than 2 points", () => {
    expect(fareService.computeTrendDirection([])).toBe("flat");
  });

  test("detects a rising trend", () => {
    const points = [{ avg_fare: 5000 }, { avg_fare: 5100 }, { avg_fare: 6000 }, { avg_fare: 6200 }];
    expect(fareService.computeTrendDirection(points)).toBe("rising");
  });

  test("detects a falling trend", () => {
    const points = [{ avg_fare: 6200 }, { avg_fare: 6000 }, { avg_fare: 5100 }, { avg_fare: 5000 }];
    expect(fareService.computeTrendDirection(points)).toBe("falling");
  });
});
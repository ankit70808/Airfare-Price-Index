const request = require("supertest");
const app = require("../../src/app");

describe("GET /health/live", () => {
  test("returns 200 and service status", async () => {
    const res = await request(app).get("/health/live");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("GET /unknown-route", () => {
  test("returns 404 with a consistent error shape", async () => {
    const res = await request(app).get("/this-route-does-not-exist");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../app/index.js";

describe("health routes", () => {
  const app = createApp();

  it("GET /api/health returns 200 with an ok payload", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("car-garage-api");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
  });
});

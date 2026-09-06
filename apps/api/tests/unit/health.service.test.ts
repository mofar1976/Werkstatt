import { describe, expect, it } from "vitest";
import { healthService } from "../../app/services/health.service.js";

describe("healthService", () => {
  it("returns an ok status for the api", () => {
    const status = healthService.getStatus();
    expect(status.status).toBe("ok");
    expect(status.service).toBe("car-garage-api");
    expect(() => new Date(status.timestamp).toISOString()).not.toThrow();
  });
});

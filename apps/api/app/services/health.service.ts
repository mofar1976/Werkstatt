import type { HealthResponse } from "@car-garage/shared";


export const healthService = {
  getStatus(): HealthResponse {
    return {
      status: "ok",
      service: "car-garage-api",
      timestamp: new Date().toISOString(),
    };
  },
};

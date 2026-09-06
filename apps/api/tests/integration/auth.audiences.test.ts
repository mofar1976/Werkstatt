import { describe, expect, it } from "vitest";
import request from "supertest";
import { AuthAudience, UserRole } from "@car-garage/shared";
import { createApp } from "../../app/index.js";
import { authService } from "../../app/services/auth.service.js";
import { useTestDatabase } from "../helpers/db.js";

useTestDatabase();

const app = createApp();

async function createAdminAndLogin() {
  await authService.register(
    AuthAudience.ADMIN,
    {
      email: "root@car-garage.test",
      password: "admin-password",
      firstName: "Root",
      lastName: "Admin",
    },
    { roles: [UserRole.PLATFORM_ADMIN] },
  );
  const login = await request(app).post("/api/auth/admin/login").send({
    email: "root@car-garage.test",
    password: "admin-password",
  });
  return login.body.tokens.accessToken as string;
}

describe("audience separation", () => {
  it("does not accept a customer token on the workshop portal", async () => {
    const register = await request(app).post("/api/auth/customer/register").send({
      email: "c@example.com",
      password: "customer-pass",
      firstName: "C",
      lastName: "C",
    });
    const customerToken = register.body.tokens.accessToken;

    const res = await request(app)
      .get("/api/auth/workshop/me")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(401);
  });

  it("blocks workshop registration without an admin token", async () => {
    const res = await request(app).post("/api/auth/workshop/register").send({
      email: "w@example.com",
      password: "workshop-pass",
      firstName: "W",
      lastName: "W",
    });
    expect(res.status).toBe(401);
  });

  it("lets a platform admin create a workshop account", async () => {
    const adminToken = await createAdminAndLogin();

    const res = await request(app)
      .post("/api/auth/workshop/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "w@example.com",
        password: "workshop-pass",
        firstName: "Wanda",
        lastName: "Workshop",
      });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      audience: "WORKSHOP",
      roles: ["WORKSHOP_MEMBER"],
    });
  });

  it("allows the same email across two audiences", async () => {
    await request(app).post("/api/auth/customer/register").send({
      email: "dual@example.com",
      password: "customer-pass",
      firstName: "D",
      lastName: "D",
    });
    const adminToken = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/auth/workshop/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "dual@example.com",
        password: "workshop-pass",
        firstName: "D",
        lastName: "D",
      });
    expect(res.status).toBe(201);
  });
});

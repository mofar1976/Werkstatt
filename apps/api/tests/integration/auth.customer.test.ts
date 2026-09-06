import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../app/index.js";
import { useTestDatabase } from "../helpers/db.js";

useTestDatabase();

const app = createApp();
const base = "/api/auth/customer";

const validRegistration = {
  email: "customer@example.com",
  password: "sup3rsecret",
  firstName: "Carla",
  lastName: "Customer",
};

async function registerCustomer() {
  return request(app).post(`${base}/register`).send(validRegistration);
}

describe("customer auth", () => {
  it("registers a new customer and returns tokens", async () => {
    const res = await registerCustomer();
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: "customer@example.com",
      audience: "CUSTOMER",
      roles: ["CUSTOMER"],
    });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.tokens.accessToken).toBeTypeOf("string");
    expect(res.body.tokens.refreshToken).toBeTypeOf("string");
  });

  it("rejects a duplicate registration", async () => {
    await registerCustomer();
    const res = await registerCustomer();
    expect(res.status).toBe(409);
  });

  it("rejects invalid registration input", async () => {
    const res = await request(app)
      .post(`${base}/register`)
      .send({ email: "not-an-email", password: "short" });
    expect(res.status).toBe(400);
  });

  describe("with a registered customer", () => {
    beforeEach(registerCustomer);

    it("logs in with correct credentials", async () => {
      const res = await request(app).post(`${base}/login`).send({
        email: validRegistration.email,
        password: validRegistration.password,
      });
      expect(res.status).toBe(200);
      expect(res.body.tokens.accessToken).toBeTypeOf("string");
    });

    it("rejects a wrong password", async () => {
      const res = await request(app)
        .post(`${base}/login`)
        .send({ email: validRegistration.email, password: "wrong-pass" });
      expect(res.status).toBe(401);
    });

    it("returns the current user from /me with a valid token", async () => {
      const login = await request(app).post(`${base}/login`).send({
        email: validRegistration.email,
        password: validRegistration.password,
      });
      const res = await request(app)
        .get(`${base}/me`)
        .set("Authorization", `Bearer ${login.body.tokens.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe(validRegistration.email);
    });

    it("rejects /me without a token", async () => {
      const res = await request(app).get(`${base}/me`);
      expect(res.status).toBe(401);
    });

    it("rotates the refresh token and invalidates the old one", async () => {
      const login = await request(app).post(`${base}/login`).send({
        email: validRegistration.email,
        password: validRegistration.password,
      });
      const first = login.body.tokens.refreshToken;

      const refreshed = await request(app)
        .post(`${base}/refresh`)
        .send({ refreshToken: first });
      expect(refreshed.status).toBe(200);
      expect(refreshed.body.tokens.refreshToken).not.toBe(first);

      const reuse = await request(app)
        .post(`${base}/refresh`)
        .send({ refreshToken: first });
      expect(reuse.status).toBe(401);
    });

    it("invalidates the refresh token on logout", async () => {
      const login = await request(app).post(`${base}/login`).send({
        email: validRegistration.email,
        password: validRegistration.password,
      });
      const refreshToken = login.body.tokens.refreshToken;

      const logout = await request(app)
        .post(`${base}/logout`)
        .send({ refreshToken });
      expect(logout.status).toBe(204);

      const refresh = await request(app)
        .post(`${base}/refresh`)
        .send({ refreshToken });
      expect(refresh.status).toBe(401);
    });
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { AuthAudience, UserRole } from "@car-garage/shared";
import { createApp } from "../../app/index.js";
import { authService } from "../../app/services/auth.service.js";
import { useTestDatabase } from "../helpers/db.js";

useTestDatabase();

const app = createApp();
const base = "/api/admin/workshops";

const workshopPayload = {
  name: "Autohaus Nord",
  description: "Freie Werkstatt",
  email: "kontakt@nord.test",
  phone: "+49 30 111",
  address: {
    street: "Seestraße 12",
    city: "Berlin",
    postalCode: "13353",
    country: "DE",
  },
  location: { lat: 52.54, lng: 13.36 },
};

async function adminToken(): Promise<string> {
  await authService.register(
    AuthAudience.ADMIN,
    {
      email: "admin@car-garage.test",
      password: "admin-password",
      firstName: "Root",
      lastName: "Admin",
    },
    { roles: [UserRole.PLATFORM_ADMIN] },
  );
  const login = await request(app)
    .post("/api/auth/admin/login")
    .send({ email: "admin@car-garage.test", password: "admin-password" });
  return login.body.tokens.accessToken;
}

describe("admin workshop management", () => {
  let token: string;

  beforeEach(async () => {
    token = await adminToken();
  });

  const authed = (method: "get" | "post" | "patch" | "delete", url: string) =>
    request(app)[method](url).set("Authorization", `Bearer ${token}`);

  it("rejects unauthenticated access", async () => {
    expect((await request(app).get(base)).status).toBe(401);
  });

  it("rejects a customer token", async () => {
    const reg = await request(app).post("/api/auth/customer/register").send({
      email: "c@example.com",
      password: "customer-pass",
      firstName: "C",
      lastName: "C",
    });
    const res = await request(app)
      .get(base)
      .set("Authorization", `Bearer ${reg.body.tokens.accessToken}`);
    expect(res.status).toBe(401);
  });

  it("creates a workshop with a slug and PENDING status", async () => {
    const res = await authed("post", base).send(workshopPayload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: "Autohaus Nord",
      slug: "autohaus-nord",
      status: "PENDING",
      memberCount: 0,
    });
    expect(res.body.location).toEqual({ lat: 52.54, lng: 13.36 });
  });

  it("derives unique slugs for duplicate names", async () => {
    await authed("post", base).send(workshopPayload);
    const second = await authed("post", base).send(workshopPayload);
    expect(second.body.slug).toBe("autohaus-nord-2");
  });

  it("validates the payload", async () => {
    const res = await authed("post", base).send({ name: "x" });
    expect(res.status).toBe(400);
  });

  it("creates and lists a workshop without a location", async () => {
    const { location: _omit, ...noLocation } = workshopPayload;
    const created = await authed("post", base).send(noLocation);
    expect(created.status).toBe(201);
    expect(created.body.location).toBeUndefined();

    const list = await authed("get", base);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0].location).toBeUndefined();
  });

  describe("with an existing workshop", () => {
    let id: string;

    beforeEach(async () => {
      const res = await authed("post", base).send(workshopPayload);
      id = res.body.id;
    });

    it("lists and filters by status", async () => {
      const all = await authed("get", base);
      expect(all.body.total).toBe(1);

      const active = await authed("get", `${base}?status=ACTIVE`);
      expect(active.body.total).toBe(0);
    });

    it("searches by name and city", async () => {
      const byCity = await authed("get", `${base}?search=berlin`);
      expect(byCity.body.total).toBe(1);
      const miss = await authed("get", `${base}?search=hamburg`);
      expect(miss.body.total).toBe(0);
    });

    it("gets one by id", async () => {
      const res = await authed("get", `${base}/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
    });

    it("returns 404 for an unknown id", async () => {
      expect((await authed("get", `${base}/64b000000000000000000000`)).status).toBe(
        404,
      );
      expect((await authed("get", `${base}/not-an-id`)).status).toBe(404);
    });

    it("updates fields", async () => {
      const res = await authed("patch", `${base}/${id}`).send({
        description: "Neue Beschreibung",
        phone: "+49 30 999",
      });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe("Neue Beschreibung");
      expect(res.body.phone).toBe("+49 30 999");
    });

    it("activates and deactivates", async () => {
      const activated = await authed("post", `${base}/${id}/activate`);
      expect(activated.body.status).toBe("ACTIVE");
      const deactivated = await authed("post", `${base}/${id}/deactivate`);
      expect(deactivated.body.status).toBe("SUSPENDED");
    });

    it("deletes the workshop and its members", async () => {
      await authed("post", `${base}/${id}/members`).send({
        email: "mech@nord.test",
        firstName: "Mia",
        lastName: "Mechanic",
        password: "mechanic-pass",
      });

      const del = await authed("delete", `${base}/${id}`);
      expect(del.status).toBe(204);
      // Soft-deleted: no longer visible anywhere.
      expect((await authed("get", `${base}/${id}`)).status).toBe(404);
      const list = await authed("get", base);
      expect(list.body.total).toBe(0);
    });

    it("frees the slug and member email after a soft delete", async () => {
      await authed("post", `${base}/${id}/members`).send({
        email: "reuse@nord.test",
        firstName: "R",
        lastName: "R",
        password: "reuse-pass-1",
      });
      await authed("delete", `${base}/${id}`);

      // Same name -> same base slug is available again.
      const recreated = await authed("post", base).send(workshopPayload);
      expect(recreated.status).toBe(201);
      expect(recreated.body.slug).toBe("autohaus-nord");

      // Same member email can be added to the new workshop.
      const readd = await authed(
        "post",
        `${base}/${recreated.body.id}/members`,
      ).send({
        email: "reuse@nord.test",
        firstName: "R",
        lastName: "R",
        password: "reuse-pass-2",
      });
      expect(readd.status).toBe(201);
    });

    it("blocks login for a removed member", async () => {
      const add = await authed("post", `${base}/${id}/members`).send({
        email: "gone@nord.test",
        firstName: "G",
        lastName: "G",
        password: "gone-pass",
      });
      await authed("delete", `${base}/${id}/members/${add.body.id}`);

      const login = await request(app)
        .post("/api/auth/workshop/login")
        .send({ email: "gone@nord.test", password: "gone-pass" });
      expect(login.status).toBe(401);
    });

    describe("members", () => {
      it("adds a mechanic and counts them", async () => {
        const res = await authed("post", `${base}/${id}/members`).send({
          email: "mech@nord.test",
          firstName: "Mia",
          lastName: "Mechanic",
          password: "mechanic-pass",
        });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
          role: "MEMBER",
          user: { email: "mech@nord.test", firstName: "Mia" },
        });

        const detail = await authed("get", `${base}/${id}`);
        expect(detail.body.memberCount).toBe(1);

        const members = await authed("get", `${base}/${id}/members`);
        expect(members.body.items).toHaveLength(1);
      });

      it("rejects a duplicate member email", async () => {
        const payload = {
          email: "mech@nord.test",
          firstName: "Mia",
          lastName: "Mechanic",
          password: "mechanic-pass",
        };
        await authed("post", `${base}/${id}/members`).send(payload);
        const dup = await authed("post", `${base}/${id}/members`).send(payload);
        expect(dup.status).toBe(409);
      });

      it("changes a member role and removes the member", async () => {
        const add = await authed("post", `${base}/${id}/members`).send({
          email: "boss@nord.test",
          firstName: "Bea",
          lastName: "Boss",
          password: "boss-pass",
        });
        const memberId = add.body.id;

        const promoted = await authed(
          "patch",
          `${base}/${id}/members/${memberId}`,
        ).send({ role: "CHEF" });
        expect(promoted.body.role).toBe("CHEF");

        const removed = await authed(
          "delete",
          `${base}/${id}/members/${memberId}`,
        );
        expect(removed.status).toBe(204);

        const members = await authed("get", `${base}/${id}/members`);
        expect(members.body.items).toHaveLength(0);
      });
    });
  });
});

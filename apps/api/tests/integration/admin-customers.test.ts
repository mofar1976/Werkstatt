import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { AuthAudience, UserRole, WorkshopRole, WorkshopStatus } from "@car-garage/shared";
import { createApp } from "../../app/index.js";
import { authService } from "../../app/services/auth.service.js";
import { workshopService } from "../../app/services/workshop.service.js";
import { appointmentSlotService } from "../../app/services/appointment-slot.service.js";
import { carCatalogService } from "../../app/services/car-catalog.service.js";
import { useTestDatabase } from "../helpers/db.js";

useTestDatabase();

const app = createApp();
const base = "/api/admin/customers";

function inHours(hours: number): Date {
  const d = new Date(Date.now() + hours * 3_600_000);
  d.setSeconds(0, 0);
  return d;
}

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
  return login.body.tokens.accessToken as string;
}

function registerCustomer(email: string, firstName = "Carla", lastName = "Customer") {
  return request(app)
    .post("/api/auth/customer/register")
    .send({ email, password: "customer-pass", firstName, lastName });
}

describe("admin customer management", () => {
  let token: string;
  const authed = (m: "get" | "post" | "patch" | "delete", url: string) =>
    request(app)[m](url).set("Authorization", `Bearer ${token}`);

  beforeEach(async () => {
    token = await adminToken();
  });

  it("rejects unauthenticated access", async () => {
    expect((await request(app).get(base)).status).toBe(401);
  });

  it("rejects a customer token", async () => {
    const reg = await registerCustomer("c@example.com");
    const res = await request(app)
      .get(base)
      .set("Authorization", `Bearer ${reg.body.tokens.accessToken}`);
    expect(res.status).toBe(401);
  });

  it("lists customers, newest first, and searches by name or email", async () => {
    await registerCustomer("anna@customer.test", "Anna", "Meyer");
    await registerCustomer("bob@customer.test", "Bob", "Schulz");

    const all = await authed("get", base);
    expect(all.body.total).toBe(2);
    expect(all.body.items[0].email).toBe("bob@customer.test");
    expect(all.body.items[0]).toMatchObject({ isActive: true, appointmentCount: 0 });

    expect((await authed("get", `${base}?search=meyer`)).body.total).toBe(1);
    expect((await authed("get", `${base}?search=anna@customer`)).body.total).toBe(1);
  });

  it("does not list admins or workshop members", async () => {
    const workshop = await workshopService.create({
      name: "Autohaus Nord",
      address: { street: "Seestraße 12", city: "Berlin", postalCode: "13353", country: "DE" },
    });
    await workshopService.addMember(workshop.id, {
      email: "chef@nord.test",
      firstName: "C",
      lastName: "N",
      password: "chef-pass",
      role: WorkshopRole.CHEF,
    });
    await registerCustomer("carla@customer.test");

    const res = await authed("get", base);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].email).toBe("carla@customer.test");
  });

  describe("with one customer", () => {
    let customerId: string;

    beforeEach(async () => {
      await registerCustomer("carla@customer.test");
      const res = await authed("get", base);
      customerId = res.body.items[0].id;
    });

    it("returns the customer detail", async () => {
      const res = await authed("get", `${base}/${customerId}`);
      expect(res.body).toMatchObject({
        email: "carla@customer.test",
        firstName: "Carla",
        isActive: true,
      });
    });

    it("404s for an unknown id", async () => {
      expect((await authed("get", `${base}/64b000000000000000000000`)).status).toBe(404);
    });

    it("updates name and phone", async () => {
      const res = await authed("patch", `${base}/${customerId}`).send({
        lastName: "Neumann",
        phone: "+49 30 1234",
      });
      expect(res.body).toMatchObject({ lastName: "Neumann", phone: "+49 30 1234" });
    });

    it("blocks a customer: login is refused and sessions are cut", async () => {
      const block = await authed("post", `${base}/${customerId}/block`);
      expect(block.body.isActive).toBe(false);

      const login = await request(app)
        .post("/api/auth/customer/login")
        .send({ email: "carla@customer.test", password: "customer-pass" });
      expect(login.status).toBe(401);
    });

    it("unblocks a customer again", async () => {
      await authed("post", `${base}/${customerId}/block`);
      const unblock = await authed("post", `${base}/${customerId}/unblock`);
      expect(unblock.body.isActive).toBe(true);

      const login = await request(app)
        .post("/api/auth/customer/login")
        .send({ email: "carla@customer.test", password: "customer-pass" });
      expect(login.status).toBe(200);
    });

    it("filters by status", async () => {
      await registerCustomer("bob@customer.test", "Bob", "Schulz");
      await authed("post", `${base}/${customerId}/block`);

      expect((await authed("get", `${base}?status=blocked`)).body.total).toBe(1);
      expect((await authed("get", `${base}?status=active`)).body.total).toBe(1);
    });

    it("soft-deletes a customer and frees the email for re-registration", async () => {
      const del = await authed("delete", `${base}/${customerId}`);
      expect(del.status).toBe(204);
      expect((await authed("get", `${base}/${customerId}`)).status).toBe(404);
      expect((await authed("get", base)).body.total).toBe(0);

      const reg = await registerCustomer("carla@customer.test");
      expect(reg.status).toBe(201);
    });
  });

  it("counts a customer's appointments", async () => {
    const workshop = await workshopService.create({
      name: "Autohaus Nord",
      address: { street: "Seestraße 12", city: "Berlin", postalCode: "13353", country: "DE" },
    });
    await workshopService.setStatus(workshop.id, WorkshopStatus.ACTIVE);
    const slot = await appointmentSlotService.create(workshop.id, {
      startsAt: inHours(24),
      endsAt: inHours(25),
    });
    const brand = await carCatalogService.createBrand({ name: "BMW" });
    const model = await carCatalogService.createModel(brand.id, { name: "7er Reihe" });

    const reg = await registerCustomer("carla@customer.test");
    await request(app)
      .post(`/api/customer/workshops/${workshop.id}/appointments`)
      .set("Authorization", `Bearer ${reg.body.tokens.accessToken}`)
      .send({
        slotId: slot.id,
        problemDescription: "Bremsen quietschen vorne links.",
        vehicle: { brandId: brand.id, modelId: model.id },
      });

    const res = await authed("get", base);
    expect(res.body.items[0].appointmentCount).toBe(1);
  });
});

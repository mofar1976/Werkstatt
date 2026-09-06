import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import {
  AuthAudience,
  UserRole,
  WorkshopRole,
  WorkshopStatus,
} from "@car-garage/shared";
import { createApp } from "../../app/index.js";
import { authService } from "../../app/services/auth.service.js";
import { workshopService } from "../../app/services/workshop.service.js";
import { appointmentSlotService } from "../../app/services/appointment-slot.service.js";
import { carCatalogService } from "../../app/services/car-catalog.service.js";
import { useTestDatabase } from "../helpers/db.js";

useTestDatabase();

const app = createApp();

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

/** One active workshop with a booked appointment turned into a sent estimate. */
async function scenario() {
  const active = await workshopService.create({
    name: "Autohaus Nord",
    address: { street: "S 1", city: "Berlin", postalCode: "13353", country: "DE" },
  });
  await workshopService.setStatus(active.id, WorkshopStatus.ACTIVE);
  await workshopService.addMember(active.id, {
    email: "chef@nord.test",
    firstName: "C",
    lastName: "N",
    password: "chef-pass",
    role: WorkshopRole.CHEF,
  });
  // A second workshop left PENDING.
  await workshopService.create({
    name: "KFZ Wartend",
    address: { street: "S 2", city: "Hamburg", postalCode: "20095", country: "DE" },
  });

  const brand = await carCatalogService.createBrand({ name: "BMW" });
  const model = await carCatalogService.createModel(brand.id, { name: "3er" });
  const slot = await appointmentSlotService.create(active.id, {
    startsAt: inHours(24),
    endsAt: inHours(25),
  });
  const slot2 = await appointmentSlotService.create(active.id, {
    startsAt: inHours(48),
    endsAt: inHours(49),
  });

  const chefToken = (
    await request(app)
      .post("/api/auth/workshop/login")
      .send({ email: "chef@nord.test", password: "chef-pass" })
  ).body.tokens.accessToken as string;

  const customerToken = (
    await request(app).post("/api/auth/customer/register").send({
      email: "carla@customer.test",
      password: "customer-pass",
      firstName: "Carla",
      lastName: "C",
    })
  ).body.tokens.accessToken as string;

  const booking = await request(app)
    .post(`/api/customer/workshops/${active.id}/appointments`)
    .set("Authorization", `Bearer ${customerToken}`)
    .send({
      slotId: slot.id,
      problemDescription: "Bremsen quietschen vorne.",
      vehicle: { brandId: brand.id, modelId: model.id },
    });

  const ws = (m: "post" | "patch", url: string) =>
    request(app)[m](url).set("Authorization", `Bearer ${chefToken}`);
  const wsBase = "/api/workshop/my-workshop/repair-orders";
  const order = await ws("post", wsBase).send({ appointmentId: booking.body.id });
  await ws("patch", `${wsBase}/${order.body.id}/diagnosis`).send({
    cause: "Bremsbeläge verschlissen.",
    quote: {
      lineItems: [
        { kind: "PART", partAction: "REPLACE", description: "Bremsbeläge", quantity: 1, unitPriceCents: 8000 },
        { kind: "LABOR", description: "Arbeitslohn", quantity: 1, unitPriceCents: 7000 },
      ],
    },
  });
  await ws("post", `${wsBase}/${order.body.id}/send-quote`);

  // A second appointment that stays CONFIRMED (no repair order).
  await request(app)
    .post(`/api/customer/workshops/${active.id}/appointments`)
    .set("Authorization", `Bearer ${customerToken}`)
    .send({
      slotId: slot2.id,
      problemDescription: "Inspektion fällig.",
      vehicle: { brandId: brand.id, modelId: model.id },
    });

  return { workshopId: active.id, appointmentId: booking.body.id as string };
}

describe("admin dashboard", () => {
  let token: string;
  const authed = (url: string) =>
    request(app).get(url).set("Authorization", `Bearer ${token}`);

  beforeEach(async () => {
    token = await adminToken();
  });

  it("requires a platform-admin token", async () => {
    expect((await request(app).get("/api/admin/overview")).status).toBe(401);
  });

  it("returns platform-wide figures", async () => {
    await scenario();

    const res = await authed("/api/admin/overview");
    expect(res.status).toBe(200);
    expect(res.body.workshops).toMatchObject({
      total: 2,
      active: 1,
      pending: 1,
      suspended: 0,
    });
    expect(res.body.customers).toMatchObject({ total: 1, blocked: 0 });
    // One appointment became COMPLETED via its repair order; the second stays CONFIRMED.
    expect(res.body.appointments).toMatchObject({ upcoming: 1, total: 2 });
    expect(res.body.repairOrders).toMatchObject({
      open: 1,
      awaitingApproval: 1,
      total: 1,
    });
    expect(res.body.catalog).toMatchObject({ brands: 1, models: 1 });
    expect(res.body.pendingWorkshops).toHaveLength(1);
    expect(res.body.pendingWorkshops[0]).toMatchObject({
      name: "KFZ Wartend",
      city: "Hamburg",
    });
    expect(res.body.recentAppointments).toHaveLength(2);
    expect(res.body.recentAppointments[0].customer).toMatchObject({
      email: "carla@customer.test",
    });
  });

  it("lists appointments across every workshop with customer + workshop", async () => {
    await scenario();

    const res = await authed("/api/admin/appointments");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.items[0]).toMatchObject({
      workshopName: "Autohaus Nord",
      customer: { firstName: "Carla" },
    });

    expect(
      (await authed("/api/admin/appointments?status=CONFIRMED")).body.total,
    ).toBe(1);
    expect(
      (await authed("/api/admin/appointments?status=CANCELLED")).body.total,
    ).toBe(0);
  });

  it("lists repair orders across every workshop", async () => {
    await scenario();

    const res = await authed("/api/admin/repair-orders");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0]).toMatchObject({
      workshopName: "Autohaus Nord",
      status: "QUOTE_PENDING_APPROVAL",
    });
    expect(res.body.items[0].quote.grossCents).toBeGreaterThan(0);

    expect(
      (await authed("/api/admin/repair-orders?status=CLOSED")).body.total,
    ).toBe(0);
  });
});

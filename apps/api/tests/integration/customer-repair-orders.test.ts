import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { WorkshopRole, WorkshopStatus } from "@car-garage/shared";
import { createApp } from "../../app/index.js";
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

/** Full setup up to a repair order with a *sent* estimate. */
async function scenario() {
  const workshop = await workshopService.create({
    name: "Autohaus Nord",
    address: { street: "S 1", city: "Berlin", postalCode: "13353", country: "DE" },
  });
  await workshopService.setStatus(workshop.id, WorkshopStatus.ACTIVE);
  await workshopService.addMember(workshop.id, {
    email: "chef@nord.test",
    firstName: "C",
    lastName: "N",
    password: "chef-pass",
    role: WorkshopRole.CHEF,
  });
  const brand = await carCatalogService.createBrand({ name: "BMW" });
  const model = await carCatalogService.createModel(brand.id, { name: "7er" });
  const slot = await appointmentSlotService.create(workshop.id, {
    startsAt: inHours(24),
    endsAt: inHours(25),
  });

  const wLogin = await request(app)
    .post("/api/auth/workshop/login")
    .send({ email: "chef@nord.test", password: "chef-pass" });
  const workshopToken = wLogin.body.tokens.accessToken as string;

  const reg = await request(app).post("/api/auth/customer/register").send({
    email: "carla@customer.test",
    password: "customer-pass",
    firstName: "Carla",
    lastName: "C",
  });
  const customerToken = reg.body.tokens.accessToken as string;

  const otherReg = await request(app).post("/api/auth/customer/register").send({
    email: "eve@customer.test",
    password: "customer-pass",
    firstName: "Eve",
    lastName: "E",
  });

  const booking = await request(app)
    .post(`/api/customer/workshops/${workshop.id}/appointments`)
    .set("Authorization", `Bearer ${customerToken}`)
    .send({
      slotId: slot.id,
      problemDescription: "Bremsen quietschen.",
      vehicle: { brandId: brand.id, modelId: model.id },
    });

  const ws = (m: "post" | "patch", url: string) =>
    request(app)[m](url).set("Authorization", `Bearer ${workshopToken}`);
  const wsBase = "/api/workshop/my-workshop/repair-orders";

  const order = await ws("post", wsBase).send({ appointmentId: booking.body.id });
  const orderId = order.body.id as string;
  await ws("patch", `${wsBase}/${orderId}/diagnosis`).send({
    cause: "Bremsbeläge verschlissen.",
    quote: {
      lineItems: [
        { kind: "PART", partAction: "REPLACE", description: "Bremsbeläge", quantity: 1, unitPriceCents: 8000 },
        { kind: "LABOR", description: "Arbeitslohn", quantity: 1, unitPriceCents: 7000 },
      ],
      notes: "Reparatur dauert ca. 1 Tag.",
    },
  });
  await ws("post", `${wsBase}/${orderId}/send-quote`);

  return {
    orderId,
    customerToken,
    otherToken: otherReg.body.tokens.accessToken as string,
    workshopToken,
  };
}

describe("customer portal – repair orders", () => {
  let s: Awaited<ReturnType<typeof scenario>>;

  beforeEach(async () => {
    s = await scenario();
  });

  const cust = (m: "get" | "post", url: string) =>
    request(app)[m](url).set("Authorization", `Bearer ${s.customerToken}`);
  const base = "/api/customer/repair-orders";

  it("lists and reads only the customer's own orders", async () => {
    const list = await cust("get", base);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0]).toMatchObject({
      status: "QUOTE_PENDING_APPROVAL",
      quote: { status: "SENT", grossCents: 17850, notes: "Reparatur dauert ca. 1 Tag." },
    });
    // No internal-only customer contact on the customer's own view.
    expect(list.body.items[0].customer).toBeUndefined();

    const mine = await cust("get", `${base}/${s.orderId}`);
    expect(mine.status).toBe(200);
    expect(mine.body.timeline.length).toBeGreaterThan(0);

    const other = await request(app)
      .get(`${base}/${s.orderId}`)
      .set("Authorization", `Bearer ${s.otherToken}`);
    expect(other.status).toBe(404);
  });

  it("approves the estimate: order moves to QUOTE_APPROVED", async () => {
    const res = await cust("post", `${base}/${s.orderId}/approve`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "QUOTE_APPROVED",
      quote: { status: "APPROVED" },
    });
    expect(res.body.timeline.some((e: { type: string }) => e.type === "QUOTE_APPROVED")).toBe(
      true,
    );

    // Second decision is refused.
    expect((await cust("post", `${base}/${s.orderId}/approve`)).status).toBe(409);
  });

  it("rejecting the estimate ends the order", async () => {
    const res = await cust("post", `${base}/${s.orderId}/reject`).send({
      reason: "Zu teuer.",
    });
    expect(res.body).toMatchObject({
      status: "QUOTE_REJECTED",
      quote: { status: "REJECTED", rejectionReason: "Zu teuer." },
    });

    expect((await cust("post", `${base}/${s.orderId}/approve`)).status).toBe(409);
  });

  it("refuses a decision when nothing is pending", async () => {
    await cust("post", `${base}/${s.orderId}/approve`);
    // now QUOTE_APPROVED, workshop starts the repair
    await request(app)
      .post(`/api/workshop/my-workshop/repair-orders/${s.orderId}/status`)
      .set("Authorization", `Bearer ${s.workshopToken}`)
      .send({ status: "REPAIR_IN_PROGRESS" });

    expect((await cust("post", `${base}/${s.orderId}/reject`)).status).toBe(409);
  });
});

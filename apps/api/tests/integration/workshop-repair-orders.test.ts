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

async function scenario() {
  const workshop = await workshopService.create({
    name: "Autohaus Nord",
    address: { street: "S 1", city: "Berlin", postalCode: "13353", country: "DE" },
  });
  await workshopService.setStatus(workshop.id, WorkshopStatus.ACTIVE);
  const chef = await workshopService.addMember(workshop.id, {
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
  const reg = await request(app).post("/api/auth/customer/register").send({
    email: "carla@customer.test",
    password: "customer-pass",
    firstName: "Carla",
    lastName: "C",
  });
  const customerToken = reg.body.tokens.accessToken as string;

  const booking = await request(app)
    .post(`/api/customer/workshops/${workshop.id}/appointments`)
    .set("Authorization", `Bearer ${customerToken}`)
    .send({
      slotId: slot.id,
      problemDescription: "Bremsen quietschen vorne.",
      vehicle: { brandId: brand.id, modelId: model.id },
    });

  return {
    workshopId: workshop.id,
    chefMemberId: chef.id,
    appointmentId: booking.body.id as string,
    workshopToken: wLogin.body.tokens.accessToken as string,
    customerToken,
  };
}

describe("workshop portal – repair orders", () => {
  let s: Awaited<ReturnType<typeof scenario>>;

  beforeEach(async () => {
    s = await scenario();
  });

  const ws = (m: "get" | "post" | "patch" | "put", url: string) =>
    request(app)[m](url).set("Authorization", `Bearer ${s.workshopToken}`);
  const base = "/api/workshop/my-workshop/repair-orders";

  async function createOrder(): Promise<string> {
    const res = await ws("post", base).send({ appointmentId: s.appointmentId });
    expect(res.status).toBe(201);
    return res.body.id as string;
  }

  it("rejects a customer token", async () => {
    const res = await request(app)
      .get(base)
      .set("Authorization", `Bearer ${s.customerToken}`);
    expect(res.status).toBe(401);
  });

  it("creates an order from an appointment and completes the appointment", async () => {
    const res = await ws("post", base).send({ appointmentId: s.appointmentId });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: "VEHICLE_RECEIVED",
      problemDescription: "Bremsen quietschen vorne.",
      vehicle: { brandName: "BMW", modelName: "7er" },
      customer: { firstName: "Carla" },
      quote: { status: "DRAFT", lineItems: [], grossCents: 0 },
    });
    expect(res.body.timeline).toHaveLength(1);
    expect(res.body.timeline[0].type).toBe("ORDER_CREATED");

    const appt = await request(app)
      .get(`/api/workshop/my-workshop/appointments/${s.appointmentId}`)
      .set("Authorization", `Bearer ${s.workshopToken}`);
    expect(appt.body.status).toBe("COMPLETED");
    expect(appt.body.repairOrderId).toBe(res.body.id);
  });

  it("rejects a second order for the same appointment", async () => {
    await createOrder();
    const dup = await ws("post", base).send({ appointmentId: s.appointmentId });
    expect(dup.status).toBe(409);
  });

  it("lists eligible appointments and drops them once they have an order", async () => {
    const before = await ws("get", `${base}/candidates`);
    expect(before.body.items.map((a: { id: string }) => a.id)).toContain(
      s.appointmentId,
    );

    await createOrder();

    const after = await ws("get", `${base}/candidates`);
    expect(after.body.items.map((a: { id: string }) => a.id)).not.toContain(
      s.appointmentId,
    );
  });

  it("computes net / VAT / gross from the line items", async () => {
    const id = await createOrder();
    const res = await ws("patch", `${base}/${id}/diagnosis`).send({
      cause: "Bremsbeläge und Scheiben vorne verschlissen.",
      quote: {
        taxRatePercent: 19,
        lineItems: [
          { kind: "PART", partAction: "REPLACE", description: "Bremsbeläge vorne", quantity: 1, unitPriceCents: 6000 },
          { kind: "PART", partAction: "REPLACE", description: "Bremsscheiben vorne", quantity: 2, unitPriceCents: 4500 },
          { kind: "LABOR", description: "Arbeitslohn", quantity: 1.5, unitPriceCents: 9000 },
        ],
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("DIAGNOSIS_IN_PROGRESS");
    // 6000 + 9000 + 13500 = 28500 net; 19% = 5415; gross 33915
    expect(res.body.quote).toMatchObject({
      netCents: 28500,
      taxCents: 5415,
      grossCents: 33915,
    });
    expect(res.body.quote.lineItems[2].lineTotalCents).toBe(13500);
  });

  it("rejects a PART line item without a partAction", async () => {
    const id = await createOrder();
    const res = await ws("patch", `${base}/${id}/diagnosis`).send({
      quote: { lineItems: [{ kind: "PART", description: "X", quantity: 1, unitPriceCents: 100 }] },
    });
    expect(res.status).toBe(400);
  });

  it("sends the estimate only with a cause and at least one line item", async () => {
    const id = await createOrder();
    await ws("patch", `${base}/${id}/diagnosis`).send({
      quote: { lineItems: [{ kind: "LABOR", description: "X", quantity: 1, unitPriceCents: 100 }] },
    });
    expect((await ws("post", `${base}/${id}/send-quote`)).status).toBe(400); // no cause

    await ws("patch", `${base}/${id}/diagnosis`).send({ cause: "Ursache" });
    const sent = await ws("post", `${base}/${id}/send-quote`);
    expect(sent.status).toBe(200);
    expect(sent.body).toMatchObject({
      status: "QUOTE_PENDING_APPROVAL",
      quote: { status: "SENT" },
    });

    // Diagnosis is frozen once sent.
    expect(
      (await ws("patch", `${base}/${id}/diagnosis`).send({ cause: "neu" })).status,
    ).toBe(409);
  });

  it("enforces the status flow and needs the customer's approval to start the repair", async () => {
    const id = await createOrder();
    await ws("patch", `${base}/${id}/diagnosis`).send({
      cause: "Ursache",
      quote: { lineItems: [{ kind: "LABOR", description: "X", quantity: 1, unitPriceCents: 100 }] },
    });

    // Illegal jump.
    expect(
      (await ws("post", `${base}/${id}/status`).send({ status: "CLOSED" })).status,
    ).toBe(409);

    await ws("post", `${base}/${id}/send-quote`);
    // Workshop cannot start the repair while the estimate is pending.
    expect(
      (await ws("post", `${base}/${id}/status`).send({ status: "REPAIR_IN_PROGRESS" }))
        .status,
    ).toBe(409);

    await request(app)
      .post(`/api/customer/repair-orders/${id}/approve`)
      .set("Authorization", `Bearer ${s.customerToken}`);

    const path: string[] = [
      "REPAIR_IN_PROGRESS",
      "WAITING_FOR_PARTS",
      "REPAIR_IN_PROGRESS",
      "REPAIR_COMPLETED",
      "READY_FOR_PICKUP",
      "CLOSED",
    ];
    for (const status of path) {
      const res = await ws("post", `${base}/${id}/status`).send({ status });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(status);
    }

    // Terminal: no further changes.
    expect(
      (await ws("post", `${base}/${id}/notes`).send({ message: "x" })).status,
    ).toBe(200); // notes still allowed
    expect(
      (await ws("post", `${base}/${id}/status`).send({ status: "REPAIR_IN_PROGRESS" }))
        .status,
    ).toBe(409);
  });

  it("adds notes and assigns members, recorded on the timeline", async () => {
    const id = await createOrder();

    const noted = await ws("post", `${base}/${id}/notes`).send({
      message: "Ersatzteil bestellt, Lieferung morgen.",
    });
    expect(noted.status).toBe(200);

    const assigned = await ws("put", `${base}/${id}/assignees`).send({
      memberIds: [s.chefMemberId],
    });
    expect(assigned.body.assignedMembers).toEqual([
      expect.objectContaining({ id: s.chefMemberId }),
    ]);

    const types = assigned.body.timeline.map((e: { type: string }) => e.type);
    expect(types).toContain("NOTE_ADDED");
  });

  it("rejects assigning a member from another workshop", async () => {
    const id = await createOrder();
    const res = await ws("put", `${base}/${id}/assignees`).send({
      memberIds: ["64b000000000000000000000"],
    });
    expect(res.status).toBe(400);
  });

  it("cancels an order and then refuses further changes", async () => {
    const id = await createOrder();
    const cancelled = await ws("post", `${base}/${id}/cancel`).send({
      reason: "Kunde möchte anderswo reparieren lassen.",
    });
    expect(cancelled.body.status).toBe("CANCELLED");
    expect(cancelled.body.cancelReason).toContain("anderswo");

    expect(
      (await ws("patch", `${base}/${id}/diagnosis`).send({ cause: "x" })).status,
    ).toBe(409);
  });
});

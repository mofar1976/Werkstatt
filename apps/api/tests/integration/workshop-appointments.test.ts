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
  const reg = await request(app).post("/api/auth/customer/register").send({
    email: "carla@customer.test",
    password: "customer-pass",
    firstName: "Carla",
    lastName: "C",
  });

  const booking = await request(app)
    .post(`/api/customer/workshops/${workshop.id}/appointments`)
    .set("Authorization", `Bearer ${reg.body.tokens.accessToken}`)
    .send({
      slotId: slot.id,
      problemDescription: "Bremsen quietschen vorne.",
      vehicle: { brandId: brand.id, modelId: model.id },
    });

  return {
    workshopId: workshop.id,
    slotId: slot.id,
    appointmentId: booking.body.id as string,
    workshopToken: wLogin.body.tokens.accessToken as string,
    customerToken: reg.body.tokens.accessToken as string,
  };
}

describe("workshop portal – appointments", () => {
  let s: Awaited<ReturnType<typeof scenario>>;

  beforeEach(async () => {
    s = await scenario();
  });

  const ws = (m: "get" | "post", url: string) =>
    request(app)[m](url).set("Authorization", `Bearer ${s.workshopToken}`);

  it("lists incoming appointments with the problem text and customer contact", async () => {
    const res = await ws("get", "/api/workshop/my-workshop/appointments");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0]).toMatchObject({
      id: s.appointmentId,
      status: "CONFIRMED",
      problemDescription: "Bremsen quietschen vorne.",
      vehicle: { brandName: "BMW", modelName: "7er" },
      customer: { firstName: "Carla", lastName: "C", email: "carla@customer.test" },
    });
  });

  it("does not leak customer contact to the customer's own view", async () => {
    const res = await request(app)
      .get(`/api/customer/appointments/${s.appointmentId}`)
      .set("Authorization", `Bearer ${s.customerToken}`);
    expect(res.body.customer).toBeUndefined();
  });

  it("filters by status", async () => {
    expect(
      (await ws("get", "/api/workshop/my-workshop/appointments?status=CANCELLED"))
        .body.total,
    ).toBe(0);
  });

  it("gets one appointment; 404 for another workshop's id", async () => {
    expect(
      (await ws("get", `/api/workshop/my-workshop/appointments/${s.appointmentId}`))
        .status,
    ).toBe(200);
    expect(
      (
        await ws(
          "get",
          "/api/workshop/my-workshop/appointments/64b000000000000000000000",
        )
      ).status,
    ).toBe(404);
  });

  it("cancels an appointment and frees the slot", async () => {
    const res = await ws(
      "post",
      `/api/workshop/my-workshop/appointments/${s.appointmentId}/cancel`,
    ).send({ reason: "Werkstatt überbucht" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "CANCELLED",
      cancelledBy: "WORKSHOP",
      cancelReason: "Werkstatt überbucht",
    });

    const slots = await ws("get", "/api/workshop/my-workshop/slots");
    expect(slots.body.items.find((x: { id: string }) => x.id === s.slotId).status).toBe(
      "OPEN",
    );
  });

  it("completes an appointment; cannot complete twice or after cancel", async () => {
    const done = await ws(
      "post",
      `/api/workshop/my-workshop/appointments/${s.appointmentId}/complete`,
    );
    expect(done.status).toBe(200);
    expect(done.body.status).toBe("COMPLETED");

    expect(
      (
        await ws(
          "post",
          `/api/workshop/my-workshop/appointments/${s.appointmentId}/complete`,
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await ws(
          "post",
          `/api/workshop/my-workshop/appointments/${s.appointmentId}/cancel`,
        )
      ).status,
    ).toBe(409);
  });

  it("lets the customer see the workshop's cancellation", async () => {
    await ws(
      "post",
      `/api/workshop/my-workshop/appointments/${s.appointmentId}/cancel`,
    );
    const res = await request(app)
      .get(`/api/customer/appointments/${s.appointmentId}`)
      .set("Authorization", `Bearer ${s.customerToken}`);
    expect(res.body).toMatchObject({ status: "CANCELLED", cancelledBy: "WORKSHOP" });
  });

  it("rejects a customer token on the workshop appointment routes", async () => {
    const res = await request(app)
      .get("/api/workshop/my-workshop/appointments")
      .set("Authorization", `Bearer ${s.customerToken}`);
    expect(res.status).toBe(401);
  });
});

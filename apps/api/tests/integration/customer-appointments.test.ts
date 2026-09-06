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
    address: {
      street: "Seestraße 12",
      city: "Berlin",
      postalCode: "13353",
      country: "DE",
    },
  });
  await workshopService.setStatus(workshop.id, WorkshopStatus.ACTIVE);
  await workshopService.addMember(workshop.id, {
    email: "chef@nord.test",
    firstName: "C",
    lastName: "N",
    password: "chef-pass",
    role: WorkshopRole.CHEF,
  });

  const slot = await appointmentSlotService.create(workshop.id, {
    startsAt: inHours(24),
    endsAt: inHours(25),
  });

  const brand = await carCatalogService.createBrand({ name: "BMW" });
  const model = await carCatalogService.createModel(brand.id, {
    name: "7er Reihe",
  });

  const reg = await request(app).post("/api/auth/customer/register").send({
    email: "carla@customer.test",
    password: "customer-pass",
    firstName: "Carla",
    lastName: "Customer",
  });

  return {
    workshopId: workshop.id,
    slotId: slot.id,
    brandId: brand.id,
    modelId: model.id,
    token: reg.body.tokens.accessToken as string,
  };
}

describe("customer appointments", () => {
  let s: Awaited<ReturnType<typeof scenario>>;

  beforeEach(async () => {
    s = await scenario();
  });

  const book = (body: object) =>
    request(app)
      .post(`/api/customer/workshops/${s.workshopId}/appointments`)
      .set("Authorization", `Bearer ${s.token}`)
      .send(body);

  const authed = (m: "get" | "post", url: string) =>
    request(app)[m](url).set("Authorization", `Bearer ${s.token}`);

  const validBody = () => ({
    slotId: s.slotId,
    problemDescription: "Bremsen quietschen vorne links.",
    vehicle: { brandId: s.brandId, modelId: s.modelId, licensePlate: "B-MM 1234" },
  });

  it("books a slot: appointment CONFIRMED, slot BOOKED, vehicle names embedded", async () => {
    const res = await book(validBody());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: "CONFIRMED",
      workshopName: "Autohaus Nord",
      vehicle: { brandName: "BMW", modelName: "7er Reihe", licensePlate: "B-MM 1234" },
    });

    // Slot no longer offered to customers.
    const slots = await authed(
      "get",
      `/api/customer/workshops/${s.workshopId}/slots`,
    );
    expect(slots.body.items).toHaveLength(0);
  });

  it("rejects booking an already-booked slot", async () => {
    await book(validBody());
    const second = await book(validBody());
    expect(second.status).toBe(409);
  });

  it("rejects an unknown brand or model", async () => {
    expect(
      (
        await book({
          ...validBody(),
          vehicle: { brandId: "64b000000000000000000000", modelId: s.modelId },
        })
      ).status,
    ).toBe(400);
    expect((await book({ ...validBody(), vehicle: { brandId: s.brandId, modelId: "nope" } })).status).toBe(400);
  });

  it("rejects a too-short problem description", async () => {
    expect((await book({ ...validBody(), problemDescription: "hi" })).status).toBe(400);
  });

  it("rejects booking at a non-active workshop", async () => {
    const other = await workshopService.create({
      name: "Pending",
      address: { street: "X", city: "Berlin", postalCode: "10115", country: "DE" },
    });
    const res = await request(app)
      .post(`/api/customer/workshops/${other.id}/appointments`)
      .set("Authorization", `Bearer ${s.token}`)
      .send(validBody());
    expect(res.status).toBe(404);
  });

  describe("after booking", () => {
    let appointmentId: string;

    beforeEach(async () => {
      const res = await book(validBody());
      appointmentId = res.body.id;
    });

    it("lists the customer's appointments", async () => {
      const res = await authed("get", "/api/customer/appointments");
      expect(res.body.total).toBe(1);
      expect(res.body.items[0].id).toBe(appointmentId);
    });

    it("hides another customer's appointment", async () => {
      const other = await request(app).post("/api/auth/customer/register").send({
        email: "eve@customer.test",
        password: "customer-pass",
        firstName: "Eve",
        lastName: "E",
      });
      const res = await request(app)
        .get(`/api/customer/appointments/${appointmentId}`)
        .set("Authorization", `Bearer ${other.body.tokens.accessToken}`);
      expect(res.status).toBe(404);
    });

    it("cancels: appointment CANCELLED, slot free again", async () => {
      const res = await authed(
        "post",
        `/api/customer/appointments/${appointmentId}/cancel`,
      ).send({ reason: "Doch keine Zeit" });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "CANCELLED",
        cancelledBy: "CUSTOMER",
        cancelReason: "Doch keine Zeit",
      });

      const slots = await authed(
        "get",
        `/api/customer/workshops/${s.workshopId}/slots`,
      );
      expect(slots.body.items).toHaveLength(1);

      // Slot can be booked again.
      expect((await book(validBody())).status).toBe(201);
    });

    it("rejects cancelling twice", async () => {
      await authed("post", `/api/customer/appointments/${appointmentId}/cancel`);
      expect(
        (await authed("post", `/api/customer/appointments/${appointmentId}/cancel`))
          .status,
      ).toBe(409);
    });
  });
});

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

function inHours(hours: number): string {
  const d = new Date(Date.now() + hours * 3_600_000);
  d.setSeconds(0, 0);
  return d.toISOString();
}

async function customerToken(): Promise<string> {
  const res = await request(app).post("/api/auth/customer/register").send({
    email: "carla@customer.test",
    password: "customer-pass",
    firstName: "Carla",
    lastName: "Customer",
  });
  return res.body.tokens.accessToken;
}

async function makeWorkshop(
  name: string,
  status: WorkshopStatus,
  location?: { lat: number; lng: number },
) {
  const w = await workshopService.create({
    name,
    address: {
      street: "S 1",
      city: "Berlin",
      postalCode: "13353",
      country: "DE",
    },
    location,
  });
  if (status !== WorkshopStatus.PENDING) {
    await workshopService.setStatus(w.id, status);
  }
  return w;
}

describe("customer browse", () => {
  let token: string;
  const authed = (url: string) =>
    request(app).get(url).set("Authorization", `Bearer ${token}`);

  beforeEach(async () => {
    token = await customerToken();
  });

  it("requires a customer token", async () => {
    expect((await request(app).get("/api/customer/workshops")).status).toBe(401);
  });

  it("lists only ACTIVE workshops with a public projection", async () => {
    const active = await makeWorkshop("Autohaus Nord", WorkshopStatus.ACTIVE);
    await makeWorkshop("KFZ Pending", WorkshopStatus.PENDING);
    await makeWorkshop("KFZ Gesperrt", WorkshopStatus.SUSPENDED);

    const res = await authed("/api/customer/workshops");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].id).toBe(active.id);
    expect(res.body.items[0].status).toBeUndefined();
    expect(res.body.items[0].memberCount).toBeUndefined();
  });

  it("searches by city", async () => {
    await makeWorkshop("A", WorkshopStatus.ACTIVE);
    const res = await authed("/api/customer/workshops?search=berlin");
    expect(res.body.total).toBe(1);
    expect((await authed("/api/customer/workshops?search=hamburg")).body.total).toBe(0);
  });

  it("filters by distance with `near` + `radiusKm` and exposes coordinates", async () => {
    // Berlin centre and a workshop ~180 km away (Hamburg).
    await makeWorkshop("Berlin Mitte", WorkshopStatus.ACTIVE, { lat: 52.52, lng: 13.405 });
    await makeWorkshop("Hamburg", WorkshopStatus.ACTIVE, { lat: 53.55, lng: 9.993 });

    const near = "52.52,13.405";
    const close = await authed(`/api/customer/workshops?near=${near}&radiusKm=20`);
    expect(close.body.total).toBe(1);
    expect(close.body.items[0].name).toBe("Berlin Mitte");
    expect(close.body.items[0].location).toEqual({ lat: 52.52, lng: 13.405 });

    const wide = await authed(`/api/customer/workshops?near=${near}&radiusKm=300`);
    expect(wide.body.total).toBe(2);
  });

  it("gets one active workshop and 404s a non-active one", async () => {
    const active = await makeWorkshop("Nord", WorkshopStatus.ACTIVE);
    const pending = await makeWorkshop("Pending", WorkshopStatus.PENDING);

    expect((await authed(`/api/customer/workshops/${active.id}`)).status).toBe(200);
    expect((await authed(`/api/customer/workshops/${pending.id}`)).status).toBe(404);
    expect((await authed(`/api/customer/workshops/not-an-id`)).status).toBe(404);
  });

  describe("car catalogue", () => {
    it("lists brands alphabetically with their models", async () => {
      const vw = await carCatalogService.createBrand({ name: "VW" });
      const bmw = await carCatalogService.createBrand({ name: "BMW" });
      await carCatalogService.createModel(bmw.id, { name: "3er" });
      await carCatalogService.createModel(bmw.id, { name: "X5" });

      const brands = await authed("/api/customer/car-brands");
      expect(brands.status).toBe(200);
      expect(brands.body.items.map((b: { name: string }) => b.name)).toEqual([
        "BMW",
        "VW",
      ]);

      const models = await authed(
        `/api/customer/car-brands/${bmw.id}/models`,
      );
      expect(models.body.items.map((m: { name: string }) => m.name)).toEqual([
        "3er",
        "X5",
      ]);
      expect((await authed(`/api/customer/car-brands/${vw.id}/models`)).body.items).toHaveLength(0);
    });

    it("404s models for an unknown brand", async () => {
      expect(
        (await authed("/api/customer/car-brands/64b000000000000000000000/models"))
          .status,
      ).toBe(404);
    });
  });

  describe("slots", () => {
    let workshopId: string;

    beforeEach(async () => {
      const w = await makeWorkshop("Nord", WorkshopStatus.ACTIVE);
      workshopId = w.id;
      await workshopService.addMember(w.id, {
        email: "chef@nord.test",
        firstName: "C",
        lastName: "N",
        password: "chef-pass",
        role: WorkshopRole.CHEF,
      });
    });

    it("returns only OPEN future slots", async () => {
      const open = await appointmentSlotService.create(workshopId, {
        startsAt: new Date(inHours(24)),
        endsAt: new Date(inHours(25)),
      });
      const blocked = await appointmentSlotService.create(workshopId, {
        startsAt: new Date(inHours(48)),
        endsAt: new Date(inHours(49)),
      });
      await appointmentSlotService.setStatus(workshopId, blocked.id, "BLOCKED");

      const res = await authed(`/api/customer/workshops/${workshopId}/slots`);
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].id).toBe(open.id);
      expect(res.body.items[0]).not.toHaveProperty("status");
    });

    it("honours a to= upper bound", async () => {
      await appointmentSlotService.create(workshopId, {
        startsAt: new Date(inHours(24)),
        endsAt: new Date(inHours(25)),
      });
      await appointmentSlotService.create(workshopId, {
        startsAt: new Date(inHours(24 * 10)),
        endsAt: new Date(inHours(24 * 10 + 1)),
      });

      const res = await authed(
        `/api/customer/workshops/${workshopId}/slots?to=${encodeURIComponent(inHours(48))}`,
      );
      expect(res.body.items).toHaveLength(1);
    });

    it("404s slots for a non-active workshop", async () => {
      const pending = await makeWorkshop("Pending", WorkshopStatus.PENDING);
      expect(
        (await authed(`/api/customer/workshops/${pending.id}/slots`)).status,
      ).toBe(404);
    });
  });
});

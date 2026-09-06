import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { WorkshopRole } from "@car-garage/shared";
import { createApp } from "../../app/index.js";
import { workshopService } from "../../app/services/workshop.service.js";
import { AppointmentSlot } from "../../app/models/appointment-slot.model.js";
import { useTestDatabase } from "../helpers/db.js";

useTestDatabase();

const app = createApp();

/** ISO string `hours` from now, on the minute. */
function inHours(hours: number): string {
  const d = new Date(Date.now() + hours * 3_600_000);
  d.setSeconds(0, 0);
  return d.toISOString();
}

let seq = 0;

async function seed() {
  seq += 1;
  const email = `chef${seq}@nord.test`;
  const workshop = await workshopService.create({
    name: `Autohaus ${seq}`,
    address: {
      street: "Seestraße 12",
      city: "Berlin",
      postalCode: "13353",
      country: "DE",
    },
  });
  await workshopService.addMember(workshop.id, {
    email,
    firstName: "Chef",
    lastName: "Nord",
    password: "chef-password",
    role: WorkshopRole.CHEF,
  });
  const login = await request(app)
    .post("/api/auth/workshop/login")
    .send({ email, password: "chef-password" });
  return { workshopId: workshop.id, token: login.body.tokens.accessToken };
}

describe("workshop portal – availability slots", () => {
  let token: string;
  let workshopId: string;

  beforeEach(async () => {
    ({ token, workshopId } = await seed());
  });

  const authed = (m: "get" | "post" | "patch" | "delete", url: string) =>
    request(app)[m](url).set("Authorization", `Bearer ${token}`);

  it("creates a slot with a default 60-minute duration", async () => {
    const res = await authed("post", "/api/workshop/my-workshop/slots").send({
      startsAt: inHours(24),
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("OPEN");
    expect(new Date(res.body.endsAt).getTime() - new Date(res.body.startsAt).getTime()).toBe(
      60 * 60_000,
    );
    expect(res.body.workshopId).toBe(workshopId);
  });

  it("rejects a slot in the past", async () => {
    const res = await authed("post", "/api/workshop/my-workshop/slots").send({
      startsAt: inHours(-2),
    });
    expect(res.status).toBe(400);
  });

  it("rejects an overlapping slot", async () => {
    await authed("post", "/api/workshop/my-workshop/slots").send({
      startsAt: inHours(24),
      durationMinutes: 120,
    });
    const overlap = await authed("post", "/api/workshop/my-workshop/slots").send({
      startsAt: inHours(25),
    });
    expect(overlap.status).toBe(409);

    const adjacent = await authed("post", "/api/workshop/my-workshop/slots").send({
      startsAt: inHours(26),
    });
    expect(adjacent.status).toBe(201);
  });

  it("lists slots filtered by time range and status", async () => {
    await authed("post", "/api/workshop/my-workshop/slots").send({
      startsAt: inHours(24),
    });
    await authed("post", "/api/workshop/my-workshop/slots").send({
      startsAt: inHours(72),
    });

    const all = await authed("get", "/api/workshop/my-workshop/slots");
    expect(all.body.items).toHaveLength(2);

    const soon = await authed(
      "get",
      `/api/workshop/my-workshop/slots?to=${encodeURIComponent(inHours(48))}`,
    );
    expect(soon.body.items).toHaveLength(1);
  });

  it("blocks and unblocks a slot", async () => {
    const slot = await authed("post", "/api/workshop/my-workshop/slots").send({
      startsAt: inHours(24),
    });
    const blocked = await authed(
      "patch",
      `/api/workshop/my-workshop/slots/${slot.body.id}`,
    ).send({ status: "BLOCKED" });
    expect(blocked.body.status).toBe("BLOCKED");

    const open = await authed(
      "patch",
      `/api/workshop/my-workshop/slots/${slot.body.id}`,
    ).send({ status: "OPEN" });
    expect(open.body.status).toBe("OPEN");
  });

  it("deletes an open slot but refuses a booked one", async () => {
    const slot = await authed("post", "/api/workshop/my-workshop/slots").send({
      startsAt: inHours(24),
    });
    expect(
      (await authed("delete", `/api/workshop/my-workshop/slots/${slot.body.id}`))
        .status,
    ).toBe(204);

    const booked = await authed("post", "/api/workshop/my-workshop/slots").send({
      startsAt: inHours(30),
    });
    await AppointmentSlot.updateOne(
      { _id: booked.body.id },
      { $set: { status: "BOOKED" } },
    );
    expect(
      (await authed("delete", `/api/workshop/my-workshop/slots/${booked.body.id}`))
        .status,
    ).toBe(409);
  });

  it("does not leak another workshop's slots", async () => {
    await authed("post", "/api/workshop/my-workshop/slots").send({
      startsAt: inHours(24),
    });

    const other = await seed();
    const res = await request(app)
      .get("/api/workshop/my-workshop/slots")
      .set("Authorization", `Bearer ${other.token}`);
    expect(res.body.items).toHaveLength(0);
  });
});

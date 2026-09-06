import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { AuthAudience, UserRole, WorkshopRole } from "@car-garage/shared";
import { createApp } from "../../app/index.js";
import { authService } from "../../app/services/auth.service.js";
import { workshopService } from "../../app/services/workshop.service.js";
import { useTestDatabase } from "../helpers/db.js";

useTestDatabase();

const app = createApp();

async function seedWorkshopWithChef() {
  const workshop = await workshopService.create({
    name: "Autohaus Nord",
    address: {
      street: "Seestraße 12",
      city: "Berlin",
      postalCode: "13353",
      country: "DE",
    },
  });
  const chef = await workshopService.addMember(workshop.id, {
    email: "chef@nord.test",
    firstName: "Chef",
    lastName: "Nord",
    password: "chef-password",
    role: WorkshopRole.CHEF,
  });
  return { workshop, chef };
}

async function loginWorkshop(email: string, password: string): Promise<string> {
  const res = await request(app)
    .post("/api/auth/workshop/login")
    .send({ email, password });
  return res.body.tokens.accessToken;
}

describe("workshop portal – member management", () => {
  let chefToken: string;
  let workshopId: string;

  beforeEach(async () => {
    const { workshop } = await seedWorkshopWithChef();
    workshopId = workshop.id;
    chefToken = await loginWorkshop("chef@nord.test", "chef-password");
  });

  const asChef = (m: "get" | "post" | "patch" | "delete", url: string) =>
    request(app)[m](url).set("Authorization", `Bearer ${chefToken}`);

  it("returns the chef's own workshop", async () => {
    const res = await asChef("get", "/api/workshop/my-workshop");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(workshopId);
  });

  it("lets the chef add, promote and remove a mechanic", async () => {
    const added = await asChef("post", "/api/workshop/my-workshop/members").send({
      email: "mech@nord.test",
      firstName: "Mika",
      lastName: "Mechanic",
      password: "mech-password",
    });
    expect(added.status).toBe(201);
    expect(added.body.role).toBe("MEMBER");

    const promoted = await asChef(
      "patch",
      `/api/workshop/my-workshop/members/${added.body.id}`,
    ).send({ role: "CHEF" });
    expect(promoted.body.role).toBe("CHEF");

    const removed = await asChef(
      "delete",
      `/api/workshop/my-workshop/members/${added.body.id}`,
    );
    expect(removed.status).toBe(204);

    const members = await asChef("get", "/api/workshop/my-workshop/members");
    expect(members.body.items).toHaveLength(1); // only the chef remains
  });

  it("lets the chef edit a member's name and phone", async () => {
    const added = await asChef("post", "/api/workshop/my-workshop/members").send({
      email: "mech@nord.test",
      firstName: "Mika",
      lastName: "Mechanic",
      password: "mech-password",
    });

    const updated = await asChef(
      "patch",
      `/api/workshop/my-workshop/members/${added.body.id}`,
    ).send({ firstName: "Mikael", phone: "+49 30 555" });
    expect(updated.status).toBe(200);
    expect(updated.body.user).toMatchObject({
      firstName: "Mikael",
      lastName: "Mechanic",
      phone: "+49 30 555",
    });
    expect(updated.body.role).toBe("MEMBER");

    // Empty phone clears it.
    const cleared = await asChef(
      "patch",
      `/api/workshop/my-workshop/members/${added.body.id}`,
    ).send({ phone: "" });
    expect(cleared.body.user.phone).toBeUndefined();
  });

  it("lets the chef edit their own name but not their own role", async () => {
    const members = await asChef("get", "/api/workshop/my-workshop/members");
    const chefMembershipId = members.body.items[0].id;

    const rename = await asChef(
      "patch",
      `/api/workshop/my-workshop/members/${chefMembershipId}`,
    ).send({ firstName: "Chefin" });
    expect(rename.status).toBe(200);
    expect(rename.body.user.firstName).toBe("Chefin");

    const demote = await asChef(
      "patch",
      `/api/workshop/my-workshop/members/${chefMembershipId}`,
    ).send({ role: "MEMBER" });
    expect(demote.status).toBe(400);
  });

  it("rejects an empty member update", async () => {
    const members = await asChef("get", "/api/workshop/my-workshop/members");
    const res = await asChef(
      "patch",
      `/api/workshop/my-workshop/members/${members.body.items[0].id}`,
    ).send({});
    expect(res.status).toBe(400);
  });

  it("stops the chef from removing or demoting themselves", async () => {
    const members = await asChef("get", "/api/workshop/my-workshop/members");
    const chefMembershipId = members.body.items[0].id;

    expect(
      (
        await asChef(
          "delete",
          `/api/workshop/my-workshop/members/${chefMembershipId}`,
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await asChef(
          "patch",
          `/api/workshop/my-workshop/members/${chefMembershipId}`,
        ).send({ role: "MEMBER" })
      ).status,
    ).toBe(400);
  });

  it("forbids a plain member from managing members", async () => {
    await asChef("post", "/api/workshop/my-workshop/members").send({
      email: "mech@nord.test",
      firstName: "Mika",
      lastName: "Mechanic",
      password: "mech-password",
    });
    const memberToken = await loginWorkshop("mech@nord.test", "mech-password");

    const list = await request(app)
      .get("/api/workshop/my-workshop/members")
      .set("Authorization", `Bearer ${memberToken}`);
    expect(list.status).toBe(200); // members may view

    const add = await request(app)
      .post("/api/workshop/my-workshop/members")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        email: "x@nord.test",
        firstName: "X",
        lastName: "X",
        password: "x-password",
      });
    expect(add.status).toBe(403); // ...but not manage
  });

  describe("workshop profile", () => {
    it("lets the chef edit name, contact and address", async () => {
      const res = await asChef("patch", "/api/workshop/my-workshop").send({
        name: "Autohaus Nord GmbH",
        phone: "+49 30 123456",
        address: {
          street: "Seestraße 20",
          city: "Berlin",
          postalCode: "13353",
          country: "DE",
        },
      });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        name: "Autohaus Nord GmbH",
        phone: "+49 30 123456",
        address: { street: "Seestraße 20" },
      });
      // Slug and status stay untouched.
      expect(res.body.slug).toBe("autohaus-nord");
      expect(res.body.status).toBe("PENDING");
    });

    it("rejects an empty update", async () => {
      expect(
        (await asChef("patch", "/api/workshop/my-workshop").send({})).status,
      ).toBe(400);
    });

    it("forbids a plain member from editing the profile", async () => {
      await asChef("post", "/api/workshop/my-workshop/members").send({
        email: "mech2@nord.test",
        firstName: "Mo",
        lastName: "M",
        password: "mech-password",
      });
      const memberToken = await loginWorkshop("mech2@nord.test", "mech-password");
      const res = await request(app)
        .patch("/api/workshop/my-workshop")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ name: "Hijack Motors" });
      expect(res.status).toBe(403);
    });
  });

  it("forbids a workshop user with no membership", async () => {
    await authService.register(AuthAudience.WORKSHOP, {
      email: "orphan@nord.test",
      password: "orphan-pass",
      firstName: "O",
      lastName: "O",
    });
    const orphanToken = await loginWorkshop("orphan@nord.test", "orphan-pass");

    const res = await request(app)
      .get("/api/workshop/my-workshop")
      .set("Authorization", `Bearer ${orphanToken}`);
    expect(res.status).toBe(403);
  });

  it("rejects an admin token on the workshop portal", async () => {
    await authService.register(
      AuthAudience.ADMIN,
      {
        email: "admin@car-garage.test",
        password: "admin-pass",
        firstName: "A",
        lastName: "A",
      },
      { roles: [UserRole.PLATFORM_ADMIN] },
    );
    const adminLogin = await request(app)
      .post("/api/auth/admin/login")
      .send({ email: "admin@car-garage.test", password: "admin-pass" });

    const res = await request(app)
      .get("/api/workshop/my-workshop")
      .set("Authorization", `Bearer ${adminLogin.body.tokens.accessToken}`);
    expect(res.status).toBe(401);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { AuthAudience, UserRole } from "@car-garage/shared";
import { createApp } from "../../app/index.js";
import { authService } from "../../app/services/auth.service.js";
import { useTestDatabase } from "../helpers/db.js";

// Don't touch real object storage in tests.
const { putObject, removeObject } = vi.hoisted(() => ({
  putObject: vi.fn(async () => undefined),
  removeObject: vi.fn(async () => undefined),
}));
vi.mock("../../app/helpers/storage.js", () => ({
  putObject,
  removeObject,
  publicUrl: (key: string) => `https://cdn.test/${key}`,
}));

useTestDatabase();

const app = createApp();
const base = "/api/admin/car-brands";

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

describe("admin car catalogue", () => {
  let token: string;
  const authed = (
    m: "get" | "post" | "put" | "patch" | "delete",
    url: string,
  ) => request(app)[m](url).set("Authorization", `Bearer ${token}`);

  beforeEach(async () => {
    token = await adminToken();
  });

  it("rejects non-admins", async () => {
    expect((await request(app).get(base)).status).toBe(401);
    const cust = await request(app).post("/api/auth/customer/register").send({
      email: "c@example.com",
      password: "customer-pass",
      firstName: "C",
      lastName: "C",
    });
    const res = await request(app)
      .get(base)
      .set("Authorization", `Bearer ${cust.body.tokens.accessToken}`);
    expect(res.status).toBe(401);
  });

  it("creates a brand with a slug", async () => {
    const res = await authed("post", base).send({ name: "BMW" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "BMW", slug: "bmw", modelCount: 0 });
  });

  it("rejects a duplicate brand (case-insensitive via slug)", async () => {
    await authed("post", base).send({ name: "BMW" });
    expect((await authed("post", base).send({ name: "bmw" })).status).toBe(409);
  });

  describe("with a brand", () => {
    let brandId: string;

    beforeEach(async () => {
      const res = await authed("post", base).send({ name: "BMW" });
      brandId = res.body.id;
    });

    it("lists and searches brands", async () => {
      await authed("post", base).send({ name: "Audi" });
      expect((await authed("get", base)).body.total).toBe(2);
      expect((await authed("get", `${base}?search=bmw`)).body.total).toBe(1);
    });

    it("updates and deletes a brand", async () => {
      const upd = await authed("patch", `${base}/${brandId}`).send({
        name: "BMW AG",
      });
      expect(upd.body.name).toBe("BMW AG");

      const del = await authed("delete", `${base}/${brandId}`);
      expect(del.status).toBe(204);
      expect((await authed("get", `${base}/${brandId}`)).status).toBe(404);
    });

    it("adds models under the brand and counts them", async () => {
      const m1 = await authed("post", `${base}/${brandId}/models`).send({
        name: "7er Reihe",
      });
      expect(m1.status).toBe(201);
      expect(m1.body).toMatchObject({ name: "7er Reihe", slug: "7er-reihe" });
      expect(m1.body.brandId).toBe(brandId);

      await authed("post", `${base}/${brandId}/models`).send({ name: "3er Reihe" });

      const models = await authed("get", `${base}/${brandId}/models`);
      expect(models.body.total).toBe(2);

      const brand = await authed("get", `${base}/${brandId}`);
      expect(brand.body.modelCount).toBe(2);
    });

    it("rejects a duplicate model name within the brand", async () => {
      await authed("post", `${base}/${brandId}/models`).send({ name: "7er Reihe" });
      const dup = await authed("post", `${base}/${brandId}/models`).send({
        name: "7er Reihe",
      });
      expect(dup.status).toBe(409);
    });

    it("allows the same model name under a different brand", async () => {
      const audi = await authed("post", base).send({ name: "Audi" });
      await authed("post", `${base}/${brandId}/models`).send({ name: "A6" });
      const ok = await authed("post", `${base}/${audi.body.id}/models`).send({
        name: "A6",
      });
      expect(ok.status).toBe(201);
    });

    it("soft-deletes models when the brand is deleted, and frees the slug", async () => {
      await authed("post", `${base}/${brandId}/models`).send({ name: "7er Reihe" });
      await authed("delete", `${base}/${brandId}`);

      // Recreate the brand -> same slug is free.
      const recreated = await authed("post", base).send({ name: "BMW" });
      expect(recreated.body.slug).toBe("bmw");
      // Its model list is empty (old models stayed with the deleted brand).
      const models = await authed(
        "get",
        `${base}/${recreated.body.id}/models`,
      );
      expect(models.body.total).toBe(0);
    });

    it("updates and removes a single model", async () => {
      const created = await authed("post", `${base}/${brandId}/models`).send({
        name: "7er",
      });
      const modelId = created.body.id;

      const upd = await authed(
        "patch",
        `${base}/${brandId}/models/${modelId}`,
      ).send({ name: "7er Reihe" });
      expect(upd.body.name).toBe("7er Reihe");

      const del = await authed(
        "delete",
        `${base}/${brandId}/models/${modelId}`,
      );
      expect(del.status).toBe(204);
      expect(
        (await authed("get", `${base}/${brandId}/models/${modelId}`)).status,
      ).toBe(404);
    });

    it("404s for models under an unknown brand", async () => {
      expect(
        (await authed("get", `${base}/64b000000000000000000000/models`)).status,
      ).toBe(404);
    });

    describe("logo", () => {
      const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      );

      beforeEach(() => {
        putObject.mockClear();
        removeObject.mockClear();
      });

      it("uploads a logo and exposes its URL", async () => {
        const res = await authed("put", `${base}/${brandId}/logo`).attach(
          "logo",
          png,
          "logo.png",
        );
        expect(res.status).toBe(200);
        expect(res.body.logoUrl).toMatch(
          new RegExp(`^https://cdn.test/brands/${brandId}/logo-`),
        );
        expect(putObject).toHaveBeenCalledOnce();

        const brand = await authed("get", `${base}/${brandId}`);
        expect(brand.body.logoUrl).toBe(res.body.logoUrl);
      });

      it("replaces an existing logo and deletes the old file", async () => {
        const first = await authed("put", `${base}/${brandId}/logo`).attach(
          "logo",
          png,
          "a.png",
        );
        const second = await authed("put", `${base}/${brandId}/logo`).attach(
          "logo",
          png,
          "b.png",
        );
        expect(second.body.logoUrl).not.toBe(first.body.logoUrl);
        expect(removeObject).toHaveBeenCalledOnce();
      });

      it("rejects a non-image file", async () => {
        const res = await authed("put", `${base}/${brandId}/logo`).attach(
          "logo",
          Buffer.from("not an image"),
          "notes.txt",
        );
        expect(res.status).toBe(400);
      });

      it("rejects a request with no file", async () => {
        expect((await authed("put", `${base}/${brandId}/logo`)).status).toBe(400);
      });

      it("removes the logo", async () => {
        await authed("put", `${base}/${brandId}/logo`).attach(
          "logo",
          png,
          "logo.png",
        );
        const res = await authed("delete", `${base}/${brandId}/logo`);
        expect(res.status).toBe(200);
        expect(res.body.logoUrl).toBeUndefined();
        expect(removeObject).toHaveBeenCalledOnce();
      });
    });
  });
});

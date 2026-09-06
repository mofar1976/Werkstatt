import { describe, expect, it } from "vitest";
import { publicUrl } from "../../app/helpers/storage.js";

describe("storage.publicUrl", () => {
  it("builds an endpoint/bucket/key URL", () => {
    const url = publicUrl("brands/abc/logo-1.png");
    expect(url).toMatch(/\/car-garage\/brands\/abc\/logo-1\.png$/);
    expect(url.startsWith("http")).toBe(true);
  });

  it("does not double up slashes", () => {
    expect(publicUrl("k")).not.toMatch(/([^:])\/\//);
  });
});

import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "../../app/helpers/slug.js";

describe("slugify", () => {
  it("lowercases and dashes", () => {
    expect(slugify("Autohaus Nord")).toBe("autohaus-nord");
  });

  it("strips diacritics and punctuation", () => {
    expect(slugify("KFZ-Meister Süd & Söhne GmbH")).toBe(
      "kfz-meister-sud-sohne-gmbh",
    );
  });

  it("trims leading/trailing separators", () => {
    expect(slugify("  --Hello!!  ")).toBe("hello");
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when free", async () => {
    const result = await uniqueSlug("Autohaus Nord", async () => false);
    expect(result).toBe("autohaus-nord");
  });

  it("appends a counter when taken", async () => {
    const taken = new Set(["autohaus-nord", "autohaus-nord-2"]);
    const result = await uniqueSlug("Autohaus Nord", async (c) => taken.has(c));
    expect(result).toBe("autohaus-nord-3");
  });
});

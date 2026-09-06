import { describe, expect, it } from "vitest";
import { AuthAudience, UserRole } from "@car-garage/shared";
import { signAccessToken, verifyAccessToken } from "../../app/helpers/jwt.js";

describe("access tokens", () => {
  it("round-trips the claims", async () => {
    const token = await signAccessToken({
      sub: "user-1",
      aud: AuthAudience.CUSTOMER,
      roles: [UserRole.CUSTOMER],
    });
    const claims = await verifyAccessToken(token, AuthAudience.CUSTOMER);
    expect(claims.sub).toBe("user-1");
    expect(claims.aud).toBe(AuthAudience.CUSTOMER);
    expect(claims.roles).toEqual([UserRole.CUSTOMER]);
  });

  it("rejects a token verified for the wrong audience", async () => {
    const token = await signAccessToken({
      sub: "user-1",
      aud: AuthAudience.CUSTOMER,
      roles: [UserRole.CUSTOMER],
    });
    await expect(
      verifyAccessToken(token, AuthAudience.WORKSHOP),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("rejects a tampered token", async () => {
    const token = await signAccessToken({
      sub: "user-1",
      aud: AuthAudience.ADMIN,
      roles: [UserRole.PLATFORM_ADMIN],
    });
    await expect(
      verifyAccessToken(token + "x", AuthAudience.ADMIN),
    ).rejects.toMatchObject({ status: 401 });
  });
});

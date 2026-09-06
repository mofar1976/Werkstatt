import { SignJWT, jwtVerify, errors } from "jose";
import type { AccessTokenClaims, AuthAudience, UserRole } from "@car-garage/shared";
import { env } from "../utils/env.js";
import { HttpError } from "./http-error.js";

const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const ISSUER = "car-garage";

export function signAccessToken(claims: AccessTokenClaims): Promise<string> {
  return new SignJWT({ roles: claims.roles })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setAudience(claims.aud)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_ACCESS_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyAccessToken(
  token: string,
  audience: AuthAudience,
): Promise<AccessTokenClaims> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience,
    });
    return {
      sub: payload.sub ?? "",
      aud: audience,
      roles: (payload.roles as UserRole[] | undefined) ?? [],
    };
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      throw HttpError.unauthorized("Token expired");
    }
    throw HttpError.unauthorized("Invalid token");
  }
}

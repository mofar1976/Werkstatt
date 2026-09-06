import { createHash, randomBytes } from "node:crypto";
import type {
  AuthAudience,
  AuthResponse,
  AuthTokens,
  AuthUser,
  UserRole,
} from "@car-garage/shared";
import { env } from "../utils/env.js";
import { HttpError } from "../helpers/http-error.js";
import { signAccessToken } from "../helpers/jwt.js";
import { verifyPassword } from "../helpers/password.js";
import { RefreshToken } from "../models/refresh-token.model.js";
import { User, type UserDocument } from "../models/user.model.js";
import { createUser, toAuthUser } from "./user.service.js";
import type { RegisterInput } from "../dto/auth.dto.js";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function issueTokens(
  user: UserDocument,
  audience: AuthAudience,
  userAgent?: string,
): Promise<AuthTokens> {
  const accessToken = await signAccessToken({
    sub: user.id,
    aud: audience,
    roles: [...user.roles],
  });

  const refreshToken = randomBytes(32).toString("base64url");
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    audience,
    expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 86_400_000),
    userAgent,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_ACCESS_TTL_SECONDS,
  };
}

export const authService = {
  async register(
    audience: AuthAudience,
    input: RegisterInput,
    options?: { roles?: UserRole[] },
  ): Promise<AuthResponse> {
    const user = await createUser({ ...input, audience, roles: options?.roles });
    return { user: toAuthUser(user), tokens: await issueTokens(user, audience) };
  },

  async login(
    audience: AuthAudience,
    input: { email: string; password: string },
    userAgent?: string,
  ): Promise<AuthResponse> {
    const user = await User.findOne({
      email: input.email,
      audience,
      deleted: false,
    }).select("+passwordHash");
    if (!user || !user.isActive) {
      throw HttpError.unauthorized("Invalid credentials");
    }

    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) {
      throw HttpError.unauthorized("Invalid credentials");
    }

    return {
      user: toAuthUser(user),
      tokens: await issueTokens(user, audience, userAgent),
    };
  },

  async refresh(
    audience: AuthAudience,
    refreshToken: string,
  ): Promise<AuthResponse> {
    const stored = await RefreshToken.findOne({
      tokenHash: hashToken(refreshToken),
      audience,
    });
    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      if (stored) await stored.deleteOne();
      throw HttpError.unauthorized("Invalid refresh token");
    }

    const user = await User.findOne({ _id: stored.user, deleted: false });
    if (!user || !user.isActive) {
      await stored.deleteOne();
      throw HttpError.unauthorized("Invalid refresh token");
    }

    await stored.deleteOne();

    return { user: toAuthUser(user), tokens: await issueTokens(user, audience) };
  },

  async logout(refreshToken: string): Promise<void> {
    await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
  },

  async getById(userId: string): Promise<AuthUser> {
    const user = await User.findOne({ _id: userId, deleted: false });
    if (!user || !user.isActive) {
      throw HttpError.unauthorized();
    }
    return toAuthUser(user);
  },
};

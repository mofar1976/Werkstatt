import {
  AuthAudience,
  UserRole,
  type AuthUser,
} from "@car-garage/shared";
import { HttpError } from "../helpers/http-error.js";
import { hashPassword } from "../helpers/password.js";
import { User, type UserDocument } from "../models/user.model.js";

const DEFAULT_ROLES: Record<AuthAudience, UserRole[]> = {
  [AuthAudience.ADMIN]: [UserRole.PLATFORM_ADMIN],
  [AuthAudience.WORKSHOP]: [UserRole.WORKSHOP_MEMBER],
  [AuthAudience.CUSTOMER]: [UserRole.CUSTOMER],
};

export function defaultRolesFor(audience: AuthAudience): UserRole[] {
  return DEFAULT_ROLES[audience];
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  audience: AuthAudience;
  roles?: UserRole[];
}

export async function createUser(input: CreateUserInput): Promise<UserDocument> {
  const existing = await User.findOne({
    email: input.email,
    audience: input.audience,
    deleted: false,
  });
  if (existing) {
    throw HttpError.conflict("An account with this email already exists");
  }

  return User.create({
    email: input.email,
    passwordHash: await hashPassword(input.password),
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    audience: input.audience,
    roles: input.roles ?? defaultRolesFor(input.audience),
  });
}

export function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? undefined,
    audience: user.audience,
    roles: [...user.roles],
    createdAt: user.createdAt.toISOString(),
  };
}

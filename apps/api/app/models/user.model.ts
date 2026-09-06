import mongoose, { type HydratedDocument } from "mongoose";
import { AuthAudience, UserRole } from "@car-garage/shared";

export interface IUser {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  audience: AuthAudience;
  roles: UserRole[];
  isActive: boolean;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    audience: {
      type: String,
      enum: Object.values(AuthAudience),
      required: true,
    },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [],
    },
    isActive: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.index(
  { email: 1, audience: 1 },
  { unique: true, partialFilterExpression: { deleted: false } },
);

export type UserDocument = HydratedDocument<IUser>;

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ??
  mongoose.model<IUser>("User", userSchema);

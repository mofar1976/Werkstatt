import mongoose, { type HydratedDocument } from "mongoose";
import { AuthAudience } from "@car-garage/shared";

export interface IRefreshToken {
  user: mongoose.Types.ObjectId;
  tokenHash: string;
  audience: AuthAudience;
  expiresAt: Date;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    audience: {
      type: String,
      enum: Object.values(AuthAudience),
      required: true,
    },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String },
  },
  { timestamps: true },
);

// Let MongoDB drop expired tokens automatically.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenDocument = HydratedDocument<IRefreshToken>;

export const RefreshToken =
  (mongoose.models.RefreshToken as mongoose.Model<IRefreshToken>) ??
  mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

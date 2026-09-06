import mongoose, { type HydratedDocument } from "mongoose";

export interface ICarBrand {
  name: string;
  slug: string;
  logoKey?: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const carBrandSchema = new mongoose.Schema<ICarBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    logoKey: { type: String },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

carBrandSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { deleted: false } },
);

export type CarBrandDocument = HydratedDocument<ICarBrand>;

export const CarBrand =
  (mongoose.models.CarBrand as mongoose.Model<ICarBrand>) ??
  mongoose.model<ICarBrand>("CarBrand", carBrandSchema);

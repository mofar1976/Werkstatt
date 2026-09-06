import mongoose, { type HydratedDocument } from "mongoose";

export interface ICarModel {
  brand: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  /** Soft delete — records are never removed from MongoDB. */
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const carModelSchema = new mongoose.Schema<ICarModel>(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarBrand",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

carModelSchema.index(
  { brand: 1, slug: 1 },
  { unique: true, partialFilterExpression: { deleted: false } },
);

export type CarModelDocument = HydratedDocument<ICarModel>;

export const CarModel =
  (mongoose.models.CarModel as mongoose.Model<ICarModel>) ??
  mongoose.model<ICarModel>("CarModel", carModelSchema);

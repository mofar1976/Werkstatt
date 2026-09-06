import mongoose, { type HydratedDocument } from "mongoose";
import { WorkshopStatus } from "@car-garage/shared";

export interface IWorkshopAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface IWorkshopLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface IWorkshop {
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  address: IWorkshopAddress;
  location?: IWorkshopLocation;
  status: WorkshopStatus;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new mongoose.Schema<IWorkshopAddress>(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, uppercase: true, default: "DE" },
  },
  { _id: false },
);

const locationSchema = new mongoose.Schema<IWorkshopLocation>(
  {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 2,
        message: "coordinates must be [lng, lat]",
      },
    },
  },
  { _id: false },
);

const workshopSchema = new mongoose.Schema<IWorkshop>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: addressSchema, required: true },
    location: { type: locationSchema, required: false, default: undefined },
    status: {
      type: String,
      enum: Object.values(WorkshopStatus),
      default: WorkshopStatus.PENDING,
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

workshopSchema.index({ location: "2dsphere" });
workshopSchema.index({ status: 1 });
workshopSchema.index({ "address.city": 1 });
workshopSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { deleted: false } },
);

export type WorkshopDocument = HydratedDocument<IWorkshop>;

export const Workshop =
  (mongoose.models.Workshop as mongoose.Model<IWorkshop>) ??
  mongoose.model<IWorkshop>("Workshop", workshopSchema);

import mongoose, { type HydratedDocument } from "mongoose";
import {
  LineItemKind,
  PartAction,
  QuoteStatus,
  RepairOrderStatus,
} from "@car-garage/shared";
import type { IAppointmentVehicle } from "./appointment.model.js";

export interface IRepairLineItem {
  kind: LineItemKind;
  partAction?: PartAction;
  description: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface IRepairQuote {
  status: QuoteStatus;
  lineItems: IRepairLineItem[];
  taxRatePercent: number;
  netCents: number;
  taxCents: number;
  grossCents: number;
  notes?: string;
  sentAt?: Date;
  decidedAt?: Date;
  rejectionReason?: string;
}

export interface IRepairOrder {
  appointment: mongoose.Types.ObjectId;
  workshop: mongoose.Types.ObjectId;
  workshopName: string;
  customer: mongoose.Types.ObjectId;
  vehicle: IAppointmentVehicle;
  problemDescription: string;
  status: RepairOrderStatus;
  cause?: string;
  assignedMembers: mongoose.Types.ObjectId[];
  quote: IRepairQuote;
  cancelReason?: string;
  /** Soft delete — records are never removed from MongoDB. */
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lineItemSchema = new mongoose.Schema<IRepairLineItem>(
  {
    kind: { type: String, enum: Object.values(LineItemKind), required: true },
    partAction: { type: String, enum: Object.values(PartAction) },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unitPriceCents: { type: Number, required: true },
    lineTotalCents: { type: Number, required: true },
  },
  { _id: false },
);

const quoteSchema = new mongoose.Schema<IRepairQuote>(
  {
    status: {
      type: String,
      enum: Object.values(QuoteStatus),
      default: QuoteStatus.DRAFT,
    },
    lineItems: { type: [lineItemSchema], default: [] },
    taxRatePercent: { type: Number, default: 19 },
    netCents: { type: Number, default: 0 },
    taxCents: { type: Number, default: 0 },
    grossCents: { type: Number, default: 0 },
    notes: { type: String, trim: true },
    sentAt: { type: Date },
    decidedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
  },
  { _id: false },
);

const vehicleSchema = new mongoose.Schema<IAppointmentVehicle>(
  {
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "CarBrand", required: true },
    brandName: { type: String, required: true },
    modelId: { type: mongoose.Schema.Types.ObjectId, ref: "CarModel", required: true },
    modelName: { type: String, required: true },
    licensePlate: { type: String, trim: true },
  },
  { _id: false },
);

const repairOrderSchema = new mongoose.Schema<IRepairOrder>(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
    },
    workshopName: { type: String, required: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: { type: vehicleSchema, required: true },
    problemDescription: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(RepairOrderStatus),
      default: RepairOrderStatus.VEHICLE_RECEIVED,
    },
    cause: { type: String, trim: true },
    assignedMembers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "WorkshopMember" },
    ],
    quote: { type: quoteSchema, default: () => ({}) },
    cancelReason: { type: String, trim: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

repairOrderSchema.index({ workshop: 1, createdAt: -1 });
repairOrderSchema.index({ customer: 1, createdAt: -1 });
repairOrderSchema.index(
  { appointment: 1 },
  { unique: true, partialFilterExpression: { deleted: false } },
);

export type RepairOrderDocument = HydratedDocument<IRepairOrder>;

export const RepairOrder =
  (mongoose.models.RepairOrder as mongoose.Model<IRepairOrder>) ??
  mongoose.model<IRepairOrder>("RepairOrder", repairOrderSchema);

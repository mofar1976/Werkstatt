import mongoose, { type HydratedDocument } from "mongoose";
import { AppointmentActor, AppointmentStatus } from "@car-garage/shared";

export interface IAppointmentVehicle {
  brandId: mongoose.Types.ObjectId;
  brandName: string;
  modelId: mongoose.Types.ObjectId;
  modelName: string;
  licensePlate?: string;
}

export interface IAppointment {
  workshop: mongoose.Types.ObjectId;
  workshopName: string;
  customer: mongoose.Types.ObjectId;
  slot: mongoose.Types.ObjectId;
  scheduledAt: Date;
  problemDescription: string;
  vehicle: IAppointmentVehicle;
  status: AppointmentStatus;
  cancelledBy?: AppointmentActor;
  cancelReason?: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new mongoose.Schema<IAppointmentVehicle>(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarBrand",
      required: true,
    },
    brandName: { type: String, required: true },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarModel",
      required: true,
    },
    modelName: { type: String, required: true },
    licensePlate: { type: String, trim: true },
  },
  { _id: false },
);

const appointmentSchema = new mongoose.Schema<IAppointment>(
  {
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
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppointmentSlot",
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    problemDescription: { type: String, required: true, trim: true },
    vehicle: { type: vehicleSchema, required: true },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.CONFIRMED,
    },
    cancelledBy: { type: String, enum: Object.values(AppointmentActor) },
    cancelReason: { type: String, trim: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

appointmentSchema.index({ customer: 1, scheduledAt: -1 });
appointmentSchema.index({ workshop: 1, scheduledAt: -1 });
appointmentSchema.index(
  { slot: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: false, status: "CONFIRMED" },
  },
);

export type AppointmentDocument = HydratedDocument<IAppointment>;

export const Appointment =
  (mongoose.models.Appointment as mongoose.Model<IAppointment>) ??
  mongoose.model<IAppointment>("Appointment", appointmentSchema);

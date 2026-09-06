import mongoose, { type HydratedDocument } from "mongoose";
import { AppointmentSlotStatus } from "@car-garage/shared";

export interface IAppointmentSlot {
  workshop: mongoose.Types.ObjectId;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentSlotStatus;
  appointment?: mongoose.Types.ObjectId;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSlotSchema = new mongoose.Schema<IAppointmentSlot>(
  {
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
    },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(AppointmentSlotStatus),
      default: AppointmentSlotStatus.OPEN,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

appointmentSlotSchema.index({ workshop: 1, startsAt: 1 });
appointmentSlotSchema.index({ workshop: 1, status: 1, startsAt: 1 });

export type AppointmentSlotDocument = HydratedDocument<IAppointmentSlot>;

export const AppointmentSlot =
  (mongoose.models.AppointmentSlot as mongoose.Model<IAppointmentSlot>) ??
  mongoose.model<IAppointmentSlot>("AppointmentSlot", appointmentSlotSchema);

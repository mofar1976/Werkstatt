import mongoose, { type HydratedDocument } from "mongoose";
import {
  RepairOrderStatus,
  TimelineActor,
  TimelineEventType,
} from "@car-garage/shared";

export interface IRepairOrderEvent {
  repairOrder: mongoose.Types.ObjectId;
  type: TimelineEventType;
  status?: RepairOrderStatus;
  message?: string;
  actor: TimelineActor;
  actorName?: string;
  createdAt: Date;
}

const repairOrderEventSchema = new mongoose.Schema<IRepairOrderEvent>(
  {
    repairOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairOrder",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TimelineEventType),
      required: true,
    },
    status: { type: String, enum: Object.values(RepairOrderStatus) },
    message: { type: String, trim: true },
    actor: {
      type: String,
      enum: Object.values(TimelineActor),
      required: true,
    },
    actorName: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type RepairOrderEventDocument = HydratedDocument<IRepairOrderEvent>;

export const RepairOrderEvent =
  (mongoose.models.RepairOrderEvent as mongoose.Model<IRepairOrderEvent>) ??
  mongoose.model<IRepairOrderEvent>(
    "RepairOrderEvent",
    repairOrderEventSchema,
  );

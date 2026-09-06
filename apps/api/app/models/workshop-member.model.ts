import mongoose, { type HydratedDocument } from "mongoose";
import { WorkshopRole } from "@car-garage/shared";

export interface IWorkshopMember {
  workshop: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: WorkshopRole;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workshopMemberSchema = new mongoose.Schema<IWorkshopMember>(
  {
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(WorkshopRole),
      default: WorkshopRole.MEMBER,
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

workshopMemberSchema.index(
  { workshop: 1, user: 1 },
  { unique: true, partialFilterExpression: { deleted: false } },
);

export type WorkshopMemberDocument = HydratedDocument<IWorkshopMember>;

export const WorkshopMember =
  (mongoose.models.WorkshopMember as mongoose.Model<IWorkshopMember>) ??
  mongoose.model<IWorkshopMember>("WorkshopMember", workshopMemberSchema);

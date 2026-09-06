import mongoose from "mongoose";
import {
  AppointmentActor,
  AppointmentSlotStatus,
  AppointmentStatus,
  WorkshopStatus,
  type Appointment as AppointmentDTO,
  type Paginated,
} from "@car-garage/shared";
import { HttpError } from "../helpers/http-error.js";
import { Appointment, type AppointmentDocument } from "../models/appointment.model.js";
import { AppointmentSlot } from "../models/appointment-slot.model.js";
import { CarBrand } from "../models/car-brand.model.js";
import { CarModel } from "../models/car-model.model.js";
import { Workshop } from "../models/workshop.model.js";
import { RepairOrder } from "../models/repair-order.model.js";
import type {
  BookAppointmentInput,
  ListAppointmentsQuery,
} from "../dto/appointment.dto.js";

const LIVE = { deleted: false } as const;

interface PopulatedCustomer {
  _id: unknown;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
}

const CUSTOMER_FIELDS = "firstName lastName phone email";

/** True when `.populate("customer")` has replaced the ObjectId with a document. */
function isPopulatedCustomer(value: unknown): value is PopulatedCustomer {
  return (
    typeof value === "object" &&
    value !== null &&
    "firstName" in value &&
    "email" in value
  );
}

function toAppointment(doc: AppointmentDocument): AppointmentDTO {
  const customer = isPopulatedCustomer(doc.customer)
    ? {
        firstName: doc.customer.firstName,
        lastName: doc.customer.lastName,
        phone: doc.customer.phone ?? undefined,
        email: doc.customer.email,
      }
    : undefined;

  return {
    id: doc.id,
    workshopId: String(doc.workshop),
    workshopName: doc.workshopName,
    customerId: isPopulatedCustomer(doc.customer)
      ? String(doc.customer._id)
      : String(doc.customer),
    customer,
    slotId: String(doc.slot),
    scheduledAt: doc.scheduledAt.toISOString(),
    problemDescription: doc.problemDescription,
    vehicle: {
      brandId: String(doc.vehicle.brandId),
      brandName: doc.vehicle.brandName,
      modelId: String(doc.vehicle.modelId),
      modelName: doc.vehicle.modelName,
      licensePlate: doc.vehicle.licensePlate ?? undefined,
    },
    status: doc.status,
    cancelledBy: doc.cancelledBy ?? undefined,
    cancelReason: doc.cancelReason ?? undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function listAppointments(
  scope: Record<string, unknown>,
  query: ListAppointmentsQuery,
  populateCustomer = false,
): Promise<Paginated<AppointmentDTO>> {
  const filter: Record<string, unknown> = { ...scope, ...LIVE };
  if (query.status) filter.status = query.status;
  if (query.from || query.to) {
    filter.scheduledAt = {
      ...(query.from ? { $gte: new Date(query.from) } : {}),
      ...(query.to ? { $lte: new Date(query.to) } : {}),
    };
  }

  const total = await Appointment.countDocuments(filter);
  const cursor = Appointment.find(filter)
    .sort({ scheduledAt: -1 })
    .skip((query.page - 1) * query.pageSize)
    .limit(query.pageSize);
  if (populateCustomer) cursor.populate("customer", CUSTOMER_FIELDS);
  const docs = await cursor;

  return {
    items: docs.map(toAppointment),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

async function getAppointmentOrThrow(
  scope: Record<string, unknown>,
  appointmentId: string,
  populateCustomer = false,
): Promise<AppointmentDocument> {
  const cursor = Appointment.findOne({
    _id: appointmentId,
    ...scope,
    ...LIVE,
  });
  if (populateCustomer) cursor.populate("customer", CUSTOMER_FIELDS);
  const appointment = await cursor.catch(() => null);
  if (!appointment) {
    throw HttpError.notFound("Appointment not found");
  }
  return appointment;
}

async function applyCancel(
  appointment: AppointmentDocument,
  actor: AppointmentActor,
  reason: string | undefined,
): Promise<AppointmentDTO> {
  if (appointment.status !== AppointmentStatus.CONFIRMED) {
    throw HttpError.conflict(
      `Appointment is already ${appointment.status.toLowerCase()}`,
    );
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      appointment.status = AppointmentStatus.CANCELLED;
      appointment.cancelledBy = actor;
      appointment.cancelReason = reason;
      await appointment.save({ session });

      await AppointmentSlot.updateOne(
        { _id: appointment.slot, startsAt: { $gt: new Date() } },
        {
          $set: { status: AppointmentSlotStatus.OPEN },
          $unset: { appointment: "" },
        },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return toAppointment(appointment);
}

export const appointmentService = {
  async book(
    customerId: string,
    workshopId: string,
    input: BookAppointmentInput,
  ): Promise<AppointmentDTO> {
    const workshop = await Workshop.findOne({
      _id: workshopId,
      status: WorkshopStatus.ACTIVE,
      ...LIVE,
    }).catch(() => null);
    if (!workshop) {
      throw HttpError.notFound("Workshop not found");
    }

    const brand = await CarBrand.findOne({
      _id: input.vehicle.brandId,
      ...LIVE,
    }).catch(() => null);
    if (!brand) {
      throw HttpError.badRequest("Unknown car brand");
    }
    const model = await CarModel.findOne({
      _id: input.vehicle.modelId,
      brand: brand._id,
      ...LIVE,
    }).catch(() => null);
    if (!model) {
      throw HttpError.badRequest("Unknown car model for this brand");
    }

    const session = await mongoose.startSession();
    try {
      let created: AppointmentDocument | undefined;
      await session.withTransaction(async () => {
        // Claim the slot atomically: only if still OPEN and in the future.
        const slot = await AppointmentSlot.findOneAndUpdate(
          {
            _id: input.slotId,
            workshop: workshop._id,
            status: AppointmentSlotStatus.OPEN,
            deleted: false,
            startsAt: { $gt: new Date() },
          },
          { $set: { status: AppointmentSlotStatus.BOOKED } },
          { session },
        ).catch(() => null);
        if (!slot) {
          throw HttpError.conflict("This slot is no longer available");
        }

        const [appointment] = await Appointment.create(
          [
            {
              workshop: workshop._id,
              workshopName: workshop.name,
              customer: customerId,
              slot: slot._id,
              scheduledAt: slot.startsAt,
              problemDescription: input.problemDescription,
              vehicle: {
                brandId: brand._id,
                brandName: brand.name,
                modelId: model._id,
                modelName: model.name,
                licensePlate: input.vehicle.licensePlate,
              },
              status: AppointmentStatus.CONFIRMED,
            },
          ],
          { session },
        );
        if (!appointment) {
          throw HttpError.conflict("Could not create the appointment");
        }
        created = appointment;

        await AppointmentSlot.updateOne(
          { _id: slot._id },
          { $set: { appointment: appointment._id } },
          { session },
        );
      });

      // withTransaction only resolves after a successful commit.
      return toAppointment(created as AppointmentDocument);
    } finally {
      await session.endSession();
    }
  },

  listForCustomer(
    customerId: string,
    query: ListAppointmentsQuery,
  ): Promise<Paginated<AppointmentDTO>> {
    return listAppointments({ customer: customerId }, query);
  },

  listForWorkshop(
    workshopId: string,
    query: ListAppointmentsQuery,
  ): Promise<Paginated<AppointmentDTO>> {
    return listAppointments({ workshop: workshopId }, query, true);
  },

  /** Platform admin: appointments across every workshop. */
  listAll(query: ListAppointmentsQuery): Promise<Paginated<AppointmentDTO>> {
    return listAppointments({}, query, true);
  },

  /** Platform admin: the most recently booked appointments. */
  async recent(limit: number): Promise<AppointmentDTO[]> {
    const docs = await Appointment.find(LIVE)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("customer", CUSTOMER_FIELDS);
    return docs.map(toAppointment);
  },

  /** Confirmed/completed appointments of a workshop that have no repair order yet. */
  async eligibleForRepairOrder(workshopId: string): Promise<AppointmentDTO[]> {
    const claimed = await RepairOrder.find({
      workshop: workshopId,
      deleted: false,
    }).distinct("appointment");

    const docs = await Appointment.find({
      workshop: workshopId,
      ...LIVE,
      status: {
        $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED],
      },
      _id: { $nin: claimed },
    })
      .sort({ scheduledAt: -1 })
      .limit(50)
      .populate("customer", CUSTOMER_FIELDS);

    return docs.map(toAppointment);
  },

  getForCustomer(
    customerId: string,
    appointmentId: string,
  ): Promise<AppointmentDTO> {
    return getAppointmentOrThrow({ customer: customerId }, appointmentId).then(
      toAppointment,
    );
  },

  async getForWorkshop(
    workshopId: string,
    appointmentId: string,
  ): Promise<AppointmentDTO> {
    const doc = await getAppointmentOrThrow(
      { workshop: workshopId },
      appointmentId,
      true,
    );
    const order = await RepairOrder.findOne({
      appointment: doc._id,
      deleted: false,
    }).select("_id");
    return { ...toAppointment(doc), repairOrderId: order ? order.id : undefined };
  },

  async cancelByCustomer(
    customerId: string,
    appointmentId: string,
    reason: string | undefined,
  ): Promise<AppointmentDTO> {
    const appointment = await getAppointmentOrThrow(
      { customer: customerId },
      appointmentId,
    );
    return applyCancel(appointment, AppointmentActor.CUSTOMER, reason);
  },

  async cancelByWorkshop(
    workshopId: string,
    appointmentId: string,
    reason: string | undefined,
  ): Promise<AppointmentDTO> {
    const appointment = await getAppointmentOrThrow(
      { workshop: workshopId },
      appointmentId,
      true,
    );
    return applyCancel(appointment, AppointmentActor.WORKSHOP, reason);
  },

  async completeByWorkshop(
    workshopId: string,
    appointmentId: string,
  ): Promise<AppointmentDTO> {
    const appointment = await getAppointmentOrThrow(
      { workshop: workshopId },
      appointmentId,
      true,
    );
    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw HttpError.conflict(
        `Appointment is already ${appointment.status.toLowerCase()}`,
      );
    }
    appointment.status = AppointmentStatus.COMPLETED;
    await appointment.save();
    return toAppointment(appointment);
  },
};

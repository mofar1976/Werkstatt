import {
  AppointmentSlotStatus,
  type AppointmentSlot as AppointmentSlotDTO,
  type PublicSlot,
} from "@car-garage/shared";
import { HttpError } from "../helpers/http-error.js";
import {
  AppointmentSlot,
  type AppointmentSlotDocument,
} from "../models/appointment-slot.model.js";
import type {
  CreateSlotInput,
  ListSlotsQuery,
} from "../dto/appointment-slot.dto.js";

const LIVE = { deleted: false } as const;

function toSlot(doc: AppointmentSlotDocument): AppointmentSlotDTO {
  return {
    id: doc.id,
    workshopId: String(doc.workshop),
    startsAt: doc.startsAt.toISOString(),
    endsAt: doc.endsAt.toISOString(),
    status: doc.status,
    appointmentId: doc.appointment ? String(doc.appointment) : undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toPublicSlot(doc: AppointmentSlotDocument): PublicSlot {
  return {
    id: doc.id,
    workshopId: String(doc.workshop),
    startsAt: doc.startsAt.toISOString(),
    endsAt: doc.endsAt.toISOString(),
  };
}

async function getSlotOrThrow(
  workshopId: string,
  slotId: string,
): Promise<AppointmentSlotDocument> {
  const slot = await AppointmentSlot.findOne({
    _id: slotId,
    workshop: workshopId,
    ...LIVE,
  }).catch(() => null);
  if (!slot) {
    throw HttpError.notFound("Slot not found");
  }
  return slot;
}

export const appointmentSlotService = {
  async listForWorkshop(
    workshopId: string,
    query: ListSlotsQuery,
  ): Promise<AppointmentSlotDTO[]> {
    const filter: Record<string, unknown> = { workshop: workshopId, ...LIVE };
    if (query.status) filter.status = query.status;
    if (query.from || query.to) {
      filter.startsAt = {
        ...(query.from ? { $gte: new Date(query.from) } : {}),
        ...(query.to ? { $lte: new Date(query.to) } : {}),
      };
    }
    const docs = await AppointmentSlot.find(filter)
      .sort({ startsAt: 1 })
      .limit(1000);
    return docs.map(toSlot);
  },

  async listOpen(
    workshopId: string,
    range: { from?: string; to?: string },
  ): Promise<PublicSlot[]> {
    const now = new Date();
    const from =
      range.from && new Date(range.from) > now ? new Date(range.from) : now;
    const to = range.to
      ? new Date(range.to)
      : new Date(now.getTime() + 90 * 86_400_000);

    const docs = await AppointmentSlot.find({
      workshop: workshopId,
      ...LIVE,
      status: AppointmentSlotStatus.OPEN,
      startsAt: { $gte: from, $lte: to },
    })
      .sort({ startsAt: 1 })
      .limit(500);
    return docs.map(toPublicSlot);
  },

  async create(
    workshopId: string,
    input: CreateSlotInput,
  ): Promise<AppointmentSlotDTO> {
    if (input.startsAt.getTime() <= Date.now()) {
      throw HttpError.badRequest("Slot must start in the future");
    }

    const overlap = await AppointmentSlot.exists({
      workshop: workshopId,
      ...LIVE,
      startsAt: { $lt: input.endsAt },
      endsAt: { $gt: input.startsAt },
    });
    if (overlap) {
      throw HttpError.conflict("This slot overlaps an existing one");
    }

    const slot = await AppointmentSlot.create({
      workshop: workshopId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    });
    return toSlot(slot);
  },

  async setStatus(
    workshopId: string,
    slotId: string,
    status: "OPEN" | "BLOCKED",
  ): Promise<AppointmentSlotDTO> {
    const slot = await getSlotOrThrow(workshopId, slotId);
    if (slot.status === AppointmentSlotStatus.BOOKED) {
      throw HttpError.conflict("A booked slot cannot be changed");
    }
    slot.status = status;
    await slot.save();
    return toSlot(slot);
  },

  async remove(workshopId: string, slotId: string): Promise<void> {
    const slot = await getSlotOrThrow(workshopId, slotId);
    if (slot.status === AppointmentSlotStatus.BOOKED) {
      throw HttpError.conflict("A booked slot cannot be deleted; cancel the appointment first");
    }
    slot.deleted = true;
    await slot.save();
  },
};

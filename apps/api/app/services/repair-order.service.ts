import mongoose from "mongoose";
import {
  AppointmentStatus,
  QuoteStatus,
  RepairOrderStatus,
  TimelineActor,
  TimelineEventType,
  type Paginated,
  type RepairAssignee,
  type RepairLineItem,
  type RepairOrder as RepairOrderDTO,
  type RepairOrderDetail,
  type RepairQuote,
  type RepairTimelineEvent,
} from "@car-garage/shared";
import { HttpError } from "../helpers/http-error.js";
import { Appointment } from "../models/appointment.model.js";
import {
  RepairOrder,
  type IRepairLineItem,
  type RepairOrderDocument,
} from "../models/repair-order.model.js";
import { RepairOrderEvent } from "../models/repair-order-event.model.js";
import { User } from "../models/user.model.js";
import { WorkshopMember } from "../models/workshop-member.model.js";
import type {
  AdvanceStatusInput,
  ListRepairOrdersQuery,
  SaveDiagnosisInput,
} from "../dto/repair-order.dto.js";

const LIVE = { deleted: false } as const;

/** Terminal states — nothing can move an order out of these. */
const TERMINAL: RepairOrderStatus[] = [
  RepairOrderStatus.CLOSED,
  RepairOrderStatus.CANCELLED,
  RepairOrderStatus.QUOTE_REJECTED,
];

/** Allowed workshop-driven status transitions (customer approval is separate). */
const WORKSHOP_TRANSITIONS: Partial<
  Record<RepairOrderStatus, RepairOrderStatus[]>
> = {
  [RepairOrderStatus.VEHICLE_RECEIVED]: [RepairOrderStatus.DIAGNOSIS_IN_PROGRESS],
  [RepairOrderStatus.QUOTE_APPROVED]: [RepairOrderStatus.REPAIR_IN_PROGRESS],
  [RepairOrderStatus.REPAIR_IN_PROGRESS]: [
    RepairOrderStatus.WAITING_FOR_PARTS,
    RepairOrderStatus.REPAIR_COMPLETED,
  ],
  [RepairOrderStatus.WAITING_FOR_PARTS]: [
    RepairOrderStatus.REPAIR_IN_PROGRESS,
    RepairOrderStatus.REPAIR_COMPLETED,
  ],
  [RepairOrderStatus.REPAIR_COMPLETED]: [RepairOrderStatus.READY_FOR_PICKUP],
  [RepairOrderStatus.READY_FOR_PICKUP]: [RepairOrderStatus.CLOSED],
};

interface PopulatedUser {
  _id: unknown;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
}

interface PopulatedMember {
  _id: unknown;
  user: PopulatedUser;
}

function isPopulatedUser(v: unknown): v is PopulatedUser {
  return (
    typeof v === "object" && v !== null && "firstName" in v && "email" in v
  );
}

function computeTotals(
  lineItems: Pick<IRepairLineItem, "quantity" | "unitPriceCents">[],
  taxRatePercent: number,
): { netCents: number; taxCents: number; grossCents: number } {
  const netCents = lineItems.reduce(
    (sum, li) => sum + Math.round(li.quantity * li.unitPriceCents),
    0,
  );
  const taxCents = Math.round((netCents * taxRatePercent) / 100);
  return { netCents, taxCents, grossCents: netCents + taxCents };
}

function toLineItem(li: IRepairLineItem): RepairLineItem {
  return {
    kind: li.kind,
    partAction: li.partAction ?? undefined,
    description: li.description,
    quantity: li.quantity,
    unitPriceCents: li.unitPriceCents,
    lineTotalCents: li.lineTotalCents,
  };
}

function toQuote(q: RepairOrderDocument["quote"]): RepairQuote {
  return {
    status: q.status,
    lineItems: q.lineItems.map(toLineItem),
    taxRatePercent: q.taxRatePercent,
    netCents: q.netCents,
    taxCents: q.taxCents,
    grossCents: q.grossCents,
    notes: q.notes ?? undefined,
    sentAt: q.sentAt?.toISOString(),
    decidedAt: q.decidedAt?.toISOString(),
    rejectionReason: q.rejectionReason ?? undefined,
  };
}

function toAssignees(doc: RepairOrderDocument): RepairAssignee[] {
  return (doc.assignedMembers as unknown[]).flatMap((m) => {
    if (
      typeof m === "object" &&
      m !== null &&
      "user" in m &&
      isPopulatedUser((m as PopulatedMember).user)
    ) {
      const member = m as PopulatedMember;
      return [
        {
          id: String(member._id),
          firstName: member.user.firstName,
          lastName: member.user.lastName,
        },
      ];
    }
    return [];
  });
}

function toRepairOrder(doc: RepairOrderDocument): RepairOrderDTO {
  const customer = isPopulatedUser(doc.customer)
    ? {
        firstName: doc.customer.firstName,
        lastName: doc.customer.lastName,
        phone: doc.customer.phone ?? undefined,
        email: doc.customer.email,
      }
    : undefined;

  return {
    id: doc.id,
    appointmentId: String(doc.appointment),
    workshopId: String(doc.workshop),
    workshopName: doc.workshopName,
    customerId: isPopulatedUser(doc.customer)
      ? String(doc.customer._id)
      : String(doc.customer),
    customer,
    vehicle: {
      brandId: String(doc.vehicle.brandId),
      brandName: doc.vehicle.brandName,
      modelId: String(doc.vehicle.modelId),
      modelName: doc.vehicle.modelName,
      licensePlate: doc.vehicle.licensePlate ?? undefined,
    },
    problemDescription: doc.problemDescription,
    status: doc.status,
    cause: doc.cause ?? undefined,
    assignedMembers: toAssignees(doc),
    quote: toQuote(doc.quote),
    cancelReason: doc.cancelReason ?? undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toEvent(e: {
  id: string;
  type: TimelineEventType;
  status?: RepairOrderStatus;
  message?: string;
  actor: TimelineActor;
  actorName?: string;
  createdAt: Date;
}): RepairTimelineEvent {
  return {
    id: e.id,
    type: e.type,
    status: e.status ?? undefined,
    message: e.message ?? undefined,
    actor: e.actor,
    actorName: e.actorName ?? undefined,
    createdAt: e.createdAt.toISOString(),
  };
}

const ASSIGNEE_POPULATE = {
  path: "assignedMembers",
  populate: { path: "user", select: "firstName lastName" },
} as const;

async function userName(userId: string): Promise<string> {
  const user = await User.findById(userId).select("firstName lastName");
  return user ? `${user.firstName} ${user.lastName}` : "";
}

async function logEvent(
  repairOrderId: mongoose.Types.ObjectId | string,
  event: {
    type: TimelineEventType;
    status?: RepairOrderStatus;
    message?: string;
    actor: TimelineActor;
    actorName?: string;
  },
  session?: mongoose.ClientSession,
): Promise<void> {
  await RepairOrderEvent.create(
    [{ repairOrder: repairOrderId, ...event }],
    session ? { session } : {},
  );
}

async function loadForWorkshop(
  workshopId: string,
  id: string,
  withCustomer = false,
): Promise<RepairOrderDocument> {
  const cursor = RepairOrder.findOne({
    _id: id,
    workshop: workshopId,
    ...LIVE,
  }).populate(ASSIGNEE_POPULATE);
  if (withCustomer) {
    cursor.populate("customer", "firstName lastName phone email");
  }
  const order = await cursor.catch(() => null);
  if (!order) {
    throw HttpError.notFound("Repair order not found");
  }
  return order;
}

async function loadForCustomer(
  customerId: string,
  id: string,
): Promise<RepairOrderDocument> {
  const order = await RepairOrder.findOne({ _id: id, customer: customerId, ...LIVE })
    .populate(ASSIGNEE_POPULATE)
    .catch(() => null);
  if (!order) {
    throw HttpError.notFound("Repair order not found");
  }
  return order;
}

async function timelineFor(id: string): Promise<RepairTimelineEvent[]> {
  const events = await RepairOrderEvent.find({ repairOrder: id }).sort({
    createdAt: 1,
  });
  return events.map(toEvent);
}

async function listOrders(
  scope: Record<string, unknown>,
  query: ListRepairOrdersQuery,
  withCustomer: boolean,
): Promise<Paginated<RepairOrderDTO>> {
  const filter: Record<string, unknown> = { ...scope, ...LIVE };
  if (query.status) filter.status = query.status;

  const total = await RepairOrder.countDocuments(filter);
  const cursor = RepairOrder.find(filter)
    .sort({ createdAt: -1 })
    .skip((query.page - 1) * query.pageSize)
    .limit(query.pageSize)
    .populate(ASSIGNEE_POPULATE);
  if (withCustomer) {
    cursor.populate("customer", "firstName lastName phone email");
  }
  const docs = await cursor;

  return {
    items: docs.map(toRepairOrder),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

function assertNotTerminal(order: RepairOrderDocument): void {
  if (TERMINAL.includes(order.status)) {
    throw HttpError.conflict(
      `Repair order is ${order.status.toLowerCase()} and cannot be changed`,
    );
  }
}

export const repairOrderService = {
  async createFromAppointment(
    workshopId: string,
    appointmentId: string,
    by: { userId: string },
  ): Promise<RepairOrderDetail> {
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      workshop: workshopId,
      ...LIVE,
    }).catch(() => null);
    if (!appointment) {
      throw HttpError.notFound("Appointment not found");
    }
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw HttpError.conflict("This appointment was cancelled");
    }

    const existing = await RepairOrder.findOne({
      appointment: appointment._id,
      ...LIVE,
    });
    if (existing) {
      throw HttpError.conflict("This appointment already has a repair order");
    }

    const workshopName = appointment.workshopName;
    const actorName = await userName(by.userId);
    const session = await mongoose.startSession();
    let created: RepairOrderDocument | undefined;
    try {
      await session.withTransaction(async () => {
        // Atomic + retry-safe: `withTransaction` re-runs this callback on a
        // transient error, so never branch on a mutated in-memory document.
        await Appointment.updateOne(
          { _id: appointment._id, status: AppointmentStatus.CONFIRMED },
          { $set: { status: AppointmentStatus.COMPLETED } },
          { session },
        );

        const [order] = await RepairOrder.create(
          [
            {
              appointment: appointment._id,
              workshop: appointment.workshop,
              workshopName,
              customer: appointment.customer,
              vehicle: appointment.vehicle,
              problemDescription: appointment.problemDescription,
              status: RepairOrderStatus.VEHICLE_RECEIVED,
            },
          ],
          { session },
        );
        if (!order) throw HttpError.conflict("Could not create the repair order");
        created = order;

        await logEvent(
          order._id,
          {
            type: TimelineEventType.ORDER_CREATED,
            status: RepairOrderStatus.VEHICLE_RECEIVED,
            actor: TimelineActor.WORKSHOP,
            actorName,
            message: "Fahrzeug angenommen",
          },
          session,
        );
      });
    } finally {
      await session.endSession();
    }

    return this.getForWorkshop(workshopId, (created as RepairOrderDocument).id);
  },

  listForWorkshop(
    workshopId: string,
    query: ListRepairOrdersQuery,
  ): Promise<Paginated<RepairOrderDTO>> {
    return listOrders({ workshop: workshopId }, query, true);
  },

  listForCustomer(
    customerId: string,
    query: ListRepairOrdersQuery,
  ): Promise<Paginated<RepairOrderDTO>> {
    return listOrders({ customer: customerId }, query, false);
  },

  /** Platform admin: repair orders across every workshop. */
  listAll(query: ListRepairOrdersQuery): Promise<Paginated<RepairOrderDTO>> {
    return listOrders({}, query, true);
  },

  async getForWorkshop(
    workshopId: string,
    id: string,
  ): Promise<RepairOrderDetail> {
    const order = await loadForWorkshop(workshopId, id, true);
    return { ...toRepairOrder(order), timeline: await timelineFor(order.id) };
  },

  async getForCustomer(
    customerId: string,
    id: string,
  ): Promise<RepairOrderDetail> {
    const order = await loadForCustomer(customerId, id);
    return { ...toRepairOrder(order), timeline: await timelineFor(order.id) };
  },

  async saveDiagnosis(
    workshopId: string,
    id: string,
    input: SaveDiagnosisInput,
    by: { userId: string },
  ): Promise<RepairOrderDetail> {
    const order = await loadForWorkshop(workshopId, id);
    if (order.quote.status !== QuoteStatus.DRAFT) {
      throw HttpError.conflict(
        "The cost estimate was already sent and can no longer be edited",
      );
    }
    if (
      order.status !== RepairOrderStatus.VEHICLE_RECEIVED &&
      order.status !== RepairOrderStatus.DIAGNOSIS_IN_PROGRESS
    ) {
      throw HttpError.conflict("The diagnosis can no longer be edited");
    }

    if (input.cause !== undefined) {
      order.cause = input.cause || undefined;
    }
    if (input.quote) {
      const lineItems: IRepairLineItem[] = input.quote.lineItems.map((li) => ({
        kind: li.kind,
        partAction: li.partAction,
        description: li.description,
        quantity: li.quantity,
        unitPriceCents: li.unitPriceCents,
        lineTotalCents: Math.round(li.quantity * li.unitPriceCents),
      }));
      order.quote.lineItems = lineItems as never;
      order.quote.taxRatePercent = input.quote.taxRatePercent;
      order.quote.notes = input.quote.notes || undefined;
      Object.assign(
        order.quote,
        computeTotals(lineItems, input.quote.taxRatePercent),
      );
    }

    if (order.status === RepairOrderStatus.VEHICLE_RECEIVED) {
      order.status = RepairOrderStatus.DIAGNOSIS_IN_PROGRESS;
    }
    await order.save();

    await logEvent(order._id, {
      type: TimelineEventType.DIAGNOSIS_ADDED,
      actor: TimelineActor.WORKSHOP,
      actorName: await userName(by.userId),
      message: "Diagnose aktualisiert",
    });

    return this.getForWorkshop(workshopId, id);
  },

  async setAssignees(
    workshopId: string,
    id: string,
    memberIds: string[],
    by: { userId: string },
  ): Promise<RepairOrderDetail> {
    const order = await loadForWorkshop(workshopId, id);
    assertNotTerminal(order);

    const unique = [...new Set(memberIds)];
    const members = await WorkshopMember.find({
      _id: { $in: unique },
      workshop: workshopId,
      ...LIVE,
    }).populate<{ user: PopulatedUser }>("user", "firstName lastName");
    if (members.length !== unique.length) {
      throw HttpError.badRequest("One or more members are not in this workshop");
    }

    order.assignedMembers = members.map((m) => m._id) as never;
    await order.save();

    const names = members
      .map((m) => `${m.user.firstName} ${m.user.lastName}`)
      .join(", ");
    await logEvent(order._id, {
      type: TimelineEventType.NOTE_ADDED,
      actor: TimelineActor.WORKSHOP,
      actorName: await userName(by.userId),
      message: `Zuständig: ${names || "niemand"}`,
    });

    return this.getForWorkshop(workshopId, id);
  },

  async sendQuote(
    workshopId: string,
    id: string,
    by: { userId: string },
  ): Promise<RepairOrderDetail> {
    const order = await loadForWorkshop(workshopId, id);
    if (order.status !== RepairOrderStatus.DIAGNOSIS_IN_PROGRESS) {
      throw HttpError.conflict("The diagnosis is not ready to be sent");
    }
    if (!order.cause) {
      throw HttpError.badRequest("Add the cause before sending the estimate");
    }
    if (order.quote.lineItems.length === 0) {
      throw HttpError.badRequest("Add at least one line item to the estimate");
    }

    order.quote.status = QuoteStatus.SENT;
    order.quote.sentAt = new Date();
    order.status = RepairOrderStatus.QUOTE_PENDING_APPROVAL;
    await order.save();

    await logEvent(order._id, {
      type: TimelineEventType.QUOTE_SENT,
      status: RepairOrderStatus.QUOTE_PENDING_APPROVAL,
      actor: TimelineActor.WORKSHOP,
      actorName: await userName(by.userId),
      message: "Kostenvoranschlag an die Kundschaft gesendet",
    });

    return this.getForWorkshop(workshopId, id);
  },

  async advanceStatus(
    workshopId: string,
    id: string,
    input: AdvanceStatusInput,
    by: { userId: string },
  ): Promise<RepairOrderDetail> {
    const order = await loadForWorkshop(workshopId, id);
    const allowed = WORKSHOP_TRANSITIONS[order.status] ?? [];
    const target = input.status as RepairOrderStatus;
    if (!allowed.includes(target)) {
      throw HttpError.conflict(
        `Cannot move from ${order.status} to ${target}`,
      );
    }

    order.status = target;
    await order.save();

    const actorName = await userName(by.userId);
    await logEvent(order._id, {
      type: TimelineEventType.STATUS_CHANGED,
      status: target,
      actor: TimelineActor.WORKSHOP,
      actorName,
    });
    if (input.note) {
      await logEvent(order._id, {
        type: TimelineEventType.NOTE_ADDED,
        actor: TimelineActor.WORKSHOP,
        actorName,
        message: input.note,
      });
    }

    return this.getForWorkshop(workshopId, id);
  },

  async addNote(
    workshopId: string,
    id: string,
    message: string,
    by: { userId: string },
  ): Promise<RepairOrderDetail> {
    const order = await loadForWorkshop(workshopId, id);
    await logEvent(order._id, {
      type: TimelineEventType.NOTE_ADDED,
      actor: TimelineActor.WORKSHOP,
      actorName: await userName(by.userId),
      message,
    });
    return this.getForWorkshop(workshopId, id);
  },

  async cancel(
    workshopId: string,
    id: string,
    reason: string | undefined,
    by: { userId: string },
  ): Promise<RepairOrderDetail> {
    const order = await loadForWorkshop(workshopId, id);
    assertNotTerminal(order);

    order.status = RepairOrderStatus.CANCELLED;
    order.cancelReason = reason;
    if (order.quote.status === QuoteStatus.SENT) {
      order.quote.status = QuoteStatus.REJECTED;
    }
    await order.save();

    await logEvent(order._id, {
      type: TimelineEventType.STATUS_CHANGED,
      status: RepairOrderStatus.CANCELLED,
      actor: TimelineActor.WORKSHOP,
      actorName: await userName(by.userId),
      message: reason,
    });

    return this.getForWorkshop(workshopId, id);
  },

  async approveQuote(
    customerId: string,
    id: string,
  ): Promise<RepairOrderDetail> {
    const order = await loadForCustomer(customerId, id);
    if (order.status !== RepairOrderStatus.QUOTE_PENDING_APPROVAL) {
      throw HttpError.conflict("There is no estimate waiting for your decision");
    }

    order.quote.status = QuoteStatus.APPROVED;
    order.quote.decidedAt = new Date();
    order.status = RepairOrderStatus.QUOTE_APPROVED;
    await order.save();

    await logEvent(order._id, {
      type: TimelineEventType.QUOTE_APPROVED,
      status: RepairOrderStatus.QUOTE_APPROVED,
      actor: TimelineActor.CUSTOMER,
      actorName: await userName(customerId),
      message: "Kostenvoranschlag freigegeben",
    });

    return this.getForCustomer(customerId, id);
  },

  async rejectQuote(
    customerId: string,
    id: string,
    reason: string | undefined,
  ): Promise<RepairOrderDetail> {
    const order = await loadForCustomer(customerId, id);
    if (order.status !== RepairOrderStatus.QUOTE_PENDING_APPROVAL) {
      throw HttpError.conflict("There is no estimate waiting for your decision");
    }

    order.quote.status = QuoteStatus.REJECTED;
    order.quote.decidedAt = new Date();
    order.quote.rejectionReason = reason;
    order.status = RepairOrderStatus.QUOTE_REJECTED;
    await order.save();

    await logEvent(order._id, {
      type: TimelineEventType.QUOTE_REJECTED,
      status: RepairOrderStatus.QUOTE_REJECTED,
      actor: TimelineActor.CUSTOMER,
      actorName: await userName(customerId),
      message: reason ?? "Kostenvoranschlag abgelehnt",
    });

    return this.getForCustomer(customerId, id);
  },
};

import {
  AppointmentStatus,
  AuthAudience,
  RepairOrderStatus,
  WorkshopStatus,
  type AdminOverview,
} from "@car-garage/shared";
import { Appointment } from "../../models/appointment.model.js";
import { CarBrand } from "../../models/car-brand.model.js";
import { CarModel } from "../../models/car-model.model.js";
import { RepairOrder } from "../../models/repair-order.model.js";
import { User } from "../../models/user.model.js";
import { Workshop } from "../../models/workshop.model.js";
import { appointmentService } from "../appointment.service.js";

const LIVE = { deleted: false } as const;

const TERMINAL_REPAIR_STATUSES = [
  RepairOrderStatus.CLOSED,
  RepairOrderStatus.CANCELLED,
  RepairOrderStatus.QUOTE_REJECTED,
];

export const adminStatsService = {
  async overview(): Promise<AdminOverview> {
    const now = new Date();

    const [
      workshopsTotal,
      workshopsActive,
      workshopsPending,
      workshopsSuspended,
      customersTotal,
      customersBlocked,
      appointmentsUpcoming,
      appointmentsTotal,
      repairOrdersOpen,
      repairOrdersAwaiting,
      repairOrdersTotal,
      brands,
      models,
      pendingWorkshopDocs,
      recentAppointments,
    ] = await Promise.all([
      Workshop.countDocuments(LIVE),
      Workshop.countDocuments({ ...LIVE, status: WorkshopStatus.ACTIVE }),
      Workshop.countDocuments({ ...LIVE, status: WorkshopStatus.PENDING }),
      Workshop.countDocuments({ ...LIVE, status: WorkshopStatus.SUSPENDED }),
      User.countDocuments({ ...LIVE, audience: AuthAudience.CUSTOMER }),
      User.countDocuments({
        ...LIVE,
        audience: AuthAudience.CUSTOMER,
        isActive: false,
      }),
      Appointment.countDocuments({
        ...LIVE,
        status: AppointmentStatus.CONFIRMED,
        scheduledAt: { $gte: now },
      }),
      Appointment.countDocuments(LIVE),
      RepairOrder.countDocuments({
        ...LIVE,
        status: { $nin: TERMINAL_REPAIR_STATUSES },
      }),
      RepairOrder.countDocuments({
        ...LIVE,
        status: RepairOrderStatus.QUOTE_PENDING_APPROVAL,
      }),
      RepairOrder.countDocuments(LIVE),
      CarBrand.countDocuments(LIVE),
      CarModel.countDocuments(LIVE),
      Workshop.find({ ...LIVE, status: WorkshopStatus.PENDING })
        .sort({ createdAt: -1 })
        .limit(5),
      appointmentService.recent(5),
    ]);

    return {
      workshops: {
        total: workshopsTotal,
        active: workshopsActive,
        pending: workshopsPending,
        suspended: workshopsSuspended,
      },
      customers: { total: customersTotal, blocked: customersBlocked },
      appointments: {
        upcoming: appointmentsUpcoming,
        total: appointmentsTotal,
      },
      repairOrders: {
        open: repairOrdersOpen,
        awaitingApproval: repairOrdersAwaiting,
        total: repairOrdersTotal,
      },
      catalog: { brands, models },
      pendingWorkshops: pendingWorkshopDocs.map((w) => ({
        id: w.id,
        name: w.name,
        city: w.address.city,
        createdAt: w.createdAt.toISOString(),
      })),
      recentAppointments,
    };
  },
};

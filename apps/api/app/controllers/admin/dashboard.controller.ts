import type { RequestHandler } from "express";
import { listAppointmentsQuerySchema } from "../../dto/appointment.dto.js";
import { listRepairOrdersQuerySchema } from "../../dto/repair-order.dto.js";
import { adminStatsService } from "../../services/admin/stats.service.js";
import { appointmentService } from "../../services/appointment.service.js";
import { repairOrderService } from "../../services/repair-order.service.js";

/**
 * Backoffice dashboard: platform-wide figures and cross-workshop operational
 * lists. Mounted under /api/admin; every route requires a platform admin.
 */
export const adminDashboardController = {
  overview: ((_req, res, next) => {
    adminStatsService
      .overview()
      .then((data) => res.json(data))
      .catch(next);
  }) satisfies RequestHandler,

  listAppointments: ((req, res, next) => {
    const query = listAppointmentsQuerySchema.parse(req.query);
    appointmentService
      .listAll(query)
      .then((result) => res.json(result))
      .catch(next);
  }) satisfies RequestHandler,

  listRepairOrders: ((req, res, next) => {
    const query = listRepairOrdersQuerySchema.parse(req.query);
    repairOrderService
      .listAll(query)
      .then((result) => res.json(result))
      .catch(next);
  }) satisfies RequestHandler,
};

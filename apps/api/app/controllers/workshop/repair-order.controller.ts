import type { RequestHandler } from "express";
import { HttpError } from "../../helpers/http-error.js";
import { routeParam } from "../../helpers/request.js";
import {
  addNoteSchema,
  advanceStatusSchema,
  cancelRepairOrderSchema,
  createRepairOrderSchema,
  listRepairOrdersQuerySchema,
  saveDiagnosisSchema,
  setAssigneesSchema,
} from "../../dto/repair-order.dto.js";
import { appointmentService } from "../../services/appointment.service.js";
import { repairOrderService } from "../../services/repair-order.service.js";

function workshopId(req: Parameters<RequestHandler>[0]): string {
  if (!req.workshop) {
    throw HttpError.forbidden("You are not assigned to a workshop");
  }
  return req.workshop.id;
}

function actor(req: Parameters<RequestHandler>[0]): { userId: string } {
  if (!req.auth) throw HttpError.unauthorized();
  return { userId: req.auth.sub };
}

export const workshopRepairOrderController = {
  create: ((req, res, next) => {
    const { appointmentId } = createRepairOrderSchema.parse(req.body);
    repairOrderService
      .createFromAppointment(workshopId(req), appointmentId, actor(req))
      .then((order) => res.status(201).json(order))
      .catch(next);
  }) satisfies RequestHandler,

  list: ((req, res, next) => {
    const query = listRepairOrdersQuerySchema.parse(req.query);
    repairOrderService
      .listForWorkshop(workshopId(req), query)
      .then((result) => res.json(result))
      .catch(next);
  }) satisfies RequestHandler,

  /** Appointments that could still become a repair order. */
  candidates: ((req, res, next) => {
    appointmentService
      .eligibleForRepairOrder(workshopId(req))
      .then((items) => res.json({ items }))
      .catch(next);
  }) satisfies RequestHandler,

  get: ((req, res, next) => {
    repairOrderService
      .getForWorkshop(workshopId(req), routeParam(req, "orderId"))
      .then((order) => res.json(order))
      .catch(next);
  }) satisfies RequestHandler,

  saveDiagnosis: ((req, res, next) => {
    const input = saveDiagnosisSchema.parse(req.body);
    repairOrderService
      .saveDiagnosis(workshopId(req), routeParam(req, "orderId"), input, actor(req))
      .then((order) => res.json(order))
      .catch(next);
  }) satisfies RequestHandler,

  setAssignees: ((req, res, next) => {
    const { memberIds } = setAssigneesSchema.parse(req.body);
    repairOrderService
      .setAssignees(workshopId(req), routeParam(req, "orderId"), memberIds, actor(req))
      .then((order) => res.json(order))
      .catch(next);
  }) satisfies RequestHandler,

  sendQuote: ((req, res, next) => {
    repairOrderService
      .sendQuote(workshopId(req), routeParam(req, "orderId"), actor(req))
      .then((order) => res.json(order))
      .catch(next);
  }) satisfies RequestHandler,

  advanceStatus: ((req, res, next) => {
    const input = advanceStatusSchema.parse(req.body);
    repairOrderService
      .advanceStatus(workshopId(req), routeParam(req, "orderId"), input, actor(req))
      .then((order) => res.json(order))
      .catch(next);
  }) satisfies RequestHandler,

  addNote: ((req, res, next) => {
    const { message } = addNoteSchema.parse(req.body);
    repairOrderService
      .addNote(workshopId(req), routeParam(req, "orderId"), message, actor(req))
      .then((order) => res.json(order))
      .catch(next);
  }) satisfies RequestHandler,

  cancel: ((req, res, next) => {
    const { reason } = cancelRepairOrderSchema.parse(req.body ?? {});
    repairOrderService
      .cancel(workshopId(req), routeParam(req, "orderId"), reason, actor(req))
      .then((order) => res.json(order))
      .catch(next);
  }) satisfies RequestHandler,
};

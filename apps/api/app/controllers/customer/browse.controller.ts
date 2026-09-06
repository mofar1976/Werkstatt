import type { RequestHandler } from "express";
import { HttpError } from "../../helpers/http-error.js";
import { routeParam } from "../../helpers/request.js";
import {
  browseSlotsQuerySchema,
  browseWorkshopsQuerySchema,
} from "../../dto/customer-browse.dto.js";
import {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  listAppointmentsQuerySchema,
} from "../../dto/appointment.dto.js";
import { appointmentService } from "../../services/appointment.service.js";
import { appointmentSlotService } from "../../services/appointment-slot.service.js";
import { workshopService } from "../../services/workshop.service.js";

function customerId(req: Parameters<RequestHandler>[0]): string {
  if (!req.auth) throw HttpError.unauthorized();
  return req.auth.sub;
}

export const customerBrowseController = {
  listWorkshops: ((req, res, next) => {
    const query = browseWorkshopsQuerySchema.parse(req.query);
    workshopService
      .listPublic(query)
      .then((result) => res.json(result))
      .catch(next);
  }) satisfies RequestHandler,

  getWorkshop: ((req, res, next) => {
    workshopService
      .getPublic(routeParam(req, "workshopId"))
      .then((workshop) => res.json(workshop))
      .catch(next);
  }) satisfies RequestHandler,

  listSlots: ((req, res, next) => {
    const range = browseSlotsQuerySchema.parse(req.query);
    const workshopId = routeParam(req, "workshopId");
    workshopService
      .getPublic(workshopId)
      .then(() => appointmentSlotService.listOpen(workshopId, range))
      .then((items) => res.json({ items }))
      .catch(next);
  }) satisfies RequestHandler,

  bookAppointment: ((req, res, next) => {
    const input = bookAppointmentSchema.parse(req.body);
    appointmentService
      .book(customerId(req), routeParam(req, "workshopId"), input)
      .then((appointment) => res.status(201).json(appointment))
      .catch(next);
  }) satisfies RequestHandler,

  listAppointments: ((req, res, next) => {
    const query = listAppointmentsQuerySchema.parse(req.query);
    appointmentService
      .listForCustomer(customerId(req), query)
      .then((result) => res.json(result))
      .catch(next);
  }) satisfies RequestHandler,

  getAppointment: ((req, res, next) => {
    appointmentService
      .getForCustomer(customerId(req), routeParam(req, "appointmentId"))
      .then((appointment) => res.json(appointment))
      .catch(next);
  }) satisfies RequestHandler,

  cancelAppointment: ((req, res, next) => {
    const { reason } = cancelAppointmentSchema.parse(req.body ?? {});
    appointmentService
      .cancelByCustomer(
        customerId(req),
        routeParam(req, "appointmentId"),
        reason,
      )
      .then((appointment) => res.json(appointment))
      .catch(next);
  }) satisfies RequestHandler,
};

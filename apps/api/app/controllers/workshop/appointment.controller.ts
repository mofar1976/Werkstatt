import type { RequestHandler } from "express";
import { HttpError } from "../../helpers/http-error.js";
import { routeParam } from "../../helpers/request.js";
import {
  cancelAppointmentSchema,
  listAppointmentsQuerySchema,
} from "../../dto/appointment.dto.js";
import { appointmentService } from "../../services/appointment.service.js";

function workshopId(req: Parameters<RequestHandler>[0]): string {
  if (!req.workshop) {
    throw HttpError.forbidden("You are not assigned to a workshop");
  }
  return req.workshop.id;
}

export const workshopAppointmentController = {
  list: ((req, res, next) => {
    const query = listAppointmentsQuerySchema.parse(req.query);
    appointmentService
      .listForWorkshop(workshopId(req), query)
      .then((result) => res.json(result))
      .catch(next);
  }) satisfies RequestHandler,

  get: ((req, res, next) => {
    appointmentService
      .getForWorkshop(workshopId(req), routeParam(req, "appointmentId"))
      .then((appointment) => res.json(appointment))
      .catch(next);
  }) satisfies RequestHandler,

  cancel: ((req, res, next) => {
    const { reason } = cancelAppointmentSchema.parse(req.body ?? {});
    appointmentService
      .cancelByWorkshop(
        workshopId(req),
        routeParam(req, "appointmentId"),
        reason,
      )
      .then((appointment) => res.json(appointment))
      .catch(next);
  }) satisfies RequestHandler,

  complete: ((req, res, next) => {
    appointmentService
      .completeByWorkshop(workshopId(req), routeParam(req, "appointmentId"))
      .then((appointment) => res.json(appointment))
      .catch(next);
  }) satisfies RequestHandler,
};

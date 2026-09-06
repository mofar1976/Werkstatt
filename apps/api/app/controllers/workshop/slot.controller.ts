import type { RequestHandler } from "express";
import { z } from "zod";
import { HttpError } from "../../helpers/http-error.js";
import { routeParam } from "../../helpers/request.js";
import {
  createSlotSchema,
  listSlotsQuerySchema,
} from "../../dto/appointment-slot.dto.js";
import { appointmentSlotService } from "../../services/appointment-slot.service.js";

const setStatusSchema = z.object({ status: z.enum(["OPEN", "BLOCKED"]) });

function workshopId(req: Parameters<RequestHandler>[0]): string {
  if (!req.workshop) {
    throw HttpError.forbidden("You are not assigned to a workshop");
  }
  return req.workshop.id;
}

export const workshopSlotController = {
  list: ((req, res, next) => {
    const query = listSlotsQuerySchema.parse(req.query);
    appointmentSlotService
      .listForWorkshop(workshopId(req), query)
      .then((items) => res.json({ items }))
      .catch(next);
  }) satisfies RequestHandler,

  create: ((req, res, next) => {
    const input = createSlotSchema.parse(req.body);
    appointmentSlotService
      .create(workshopId(req), input)
      .then((slot) => res.status(201).json(slot))
      .catch(next);
  }) satisfies RequestHandler,

  setStatus: ((req, res, next) => {
    const { status } = setStatusSchema.parse(req.body);
    appointmentSlotService
      .setStatus(workshopId(req), routeParam(req, "slotId"), status)
      .then((slot) => res.json(slot))
      .catch(next);
  }) satisfies RequestHandler,

  remove: ((req, res, next) => {
    appointmentSlotService
      .remove(workshopId(req), routeParam(req, "slotId"))
      .then(() => res.status(204).end())
      .catch(next);
  }) satisfies RequestHandler,
};

import type { RequestHandler } from "express";
import { HttpError } from "../../helpers/http-error.js";
import { routeParam } from "../../helpers/request.js";
import {
  addMemberSchema,
  updateMemberSchema,
  updateOwnWorkshopSchema,
} from "../../dto/workshop.dto.js";
import { workshopService } from "../../services/workshop.service.js";

function workshopId(req: Parameters<RequestHandler>[0]): string {
  if (!req.workshop) {
    throw HttpError.forbidden("You are not assigned to a workshop");
  }
  return req.workshop.id;
}

export const workshopPortalController = {
  getMyWorkshop: ((req, res, next) => {
    workshopService
      .getById(workshopId(req))
      .then((workshop) => res.json(workshop))
      .catch(next);
  }) satisfies RequestHandler,

  updateMyWorkshop: ((req, res, next) => {
    const input = updateOwnWorkshopSchema.parse(req.body);
    workshopService
      .update(workshopId(req), input)
      .then((workshop) => res.json(workshop))
      .catch(next);
  }) satisfies RequestHandler,

  listMembers: ((req, res, next) => {
    workshopService
      .listMembers(workshopId(req))
      .then((members) => res.json({ items: members }))
      .catch(next);
  }) satisfies RequestHandler,

  addMember: ((req, res, next) => {
    const input = addMemberSchema.parse(req.body);
    workshopService
      .addMember(workshopId(req), input)
      .then((member) => res.status(201).json(member))
      .catch(next);
  }) satisfies RequestHandler,

  updateMember: ((req, res, next) => {
    const memberId = routeParam(req, "memberId");
    const input = updateMemberSchema.parse(req.body);
    if (input.role !== undefined && memberId === req.workshop?.membershipId) {
      next(HttpError.badRequest("You cannot change your own role"));
      return;
    }
    workshopService
      .updateMember(workshopId(req), memberId, input)
      .then((member) => res.json(member))
      .catch(next);
  }) satisfies RequestHandler,

  removeMember: ((req, res, next) => {
    const memberId = routeParam(req, "memberId");
    if (memberId === req.workshop?.membershipId) {
      next(HttpError.badRequest("You cannot remove yourself"));
      return;
    }
    workshopService
      .removeMember(workshopId(req), memberId)
      .then(() => res.status(204).end())
      .catch(next);
  }) satisfies RequestHandler,
};

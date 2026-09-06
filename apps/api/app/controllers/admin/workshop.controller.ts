import type { RequestHandler } from "express";
import { WorkshopStatus } from "@car-garage/shared";
import { routeParam } from "../../helpers/request.js";
import {
  addMemberSchema,
  createWorkshopSchema,
  listWorkshopsQuerySchema,
  updateMemberSchema,
  updateWorkshopSchema,
} from "../../dto/workshop.dto.js";
import { workshopService } from "../../services/workshop.service.js";

export const workshopController = {
  list: ((req, res, next) => {
    const query = listWorkshopsQuerySchema.parse(req.query);
    workshopService.list(query).then((result) => res.json(result)).catch(next);
  }) satisfies RequestHandler,

  get: ((req, res, next) => {
    workshopService
      .getById(routeParam(req, "id"))
      .then((workshop) => res.json(workshop))
      .catch(next);
  }) satisfies RequestHandler,

  create: ((req, res, next) => {
    const input = createWorkshopSchema.parse(req.body);
    workshopService
      .create(input)
      .then((workshop) => res.status(201).json(workshop))
      .catch(next);
  }) satisfies RequestHandler,

  update: ((req, res, next) => {
    const input = updateWorkshopSchema.parse(req.body);
    workshopService
      .update(routeParam(req, "id"), input)
      .then((workshop) => res.json(workshop))
      .catch(next);
  }) satisfies RequestHandler,

  activate: ((req, res, next) => {
    workshopService
      .setStatus(routeParam(req, "id"), WorkshopStatus.ACTIVE)
      .then((workshop) => res.json(workshop))
      .catch(next);
  }) satisfies RequestHandler,

  deactivate: ((req, res, next) => {
    workshopService
      .setStatus(routeParam(req, "id"), WorkshopStatus.SUSPENDED)
      .then((workshop) => res.json(workshop))
      .catch(next);
  }) satisfies RequestHandler,

  remove: ((req, res, next) => {
    workshopService
      .remove(routeParam(req, "id"))
      .then(() => res.status(204).end())
      .catch(next);
  }) satisfies RequestHandler,

  listMembers: ((req, res, next) => {
    workshopService
      .listMembers(routeParam(req, "id"))
      .then((members) => res.json({ items: members }))
      .catch(next);
  }) satisfies RequestHandler,

  addMember: ((req, res, next) => {
    const input = addMemberSchema.parse(req.body);
    workshopService
      .addMember(routeParam(req, "id"), input)
      .then((member) => res.status(201).json(member))
      .catch(next);
  }) satisfies RequestHandler,

  updateMember: ((req, res, next) => {
    const input = updateMemberSchema.parse(req.body);
    workshopService
      .updateMember(routeParam(req, "id"), routeParam(req, "memberId"), input)
      .then((member) => res.json(member))
      .catch(next);
  }) satisfies RequestHandler,

  removeMember: ((req, res, next) => {
    workshopService
      .removeMember(routeParam(req, "id"), routeParam(req, "memberId"))
      .then(() => res.status(204).end())
      .catch(next);
  }) satisfies RequestHandler,
};

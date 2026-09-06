import type { RequestHandler } from "express";
import { routeParam } from "../../helpers/request.js";
import {
  listCustomersQuerySchema,
  updateCustomerSchema,
} from "../../dto/customer.dto.js";
import { customerService } from "../../services/admin/customer.service.js";

export const adminCustomerController = {
  list: ((req, res, next) => {
    const query = listCustomersQuerySchema.parse(req.query);
    customerService.list(query).then((result) => res.json(result)).catch(next);
  }) satisfies RequestHandler,

  get: ((req, res, next) => {
    customerService
      .getById(routeParam(req, "id"))
      .then((customer) => res.json(customer))
      .catch(next);
  }) satisfies RequestHandler,

  update: ((req, res, next) => {
    const input = updateCustomerSchema.parse(req.body);
    customerService
      .update(routeParam(req, "id"), input)
      .then((customer) => res.json(customer))
      .catch(next);
  }) satisfies RequestHandler,

  block: ((req, res, next) => {
    customerService
      .setActive(routeParam(req, "id"), false)
      .then((customer) => res.json(customer))
      .catch(next);
  }) satisfies RequestHandler,

  unblock: ((req, res, next) => {
    customerService
      .setActive(routeParam(req, "id"), true)
      .then((customer) => res.json(customer))
      .catch(next);
  }) satisfies RequestHandler,

  remove: ((req, res, next) => {
    customerService
      .remove(routeParam(req, "id"))
      .then(() => res.status(204).end())
      .catch(next);
  }) satisfies RequestHandler,
};

import type { RequestHandler } from "express";
import { HttpError } from "../../helpers/http-error.js";
import { routeParam } from "../../helpers/request.js";
import {
  listRepairOrdersQuerySchema,
  rejectQuoteSchema,
} from "../../dto/repair-order.dto.js";
import { repairOrderService } from "../../services/repair-order.service.js";

function customerId(req: Parameters<RequestHandler>[0]): string {
  if (!req.auth) throw HttpError.unauthorized();
  return req.auth.sub;
}

export const customerRepairOrderController = {
  list: ((req, res, next) => {
    const query = listRepairOrdersQuerySchema.parse(req.query);
    repairOrderService
      .listForCustomer(customerId(req), query)
      .then((result) => res.json(result))
      .catch(next);
  }) satisfies RequestHandler,

  get: ((req, res, next) => {
    repairOrderService
      .getForCustomer(customerId(req), routeParam(req, "orderId"))
      .then((order) => res.json(order))
      .catch(next);
  }) satisfies RequestHandler,

  approve: ((req, res, next) => {
    repairOrderService
      .approveQuote(customerId(req), routeParam(req, "orderId"))
      .then((order) => res.json(order))
      .catch(next);
  }) satisfies RequestHandler,

  reject: ((req, res, next) => {
    const { reason } = rejectQuoteSchema.parse(req.body ?? {});
    repairOrderService
      .rejectQuote(customerId(req), routeParam(req, "orderId"), reason)
      .then((order) => res.json(order))
      .catch(next);
  }) satisfies RequestHandler,
};

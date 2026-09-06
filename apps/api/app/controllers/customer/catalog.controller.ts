import type { RequestHandler } from "express";
import { routeParam } from "../../helpers/request.js";
import { carCatalogService } from "../../services/car-catalog.service.js";

/**
 * Read-only car catalogue for the customer portal (brand + model pickers used
 * when booking an appointment). Mounted under /api/customer.
 */
export const customerCatalogController = {
  listBrands: ((_req, res, next) => {
    carCatalogService
      .publicBrands()
      .then((items) => res.json({ items }))
      .catch(next);
  }) satisfies RequestHandler,

  listModels: ((req, res, next) => {
    carCatalogService
      .publicModels(routeParam(req, "brandId"))
      .then((items) => res.json({ items }))
      .catch(next);
  }) satisfies RequestHandler,
};

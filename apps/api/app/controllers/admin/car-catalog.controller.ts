import type { RequestHandler } from "express";
import { HttpError } from "../../helpers/http-error.js";
import { routeParam } from "../../helpers/request.js";
import {
  createBrandSchema,
  createModelSchema,
  listQuerySchema,
  updateBrandSchema,
  updateModelSchema,
} from "../../dto/car-catalog.dto.js";
import { carCatalogService } from "../../services/car-catalog.service.js";

export const carCatalogController = {
  listBrands: ((req, res, next) => {
    const query = listQuerySchema.parse(req.query);
    carCatalogService
      .listBrands(query)
      .then((result) => res.json(result))
      .catch(next);
  }) satisfies RequestHandler,

  getBrand: ((req, res, next) => {
    carCatalogService
      .getBrand(routeParam(req, "brandId"))
      .then((brand) => res.json(brand))
      .catch(next);
  }) satisfies RequestHandler,

  createBrand: ((req, res, next) => {
    const input = createBrandSchema.parse(req.body);
    carCatalogService
      .createBrand(input)
      .then((brand) => res.status(201).json(brand))
      .catch(next);
  }) satisfies RequestHandler,

  updateBrand: ((req, res, next) => {
    const input = updateBrandSchema.parse(req.body);
    carCatalogService
      .updateBrand(routeParam(req, "brandId"), input)
      .then((brand) => res.json(brand))
      .catch(next);
  }) satisfies RequestHandler,

  removeBrand: ((req, res, next) => {
    carCatalogService
      .removeBrand(routeParam(req, "brandId"))
      .then(() => res.status(204).end())
      .catch(next);
  }) satisfies RequestHandler,

  setBrandLogo: ((req, res, next) => {
    if (!req.file) {
      next(HttpError.badRequest("Expected a file in the 'logo' field"));
      return;
    }
    carCatalogService
      .setBrandLogo(routeParam(req, "brandId"), {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
      })
      .then((brand) => res.json(brand))
      .catch(next);
  }) satisfies RequestHandler,

  removeBrandLogo: ((req, res, next) => {
    carCatalogService
      .removeBrandLogo(routeParam(req, "brandId"))
      .then((brand) => res.json(brand))
      .catch(next);
  }) satisfies RequestHandler,

  listModels: ((req, res, next) => {
    const query = listQuerySchema.parse(req.query);
    carCatalogService
      .listModels(routeParam(req, "brandId"), query)
      .then((result) => res.json(result))
      .catch(next);
  }) satisfies RequestHandler,

  getModel: ((req, res, next) => {
    carCatalogService
      .getModel(routeParam(req, "brandId"), routeParam(req, "modelId"))
      .then((model) => res.json(model))
      .catch(next);
  }) satisfies RequestHandler,

  createModel: ((req, res, next) => {
    const input = createModelSchema.parse(req.body);
    carCatalogService
      .createModel(routeParam(req, "brandId"), input)
      .then((model) => res.status(201).json(model))
      .catch(next);
  }) satisfies RequestHandler,

  updateModel: ((req, res, next) => {
    const input = updateModelSchema.parse(req.body);
    carCatalogService
      .updateModel(
        routeParam(req, "brandId"),
        routeParam(req, "modelId"),
        input,
      )
      .then((model) => res.json(model))
      .catch(next);
  }) satisfies RequestHandler,

  removeModel: ((req, res, next) => {
    carCatalogService
      .removeModel(routeParam(req, "brandId"), routeParam(req, "modelId"))
      .then(() => res.status(204).end())
      .catch(next);
  }) satisfies RequestHandler,
};

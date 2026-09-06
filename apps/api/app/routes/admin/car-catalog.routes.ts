import { Router } from "express";
import { carCatalogController } from "../../controllers/admin/car-catalog.controller.js";
import { requirePlatformAdmin } from "../../helpers/auth-middleware.js";
import { imageUpload } from "../../helpers/upload.js";

export const adminCarCatalogRouter: Router = Router();

adminCarCatalogRouter.use(requirePlatformAdmin);

adminCarCatalogRouter.get("/", carCatalogController.listBrands);
adminCarCatalogRouter.post("/", carCatalogController.createBrand);
adminCarCatalogRouter.get("/:brandId", carCatalogController.getBrand);
adminCarCatalogRouter.patch("/:brandId", carCatalogController.updateBrand);
adminCarCatalogRouter.delete("/:brandId", carCatalogController.removeBrand);

adminCarCatalogRouter.put(
  "/:brandId/logo",
  imageUpload.single("logo"),
  carCatalogController.setBrandLogo,
);
adminCarCatalogRouter.delete(
  "/:brandId/logo",
  carCatalogController.removeBrandLogo,
);

adminCarCatalogRouter.get("/:brandId/models", carCatalogController.listModels);
adminCarCatalogRouter.post("/:brandId/models", carCatalogController.createModel);
adminCarCatalogRouter.get(
  "/:brandId/models/:modelId",
  carCatalogController.getModel,
);
adminCarCatalogRouter.patch(
  "/:brandId/models/:modelId",
  carCatalogController.updateModel,
);
adminCarCatalogRouter.delete(
  "/:brandId/models/:modelId",
  carCatalogController.removeModel,
);

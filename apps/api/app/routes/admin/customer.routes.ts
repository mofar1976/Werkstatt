import { Router } from "express";
import { adminCustomerController } from "../../controllers/admin/customer.controller.js";
import { requirePlatformAdmin } from "../../helpers/auth-middleware.js";


export const adminCustomerRouter: Router = Router();

adminCustomerRouter.use(requirePlatformAdmin);

adminCustomerRouter.get("/", adminCustomerController.list);
adminCustomerRouter.get("/:id", adminCustomerController.get);
adminCustomerRouter.patch("/:id", adminCustomerController.update);
adminCustomerRouter.post("/:id/block", adminCustomerController.block);
adminCustomerRouter.post("/:id/unblock", adminCustomerController.unblock);
adminCustomerRouter.delete("/:id", adminCustomerController.remove);

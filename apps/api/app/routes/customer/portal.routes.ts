import { Router } from "express";
import { AuthAudience } from "@car-garage/shared";
import { customerBrowseController } from "../../controllers/customer/browse.controller.js";
import { customerCatalogController } from "../../controllers/customer/catalog.controller.js";
import { customerRepairOrderController } from "../../controllers/customer/repair-order.controller.js";
import { requireAuth } from "../../helpers/auth-middleware.js";


export const customerRouter: Router = Router();

customerRouter.use(requireAuth(AuthAudience.CUSTOMER));

customerRouter.get("/car-brands", customerCatalogController.listBrands);
customerRouter.get(
  "/car-brands/:brandId/models",
  customerCatalogController.listModels,
);

customerRouter.get("/workshops", customerBrowseController.listWorkshops);
customerRouter.get("/workshops/:workshopId", customerBrowseController.getWorkshop);
customerRouter.get(
  "/workshops/:workshopId/slots",
  customerBrowseController.listSlots,
);
customerRouter.post(
  "/workshops/:workshopId/appointments",
  customerBrowseController.bookAppointment,
);

customerRouter.get("/appointments", customerBrowseController.listAppointments);
customerRouter.get(
  "/appointments/:appointmentId",
  customerBrowseController.getAppointment,
);
customerRouter.post(
  "/appointments/:appointmentId/cancel",
  customerBrowseController.cancelAppointment,
);

customerRouter.get("/repair-orders", customerRepairOrderController.list);
customerRouter.get(
  "/repair-orders/:orderId",
  customerRepairOrderController.get,
);
customerRouter.post(
  "/repair-orders/:orderId/approve",
  customerRepairOrderController.approve,
);
customerRouter.post(
  "/repair-orders/:orderId/reject",
  customerRepairOrderController.reject,
);

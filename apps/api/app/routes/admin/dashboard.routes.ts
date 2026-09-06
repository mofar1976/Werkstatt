import { Router } from "express";
import { adminDashboardController } from "../../controllers/admin/dashboard.controller.js";
import { requirePlatformAdmin } from "../../helpers/auth-middleware.js";

export const adminDashboardRouter: Router = Router();

adminDashboardRouter.use(requirePlatformAdmin);

adminDashboardRouter.get("/overview", adminDashboardController.overview);
adminDashboardRouter.get(
  "/appointments",
  adminDashboardController.listAppointments,
);
adminDashboardRouter.get(
  "/repair-orders",
  adminDashboardController.listRepairOrders,
);

import { Router } from "express";
import { adminCarCatalogRouter } from "./admin/car-catalog.routes.js";
import { adminCustomerRouter } from "./admin/customer.routes.js";
import { adminDashboardRouter } from "./admin/dashboard.routes.js";
import { adminWorkshopRouter } from "./admin/workshop.routes.js";
import { authRouter } from "./auth.routes.js";
import { customerRouter } from "./customer/portal.routes.js";
import { healthRouter } from "./health.routes.js";
import { workshopPortalRouter } from "./workshop/portal.routes.js";

export const apiRouter: Router = Router();

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/admin/workshops", adminWorkshopRouter);
apiRouter.use("/admin/car-brands", adminCarCatalogRouter);
apiRouter.use("/admin/customers", adminCustomerRouter);
apiRouter.use("/admin", adminDashboardRouter);
apiRouter.use("/workshop", workshopPortalRouter);
apiRouter.use("/customer", customerRouter);

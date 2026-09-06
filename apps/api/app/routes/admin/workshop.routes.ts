import { Router } from "express";
import { workshopController } from "../../controllers/admin/workshop.controller.js";
import { requirePlatformAdmin } from "../../helpers/auth-middleware.js";

export const adminWorkshopRouter: Router = Router();

adminWorkshopRouter.use(requirePlatformAdmin);

adminWorkshopRouter.get("/", workshopController.list);
adminWorkshopRouter.post("/", workshopController.create);
adminWorkshopRouter.get("/:id", workshopController.get);
adminWorkshopRouter.patch("/:id", workshopController.update);
adminWorkshopRouter.delete("/:id", workshopController.remove);
adminWorkshopRouter.post("/:id/activate", workshopController.activate);
adminWorkshopRouter.post("/:id/deactivate", workshopController.deactivate);

adminWorkshopRouter.get("/:id/members", workshopController.listMembers);
adminWorkshopRouter.post("/:id/members", workshopController.addMember);
adminWorkshopRouter.patch("/:id/members/:memberId", workshopController.updateMember);
adminWorkshopRouter.delete(
  "/:id/members/:memberId",
  workshopController.removeMember,
);

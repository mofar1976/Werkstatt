import { Router } from "express";
import { AuthAudience } from "@car-garage/shared";
import { workshopAppointmentController } from "../../controllers/workshop/appointment.controller.js";
import { workshopPortalController } from "../../controllers/workshop/portal.controller.js";
import { workshopRepairOrderController } from "../../controllers/workshop/repair-order.controller.js";
import { workshopSlotController } from "../../controllers/workshop/slot.controller.js";
import { requireAuth } from "../../helpers/auth-middleware.js";
import {
  loadWorkshopMembership,
  requireWorkshopChef,
} from "../../helpers/workshop-context.js";


export const workshopPortalRouter: Router = Router();

workshopPortalRouter.use(
  requireAuth(AuthAudience.WORKSHOP),
  loadWorkshopMembership,
);

workshopPortalRouter.get("/my-workshop", workshopPortalController.getMyWorkshop);
workshopPortalRouter.patch(
  "/my-workshop",
  requireWorkshopChef,
  workshopPortalController.updateMyWorkshop,
);
workshopPortalRouter.get(
  "/my-workshop/members",
  workshopPortalController.listMembers,
);
workshopPortalRouter.post(
  "/my-workshop/members",
  requireWorkshopChef,
  workshopPortalController.addMember,
);
workshopPortalRouter.patch(
  "/my-workshop/members/:memberId",
  requireWorkshopChef,
  workshopPortalController.updateMember,
);
workshopPortalRouter.delete(
  "/my-workshop/members/:memberId",
  requireWorkshopChef,
  workshopPortalController.removeMember,
);

workshopPortalRouter.get("/my-workshop/slots", workshopSlotController.list);
workshopPortalRouter.post("/my-workshop/slots", workshopSlotController.create);
workshopPortalRouter.patch(
  "/my-workshop/slots/:slotId",
  workshopSlotController.setStatus,
);
workshopPortalRouter.delete(
  "/my-workshop/slots/:slotId",
  workshopSlotController.remove,
);

workshopPortalRouter.get(
  "/my-workshop/appointments",
  workshopAppointmentController.list,
);
workshopPortalRouter.get(
  "/my-workshop/appointments/:appointmentId",
  workshopAppointmentController.get,
);
workshopPortalRouter.post(
  "/my-workshop/appointments/:appointmentId/cancel",
  workshopAppointmentController.cancel,
);
workshopPortalRouter.post(
  "/my-workshop/appointments/:appointmentId/complete",
  workshopAppointmentController.complete,
);

workshopPortalRouter.get(
  "/my-workshop/repair-orders",
  workshopRepairOrderController.list,
);
workshopPortalRouter.post(
  "/my-workshop/repair-orders",
  workshopRepairOrderController.create,
);
workshopPortalRouter.get(
  "/my-workshop/repair-orders/candidates",
  workshopRepairOrderController.candidates,
);
workshopPortalRouter.get(
  "/my-workshop/repair-orders/:orderId",
  workshopRepairOrderController.get,
);
workshopPortalRouter.patch(
  "/my-workshop/repair-orders/:orderId/diagnosis",
  workshopRepairOrderController.saveDiagnosis,
);
workshopPortalRouter.put(
  "/my-workshop/repair-orders/:orderId/assignees",
  workshopRepairOrderController.setAssignees,
);
workshopPortalRouter.post(
  "/my-workshop/repair-orders/:orderId/send-quote",
  workshopRepairOrderController.sendQuote,
);
workshopPortalRouter.post(
  "/my-workshop/repair-orders/:orderId/status",
  workshopRepairOrderController.advanceStatus,
);
workshopPortalRouter.post(
  "/my-workshop/repair-orders/:orderId/notes",
  workshopRepairOrderController.addNote,
);
workshopPortalRouter.post(
  "/my-workshop/repair-orders/:orderId/cancel",
  workshopRepairOrderController.cancel,
);

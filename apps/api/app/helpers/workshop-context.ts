import type { RequestHandler } from "express";
import { WorkshopRole } from "@car-garage/shared";
import { HttpError } from "./http-error.js";
import { WorkshopMember } from "../models/workshop-member.model.js";

/**
 * Resolve which workshop the authenticated workshop-portal user belongs to and
 * put `{ id, role }` on `req.workshop`. Assumes one live membership per user.
 */
export const loadWorkshopMembership: RequestHandler = (req, _res, next) => {
  const userId = req.auth?.sub;
  if (!userId) {
    next(HttpError.unauthorized());
    return;
  }
  WorkshopMember.findOne({ user: userId, deleted: false })
    .sort({ createdAt: 1 })
    .then((membership) => {
      if (!membership) {
        next(HttpError.forbidden("You are not assigned to a workshop"));
        return;
      }
      req.workshop = {
        id: String(membership.workshop),
        membershipId: membership.id,
        role: membership.role,
      };
      next();
    })
    .catch(next);
};

/** Require the workshop-portal user to be the Chef of their workshop. */
export const requireWorkshopChef: RequestHandler = (req, _res, next) => {
  if (req.workshop?.role !== WorkshopRole.CHEF) {
    next(HttpError.forbidden("Requires the Chef role"));
    return;
  }
  next();
};

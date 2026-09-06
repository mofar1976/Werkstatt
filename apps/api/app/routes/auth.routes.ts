import { Router } from "express";
import { AuthAudience, UserRole } from "@car-garage/shared";
import { makeAuthController } from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../helpers/auth-middleware.js";

function audienceRouter(
  audience: AuthAudience,
  options: { publicRegister: boolean },
): Router {
  const router = Router();
  const controller = makeAuthController(audience);

  if (options.publicRegister) {
    router.post("/register", controller.register);
  } else {
    router.post(
      "/register",
      requireAuth(AuthAudience.ADMIN),
      requireRole(UserRole.PLATFORM_ADMIN),
      controller.register,
    );
  }

  router.post("/login", controller.login);
  router.post("/refresh", controller.refresh);
  router.post("/logout", controller.logout);
  router.get("/me", requireAuth(audience), controller.me);

  return router;
}

export const authRouter: Router = Router();
authRouter.use(
  "/admin",
  audienceRouter(AuthAudience.ADMIN, { publicRegister: false }),
);
authRouter.use(
  "/workshop",
  audienceRouter(AuthAudience.WORKSHOP, { publicRegister: false }),
);
authRouter.use(
  "/customer",
  audienceRouter(AuthAudience.CUSTOMER, { publicRegister: true }),
);

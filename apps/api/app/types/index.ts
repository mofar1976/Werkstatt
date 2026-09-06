import type { AccessTokenClaims, WorkshopRole } from "@car-garage/shared";

/**
 * TypeScript types local to the API. Cross-app contracts live in
 * `@car-garage/shared`.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by requireAuth() once a valid access token is verified. */
      auth?: AccessTokenClaims;
      /** Set by loadWorkshopMembership() on workshop-portal routes. */
      workshop?: { id: string; membershipId: string; role: WorkshopRole };
    }
  }
}

export {};

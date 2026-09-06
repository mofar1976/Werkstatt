import type { AdminOverview } from "@car-garage/shared";

export const DASHBOARD_FEATURE_KEY = "dashboard";

export interface DashboardState {
  overview: AdminOverview | null;
  loading: boolean;
  error: string | null;
}

export const initialDashboardState: DashboardState = {
  overview: null,
  loading: false,
  error: null,
};

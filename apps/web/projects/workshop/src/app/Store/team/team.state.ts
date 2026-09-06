import type { WorkshopMember, WorkshopRole } from "@car-garage/shared";

export const TEAM_FEATURE_KEY = "team";

export interface AddMemberInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  role: WorkshopRole;
}

export interface UpdateMemberInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: WorkshopRole;
}

export interface TeamState {
  members: WorkshopMember[];
  loading: boolean;
  error: string | null;
  saving: boolean;
}

export const initialTeamState: TeamState = {
  members: [],
  loading: false,
  error: null,
  saving: false,
};

import type {
  Workshop,
  WorkshopMember,
  WorkshopRole,
  WorkshopStatus,
} from "@car-garage/shared";

export const WORKSHOPS_FEATURE_KEY = "workshops";

export interface WorkshopsQuery {
  search: string;
  status: WorkshopStatus | "";
  page: number;
  pageSize: number;
}

export interface WorkshopInput {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  location?: { lat: number; lng: number };
}

export interface AddMemberInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  role: WorkshopRole;
}

export interface WorkshopsState {
  // list
  items: Workshop[];
  total: number;
  query: WorkshopsQuery;
  loading: boolean;
  error: string | null;
  // detail
  selected: Workshop | null;
  members: WorkshopMember[];
  detailLoading: boolean;
  saving: boolean;
  detailError: string | null;
}

export const initialWorkshopsState: WorkshopsState = {
  items: [],
  total: 0,
  query: { search: "", status: "", page: 1, pageSize: 20 },
  loading: false,
  error: null,
  selected: null,
  members: [],
  detailLoading: false,
  saving: false,
  detailError: null,
};

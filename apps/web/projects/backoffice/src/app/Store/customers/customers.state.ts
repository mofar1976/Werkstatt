import type { AdminCustomer } from "@car-garage/shared";

export const CUSTOMERS_FEATURE_KEY = "customers";

export type CustomerStatusFilter = "" | "active" | "blocked";

export interface CustomersQuery {
  search: string;
  status: CustomerStatusFilter;
  page: number;
  pageSize: number;
}

export interface CustomerInput {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface CustomersState {
  // list
  items: AdminCustomer[];
  total: number;
  query: CustomersQuery;
  loading: boolean;
  error: string | null;
  // detail
  selected: AdminCustomer | null;
  detailLoading: boolean;
  saving: boolean;
  detailError: string | null;
}

export const initialCustomersState: CustomersState = {
  items: [],
  total: 0,
  query: { search: "", status: "", page: 1, pageSize: 20 },
  loading: false,
  error: null,
  selected: null,
  detailLoading: false,
  saving: false,
  detailError: null,
};

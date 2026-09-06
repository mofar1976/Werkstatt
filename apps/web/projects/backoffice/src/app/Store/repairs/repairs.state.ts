import type { RepairOrder, RepairOrderStatus } from "@car-garage/shared";

export const REPAIRS_FEATURE_KEY = "repairs";

export type RepairStatusFilter = "" | RepairOrderStatus;

export interface RepairsQuery {
  status: RepairStatusFilter;
  page: number;
  pageSize: number;
}

export interface RepairsState {
  items: RepairOrder[];
  total: number;
  query: RepairsQuery;
  loading: boolean;
  error: string | null;
}

export const initialRepairsState: RepairsState = {
  items: [],
  total: 0,
  query: { status: "", page: 1, pageSize: 20 },
  loading: false,
  error: null,
};

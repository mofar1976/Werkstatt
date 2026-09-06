import type {
  RepairOrder,
  RepairOrderDetail,
  RepairOrderStatus,
} from "@car-garage/shared";

export const REPAIRS_FEATURE_KEY = "repairs";

export type RepairStatusFilter = "" | RepairOrderStatus;

export interface RepairsQuery {
  status: RepairStatusFilter;
  page: number;
  pageSize: number;
}

export interface RepairsState {
  // list
  items: RepairOrder[];
  total: number;
  query: RepairsQuery;
  loading: boolean;
  error: string | null;
  // detail
  selected: RepairOrderDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  saving: boolean;
}

export const initialRepairsState: RepairsState = {
  items: [],
  total: 0,
  query: { status: "", page: 1, pageSize: 10 },
  loading: false,
  error: null,
  selected: null,
  detailLoading: false,
  detailError: null,
  saving: false,
};

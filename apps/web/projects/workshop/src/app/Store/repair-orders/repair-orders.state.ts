import type {
  Appointment,
  LineItemKind,
  PartAction,
  RepairAssignee,
  RepairOrder,
  RepairOrderDetail,
  RepairOrderStatus,
} from "@car-garage/shared";

export const REPAIR_ORDERS_FEATURE_KEY = "repairOrders";

export type RepairStatusFilter = "" | RepairOrderStatus;

export interface RepairOrdersQuery {
  status: RepairStatusFilter;
  page: number;
  pageSize: number;
}

export interface LineItemInput {
  kind: LineItemKind;
  partAction?: PartAction;
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface DiagnosisInput {
  cause?: string;
  quote?: {
    lineItems: LineItemInput[];
    notes?: string;
    taxRatePercent: number;
  };
}

export interface RepairOrdersState {
  // list
  items: RepairOrder[];
  total: number;
  query: RepairOrdersQuery;
  loading: boolean;
  error: string | null;
  // detail
  selected: RepairOrderDetail | null;
  detailLoading: boolean;
  saving: boolean;
  detailError: string | null;
  // team members for the assignee picker
  teamMembers: RepairAssignee[];
  // appointments eligible for a new repair order
  candidates: Appointment[];
  candidatesLoading: boolean;
}

export const initialRepairOrdersState: RepairOrdersState = {
  items: [],
  total: 0,
  query: { status: "", page: 1, pageSize: 20 },
  loading: false,
  error: null,
  selected: null,
  detailLoading: false,
  saving: false,
  detailError: null,
  teamMembers: [],
  candidates: [],
  candidatesLoading: false,
};

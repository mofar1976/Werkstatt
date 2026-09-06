import type { PublicWorkshop } from "@car-garage/shared";

export const WORKSHOPS_FEATURE_KEY = "workshops";

export interface WorkshopsQuery {
  search: string;
  /** `{ lat, lng }` when the customer searched around a point. */
  near: { lat: number; lng: number } | null;
  radiusKm: number;
}

export interface WorkshopsState {
  // list / map
  items: PublicWorkshop[];
  query: WorkshopsQuery;
  loading: boolean;
  error: string | null;
  /** Workshop highlighted on the map / in the list. */
  focusedId: string | null;
  // detail
  selected: PublicWorkshop | null;
  detailLoading: boolean;
  detailError: string | null;
}

export const initialWorkshopsState: WorkshopsState = {
  items: [],
  query: { search: "", near: null, radiusKm: 25 },
  loading: false,
  error: null,
  focusedId: null,
  selected: null,
  detailLoading: false,
  detailError: null,
};

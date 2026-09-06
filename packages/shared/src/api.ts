/** Small cross-cutting API contract types. Expanded per feature step. */

export interface HealthResponse {
  status: "ok";
  service: string;
  timestamp: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

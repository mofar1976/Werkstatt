import type { CarBrand, CarModel } from "@car-garage/shared";

export const CAR_CATALOG_FEATURE_KEY = "carCatalog";

export interface CarCatalogState {
  // brand list
  brands: CarBrand[];
  total: number;
  query: { search: string; page: number; pageSize: number };
  loading: boolean;
  error: string | null;
  // brand detail
  selectedBrand: CarBrand | null;
  models: CarModel[];
  detailLoading: boolean;
  saving: boolean;
  detailError: string | null;
}

export const initialCarCatalogState: CarCatalogState = {
  brands: [],
  total: 0,
  query: { search: "", page: 1, pageSize: 20 },
  loading: false,
  error: null,
  selectedBrand: null,
  models: [],
  detailLoading: false,
  saving: false,
  detailError: null,
};

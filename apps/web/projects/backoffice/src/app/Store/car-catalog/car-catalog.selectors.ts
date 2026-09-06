import { createFeatureSelector, createSelector } from "@ngrx/store";
import {
  CAR_CATALOG_FEATURE_KEY,
  type CarCatalogState,
} from "./car-catalog.state";

const selectState =
  createFeatureSelector<CarCatalogState>(CAR_CATALOG_FEATURE_KEY);

export const selectBrands = createSelector(selectState, (s) => s.brands);
export const selectBrandTotal = createSelector(selectState, (s) => s.total);
export const selectBrandQuery = createSelector(selectState, (s) => s.query);
export const selectBrandsLoading = createSelector(selectState, (s) => s.loading);
export const selectBrandsError = createSelector(selectState, (s) => s.error);

export const selectSelectedBrand = createSelector(
  selectState,
  (s) => s.selectedBrand,
);
export const selectBrandModels = createSelector(selectState, (s) => s.models);
export const selectBrandDetailLoading = createSelector(
  selectState,
  (s) => s.detailLoading,
);
export const selectBrandSaving = createSelector(selectState, (s) => s.saving);
export const selectBrandDetailError = createSelector(
  selectState,
  (s) => s.detailError,
);

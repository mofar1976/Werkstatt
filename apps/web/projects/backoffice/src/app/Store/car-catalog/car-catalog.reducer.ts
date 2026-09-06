import { createReducer, on } from "@ngrx/store";
import { CarCatalogActions } from "./car-catalog.actions";
import { initialCarCatalogState } from "./car-catalog.state";

export const carCatalogReducer = createReducer(
  initialCarCatalogState,

  // --- list ---
  on(CarCatalogActions.searchChanged, (state, { search }) => ({
    ...state,
    query: { ...state.query, search, page: 1 },
  })),
  on(CarCatalogActions.pageChanged, (state, { page }) => ({
    ...state,
    query: { ...state.query, page },
  })),
  on(CarCatalogActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(CarCatalogActions.loadSuccess, (state, { items, total }) => ({
    ...state,
    brands: items,
    total,
    loading: false,
  })),
  on(CarCatalogActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- detail ---
  on(CarCatalogActions.loadBrand, (state) => ({
    ...state,
    detailLoading: true,
    detailError: null,
    selectedBrand: null,
    models: [],
  })),
  on(CarCatalogActions.loadBrandSuccess, (state, { brand, models }) => ({
    ...state,
    selectedBrand: brand,
    models,
    detailLoading: false,
  })),
  on(CarCatalogActions.loadBrandFailure, (state, { error }) => ({
    ...state,
    detailLoading: false,
    detailError: error,
  })),
  on(CarCatalogActions.leaveBrand, (state) => ({
    ...state,
    selectedBrand: null,
    models: [],
    detailError: null,
    saving: false,
  })),

  // --- mutations ---
  on(
    CarCatalogActions.createBrand,
    CarCatalogActions.updateBrand,
    CarCatalogActions.deleteBrand,
    CarCatalogActions.uploadLogo,
    CarCatalogActions.removeLogo,
    CarCatalogActions.createModel,
    CarCatalogActions.updateModel,
    CarCatalogActions.deleteModel,
    (state) => ({ ...state, saving: true, detailError: null }),
  ),
  on(CarCatalogActions.brandSaved, (state, { brand }) => ({
    ...state,
    selectedBrand: brand,
    saving: false,
    brands: state.brands.map((b) => (b.id === brand.id ? brand : b)),
  })),
  on(
    CarCatalogActions.brandSaveFailure,
    CarCatalogActions.modelSaveFailure,
    (state, { error }) => ({ ...state, saving: false, detailError: error }),
  ),
  on(CarCatalogActions.brandDeleted, (state) => ({ ...state, saving: false })),
  on(CarCatalogActions.modelsChanged, (state, { models }) => ({
    ...state,
    models,
    saving: false,
  })),
);

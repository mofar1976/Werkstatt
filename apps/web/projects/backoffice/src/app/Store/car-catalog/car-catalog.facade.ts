import { Injectable, computed, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { CarCatalogActions } from "./car-catalog.actions";
import {
  selectBrandDetailError,
  selectBrandDetailLoading,
  selectBrandModels,
  selectBrandQuery,
  selectBrandSaving,
  selectBrandTotal,
  selectBrands,
  selectBrandsError,
  selectBrandsLoading,
  selectSelectedBrand,
} from "./car-catalog.selectors";

@Injectable({ providedIn: "root" })
export class CarCatalogFacade {
  private readonly store = inject(Store);

  // list
  readonly brands = this.store.selectSignal(selectBrands);
  readonly total = this.store.selectSignal(selectBrandTotal);
  readonly query = this.store.selectSignal(selectBrandQuery);
  readonly loading = this.store.selectSignal(selectBrandsLoading);
  readonly error = this.store.selectSignal(selectBrandsError);
  readonly page = computed(() => this.query().page);
  readonly pageSize = computed(() => this.query().pageSize);

  // detail
  readonly selected = this.store.selectSignal(selectSelectedBrand);
  readonly models = this.store.selectSignal(selectBrandModels);
  readonly detailLoading = this.store.selectSignal(selectBrandDetailLoading);
  readonly saving = this.store.selectSignal(selectBrandSaving);
  readonly detailError = this.store.selectSignal(selectBrandDetailError);

  open(): void {
    this.store.dispatch(CarCatalogActions.opened());
  }
  setSearch(search: string): void {
    this.store.dispatch(CarCatalogActions.searchChanged({ search }));
  }
  setPage(page: number): void {
    this.store.dispatch(CarCatalogActions.pageChanged({ page }));
  }

  loadBrand(id: string): void {
    this.store.dispatch(CarCatalogActions.loadBrand({ id }));
  }
  leaveBrand(): void {
    this.store.dispatch(CarCatalogActions.leaveBrand());
  }

  createBrand(name: string): void {
    this.store.dispatch(CarCatalogActions.createBrand({ name }));
  }
  updateBrand(id: string, name: string): void {
    this.store.dispatch(CarCatalogActions.updateBrand({ id, name }));
  }
  deleteBrand(id: string): void {
    this.store.dispatch(CarCatalogActions.deleteBrand({ id }));
  }

  uploadLogo(brandId: string, file: File): void {
    this.store.dispatch(CarCatalogActions.uploadLogo({ brandId, file }));
  }
  removeLogo(brandId: string): void {
    this.store.dispatch(CarCatalogActions.removeLogo({ brandId }));
  }

  createModel(brandId: string, name: string): void {
    this.store.dispatch(CarCatalogActions.createModel({ brandId, name }));
  }
  updateModel(brandId: string, modelId: string, name: string): void {
    this.store.dispatch(
      CarCatalogActions.updateModel({ brandId, modelId, name }),
    );
  }
  deleteModel(brandId: string, modelId: string): void {
    this.store.dispatch(CarCatalogActions.deleteModel({ brandId, modelId }));
  }
}

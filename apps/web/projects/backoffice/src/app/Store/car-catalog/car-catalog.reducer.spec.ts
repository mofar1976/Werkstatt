import { CarCatalogActions } from "./car-catalog.actions";
import { carCatalogReducer } from "./car-catalog.reducer";
import { initialCarCatalogState } from "./car-catalog.state";

describe("carCatalogReducer", () => {
  it("sets search and resets to page 1", () => {
    const start = {
      ...initialCarCatalogState,
      query: { ...initialCarCatalogState.query, page: 4 },
    };
    const state = carCatalogReducer(
      start,
      CarCatalogActions.searchChanged({ search: "bmw" }),
    );
    expect(state.query.search).toBe("bmw");
    expect(state.query.page).toBe(1);
  });

  it("changes page without touching search", () => {
    const state = carCatalogReducer(
      initialCarCatalogState,
      CarCatalogActions.pageChanged({ page: 3 }),
    );
    expect(state.query.page).toBe(3);
    expect(state.query.search).toBe("");
  });

  it("stores the loaded page", () => {
    const state = carCatalogReducer(
      { ...initialCarCatalogState, loading: true },
      CarCatalogActions.loadSuccess({ items: [{ id: "b1" }] as never, total: 1 }),
    );
    expect(state.brands).toHaveLength(1);
    expect(state.total).toBe(1);
    expect(state.loading).toBe(false);
  });

  it("clears detail state while a brand loads", () => {
    const state = carCatalogReducer(
      {
        ...initialCarCatalogState,
        selectedBrand: { id: "old" } as never,
        models: [{ id: "m1" }] as never,
      },
      CarCatalogActions.loadBrand({ id: "b1" }),
    );
    expect(state.selectedBrand).toBeNull();
    expect(state.models).toEqual([]);
    expect(state.detailLoading).toBe(true);
  });

  it("updates the brand in the list when saved", () => {
    const state = carCatalogReducer(
      {
        ...initialCarCatalogState,
        saving: true,
        brands: [{ id: "b1", name: "Old" }] as never,
      },
      CarCatalogActions.brandSaved({
        brand: { id: "b1", name: "New" } as never,
      }),
    );
    expect(state.saving).toBe(false);
    expect(state.brands[0]?.name).toBe("New");
    expect(state.selectedBrand?.name).toBe("New");
  });

  it("keeps the detail error on model failure", () => {
    const state = carCatalogReducer(
      { ...initialCarCatalogState, saving: true },
      CarCatalogActions.modelSaveFailure({ error: "boom" }),
    );
    expect(state.detailError).toBe("boom");
    expect(state.saving).toBe(false);
  });
});

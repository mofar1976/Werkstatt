import { CustomersActions } from "./customers.actions";
import { customersReducer } from "./customers.reducer";
import { initialCustomersState } from "./customers.state";

describe("customersReducer", () => {
  it("sets search and resets to page 1", () => {
    const start = {
      ...initialCustomersState,
      query: { ...initialCustomersState.query, page: 3 },
    };
    const state = customersReducer(
      start,
      CustomersActions.searchChanged({ search: "carla" }),
    );
    expect(state.query.search).toBe("carla");
    expect(state.query.page).toBe(1);
  });

  it("sets the status filter and resets to page 1", () => {
    const start = {
      ...initialCustomersState,
      query: { ...initialCustomersState.query, page: 5 },
    };
    const state = customersReducer(
      start,
      CustomersActions.statusChanged({ status: "blocked" }),
    );
    expect(state.query.status).toBe("blocked");
    expect(state.query.page).toBe(1);
  });

  it("stores the loaded page", () => {
    const state = customersReducer(
      { ...initialCustomersState, loading: true },
      CustomersActions.loadSuccess({ items: [{ id: "c1" }] as never, total: 1 }),
    );
    expect(state.items).toHaveLength(1);
    expect(state.total).toBe(1);
    expect(state.loading).toBe(false);
  });

  it("clears the selection while a detail loads", () => {
    const state = customersReducer(
      { ...initialCustomersState, selected: { id: "old" } as never },
      CustomersActions.loadDetail({ id: "c1" }),
    );
    expect(state.selected).toBeNull();
    expect(state.detailLoading).toBe(true);
  });

  it("updates the customer in the list and selection on save", () => {
    const state = customersReducer(
      {
        ...initialCustomersState,
        saving: true,
        items: [{ id: "c1", isActive: true } as never],
      },
      CustomersActions.saveSuccess({
        customer: { id: "c1", isActive: false } as never,
      }),
    );
    expect(state.saving).toBe(false);
    expect(state.items[0]?.isActive).toBe(false);
    expect(state.selected?.isActive).toBe(false);
  });

  it("keeps the detail error on save failure", () => {
    const state = customersReducer(
      { ...initialCustomersState, saving: true },
      CustomersActions.saveFailure({ error: "boom" }),
    );
    expect(state.detailError).toBe("boom");
    expect(state.saving).toBe(false);
  });
});

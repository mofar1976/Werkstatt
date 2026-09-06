import { RepairsActions } from "./repairs.actions";
import { repairsReducer } from "./repairs.reducer";
import { initialRepairsState } from "./repairs.state";

describe("admin repairsReducer", () => {
  it("sets the status filter and resets to page 1", () => {
    const start = {
      ...initialRepairsState,
      query: { ...initialRepairsState.query, page: 4 },
    };
    const state = repairsReducer(
      start,
      RepairsActions.statusChanged({ status: "REPAIR_IN_PROGRESS" }),
    );
    expect(state.query.status).toBe("REPAIR_IN_PROGRESS");
    expect(state.query.page).toBe(1);
  });

  it("stores the loaded page", () => {
    const state = repairsReducer(
      { ...initialRepairsState, loading: true },
      RepairsActions.loadSuccess({ items: [{ id: "r1" }] as never, total: 1 }),
    );
    expect(state.items).toHaveLength(1);
    expect(state.total).toBe(1);
    expect(state.loading).toBe(false);
  });

  it("keeps the error on load failure", () => {
    const state = repairsReducer(
      { ...initialRepairsState, loading: true },
      RepairsActions.loadFailure({ error: "boom" }),
    );
    expect(state.error).toBe("boom");
    expect(state.loading).toBe(false);
  });
});

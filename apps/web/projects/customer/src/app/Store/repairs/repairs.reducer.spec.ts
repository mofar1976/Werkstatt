import { RepairsActions } from "./repairs.actions";
import { repairsReducer } from "./repairs.reducer";
import { initialRepairsState } from "./repairs.state";

describe("repairsReducer", () => {
  it("sets the status filter and resets to page 1", () => {
    const start = {
      ...initialRepairsState,
      query: { ...initialRepairsState.query, page: 3 },
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

  it("clears the selection while a detail loads", () => {
    const state = repairsReducer(
      { ...initialRepairsState, selected: { id: "old" } as never },
      RepairsActions.loadDetail({ id: "r1" }),
    );
    expect(state.selected).toBeNull();
    expect(state.detailLoading).toBe(true);
  });

  it("marks saving during a quote decision and applies the updated order", () => {
    const saving = repairsReducer(
      initialRepairsState,
      RepairsActions.approveQuote({ id: "r1" }),
    );
    expect(saving.saving).toBe(true);

    const saved = repairsReducer(
      {
        ...saving,
        items: [{ id: "r1", status: "QUOTE_PENDING_APPROVAL" } as never],
      },
      RepairsActions.decisionSuccess({
        order: { id: "r1", status: "QUOTE_APPROVED" } as never,
      }),
    );
    expect(saved.saving).toBe(false);
    expect(saved.selected?.status).toBe("QUOTE_APPROVED");
    expect(saved.items[0]?.status).toBe("QUOTE_APPROVED");
  });

  it("keeps the detail error on a failed decision", () => {
    const state = repairsReducer(
      { ...initialRepairsState, saving: true },
      RepairsActions.decisionFailure({ error: "boom" }),
    );
    expect(state.detailError).toBe("boom");
    expect(state.saving).toBe(false);
  });
});

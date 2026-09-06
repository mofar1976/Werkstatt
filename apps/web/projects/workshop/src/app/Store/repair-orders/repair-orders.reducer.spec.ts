import { RepairOrdersActions } from "./repair-orders.actions";
import { repairOrdersReducer } from "./repair-orders.reducer";
import { initialRepairOrdersState } from "./repair-orders.state";

describe("repairOrdersReducer", () => {
  it("sets the status filter and resets to page 1", () => {
    const start = {
      ...initialRepairOrdersState,
      query: { ...initialRepairOrdersState.query, page: 3 },
    };
    const state = repairOrdersReducer(
      start,
      RepairOrdersActions.statusChanged({ status: "REPAIR_IN_PROGRESS" }),
    );
    expect(state.query.status).toBe("REPAIR_IN_PROGRESS");
    expect(state.query.page).toBe(1);
  });

  it("stores the loaded page", () => {
    const state = repairOrdersReducer(
      { ...initialRepairOrdersState, loading: true },
      RepairOrdersActions.loadSuccess({ items: [{ id: "r1" }] as never, total: 1 }),
    );
    expect(state.items).toHaveLength(1);
    expect(state.loading).toBe(false);
  });

  it("clears the selection while a detail loads", () => {
    const state = repairOrdersReducer(
      { ...initialRepairOrdersState, selected: { id: "old" } as never },
      RepairOrdersActions.loadDetail({ id: "r1" }),
    );
    expect(state.selected).toBeNull();
    expect(state.detailLoading).toBe(true);
  });

  it("stores team members for the assignee picker", () => {
    const state = repairOrdersReducer(
      initialRepairOrdersState,
      RepairOrdersActions.loadTeamSuccess({
        members: [{ id: "m1", firstName: "A", lastName: "B" }],
      }),
    );
    expect(state.teamMembers).toHaveLength(1);
  });

  it("marks saving during a mutation and applies the updated order", () => {
    const saving = repairOrdersReducer(
      initialRepairOrdersState,
      RepairOrdersActions.sendQuote({ id: "r1" }),
    );
    expect(saving.saving).toBe(true);

    const saved = repairOrdersReducer(
      { ...saving, items: [{ id: "r1", status: "DIAGNOSIS_IN_PROGRESS" } as never] },
      RepairOrdersActions.saveSuccess({
        order: { id: "r1", status: "QUOTE_PENDING_APPROVAL" } as never,
      }),
    );
    expect(saved.saving).toBe(false);
    expect(saved.selected?.status).toBe("QUOTE_PENDING_APPROVAL");
    expect(saved.items[0]?.status).toBe("QUOTE_PENDING_APPROVAL");
  });

  it("stores the eligible-appointment candidates", () => {
    const loading = repairOrdersReducer(
      initialRepairOrdersState,
      RepairOrdersActions.loadCandidates(),
    );
    expect(loading.candidatesLoading).toBe(true);

    const done = repairOrdersReducer(
      loading,
      RepairOrdersActions.loadCandidatesSuccess({
        candidates: [{ id: "a1" }] as never,
      }),
    );
    expect(done.candidates).toHaveLength(1);
    expect(done.candidatesLoading).toBe(false);
  });

  it("keeps the detail error on save failure", () => {
    const state = repairOrdersReducer(
      { ...initialRepairOrdersState, saving: true },
      RepairOrdersActions.saveFailure({ error: "boom" }),
    );
    expect(state.detailError).toBe("boom");
    expect(state.saving).toBe(false);
  });
});

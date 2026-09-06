import { WorkshopsActions } from "./workshops.actions";
import { workshopsReducer } from "./workshops.reducer";
import { initialWorkshopsState } from "./workshops.state";

describe("workshopsReducer", () => {
  it("stores the search term without touching the radius search", () => {
    const state = workshopsReducer(
      initialWorkshopsState,
      WorkshopsActions.searchChanged({ search: "Berlin" }),
    );
    expect(state.query.search).toBe("Berlin");
    expect(state.query.near).toBeNull();
  });

  it("sets the near point and keeps the previous radius when none is given", () => {
    const state = workshopsReducer(
      initialWorkshopsState,
      WorkshopsActions.nearChanged({ lat: 52.52, lng: 13.405 }),
    );
    expect(state.query.near).toEqual({ lat: 52.52, lng: 13.405 });
    expect(state.query.radiusKm).toBe(initialWorkshopsState.query.radiusKm);
  });

  it("updates the radius when one is provided", () => {
    const state = workshopsReducer(
      initialWorkshopsState,
      WorkshopsActions.nearChanged({ lat: 1, lng: 2, radiusKm: 100 }),
    );
    expect(state.query.radiusKm).toBe(100);
  });

  it("clears only the near point on nearCleared", () => {
    const start = workshopsReducer(
      initialWorkshopsState,
      WorkshopsActions.nearChanged({ lat: 1, lng: 2, radiusKm: 50 }),
    );
    const state = workshopsReducer(start, WorkshopsActions.nearCleared());
    expect(state.query.near).toBeNull();
    expect(state.query.radiusKm).toBe(50);
  });

  it("stores the loaded workshops and stops loading", () => {
    const state = workshopsReducer(
      { ...initialWorkshopsState, loading: true },
      WorkshopsActions.loadSuccess({ items: [{ id: "w1" }] as never }),
    );
    expect(state.items).toHaveLength(1);
    expect(state.loading).toBe(false);
  });

  it("keeps the error message on load failure", () => {
    const state = workshopsReducer(
      { ...initialWorkshopsState, loading: true },
      WorkshopsActions.loadFailure({ error: "boom" }),
    );
    expect(state.error).toBe("boom");
    expect(state.loading).toBe(false);
  });

  it("tracks the focused workshop", () => {
    const state = workshopsReducer(
      initialWorkshopsState,
      WorkshopsActions.focus({ id: "w2" }),
    );
    expect(state.focusedId).toBe("w2");
  });

  it("clears the selection while a detail loads and stores it on success", () => {
    const loading = workshopsReducer(
      { ...initialWorkshopsState, selected: { id: "old" } as never },
      WorkshopsActions.loadDetail({ id: "w1" }),
    );
    expect(loading.selected).toBeNull();
    expect(loading.detailLoading).toBe(true);

    const done = workshopsReducer(
      loading,
      WorkshopsActions.loadDetailSuccess({ workshop: { id: "w1" } as never }),
    );
    expect(done.selected?.id).toBe("w1");
    expect(done.detailLoading).toBe(false);
  });

  it("drops the selection when leaving the detail view", () => {
    const state = workshopsReducer(
      { ...initialWorkshopsState, selected: { id: "w1" } as never, detailError: "x" },
      WorkshopsActions.leaveDetail(),
    );
    expect(state.selected).toBeNull();
    expect(state.detailError).toBeNull();
  });
});

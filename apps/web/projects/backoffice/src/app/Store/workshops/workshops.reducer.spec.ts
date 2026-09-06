import { WorkshopsActions } from "./workshops.actions";
import { workshopsReducer } from "./workshops.reducer";
import { initialWorkshopsState } from "./workshops.state";

describe("workshopsReducer", () => {
  it("sets search and resets to page 1", () => {
    const start = {
      ...initialWorkshopsState,
      query: { ...initialWorkshopsState.query, page: 4 },
    };
    const state = workshopsReducer(
      start,
      WorkshopsActions.searchChanged({ search: "nord" }),
    );
    expect(state.query.search).toBe("nord");
    expect(state.query.page).toBe(1);
  });

  it("changes page without touching filters", () => {
    const state = workshopsReducer(
      initialWorkshopsState,
      WorkshopsActions.pageChanged({ page: 3 }),
    );
    expect(state.query.page).toBe(3);
    expect(state.query.search).toBe("");
  });

  it("stores the loaded page", () => {
    const state = workshopsReducer(
      { ...initialWorkshopsState, loading: true },
      WorkshopsActions.loadSuccess({
        items: [{ id: "w1" }] as never,
        total: 1,
      }),
    );
    expect(state.items).toHaveLength(1);
    expect(state.total).toBe(1);
    expect(state.loading).toBe(false);
  });

  it("keeps the error on failure", () => {
    const state = workshopsReducer(
      { ...initialWorkshopsState, loading: true },
      WorkshopsActions.loadFailure({ error: "boom" }),
    );
    expect(state.error).toBe("boom");
    expect(state.loading).toBe(false);
  });
});

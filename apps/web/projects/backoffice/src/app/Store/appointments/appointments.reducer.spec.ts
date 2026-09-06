import { AppointmentsActions } from "./appointments.actions";
import { appointmentsReducer } from "./appointments.reducer";
import { initialAppointmentsState } from "./appointments.state";

describe("admin appointmentsReducer", () => {
  it("sets the status filter and resets to page 1", () => {
    const start = {
      ...initialAppointmentsState,
      query: { ...initialAppointmentsState.query, page: 3 },
    };
    const state = appointmentsReducer(
      start,
      AppointmentsActions.statusChanged({ status: "CONFIRMED" }),
    );
    expect(state.query.status).toBe("CONFIRMED");
    expect(state.query.page).toBe(1);
  });

  it("stores the loaded page", () => {
    const state = appointmentsReducer(
      { ...initialAppointmentsState, loading: true },
      AppointmentsActions.loadSuccess({
        items: [{ id: "a1" }] as never,
        total: 1,
      }),
    );
    expect(state.items).toHaveLength(1);
    expect(state.total).toBe(1);
    expect(state.loading).toBe(false);
  });

  it("keeps the error on load failure", () => {
    const state = appointmentsReducer(
      { ...initialAppointmentsState, loading: true },
      AppointmentsActions.loadFailure({ error: "boom" }),
    );
    expect(state.error).toBe("boom");
    expect(state.loading).toBe(false);
  });
});

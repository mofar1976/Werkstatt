import { AppointmentsActions } from "./appointments.actions";
import { appointmentsReducer } from "./appointments.reducer";
import { initialAppointmentsState } from "./appointments.state";

describe("appointmentsReducer", () => {
  it("sets the status filter and resets to page 1", () => {
    const start = {
      ...initialAppointmentsState,
      query: { ...initialAppointmentsState.query, page: 4 },
    };
    const state = appointmentsReducer(
      start,
      AppointmentsActions.statusChanged({ status: "CANCELLED" }),
    );
    expect(state.query.status).toBe("CANCELLED");
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

  it("clears the selection while a detail loads", () => {
    const state = appointmentsReducer(
      { ...initialAppointmentsState, selected: { id: "old" } as never },
      AppointmentsActions.loadDetail({ id: "a1" }),
    );
    expect(state.selected).toBeNull();
    expect(state.detailLoading).toBe(true);
  });

  it("marks saving on cancel and applies the updated appointment", () => {
    const saving = appointmentsReducer(
      initialAppointmentsState,
      AppointmentsActions.cancel({ id: "a1" }),
    );
    expect(saving.saving).toBe(true);

    const saved = appointmentsReducer(
      { ...saving, items: [{ id: "a1", status: "CONFIRMED" } as never] },
      AppointmentsActions.cancelSuccess({
        appointment: { id: "a1", status: "CANCELLED" } as never,
      }),
    );
    expect(saved.saving).toBe(false);
    expect(saved.selected?.status).toBe("CANCELLED");
    expect(saved.items[0]?.status).toBe("CANCELLED");
  });

  it("keeps the detail error on cancel failure", () => {
    const state = appointmentsReducer(
      { ...initialAppointmentsState, saving: true },
      AppointmentsActions.cancelFailure({ error: "boom" }),
    );
    expect(state.detailError).toBe("boom");
    expect(state.saving).toBe(false);
  });
});

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
      AppointmentsActions.loadSuccess({ items: [{ id: "a1" }] as never, total: 1 }),
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

  it("marks saving while a mutation runs", () => {
    expect(
      appointmentsReducer(initialAppointmentsState, AppointmentsActions.complete({ id: "a1" }))
        .saving,
    ).toBe(true);
  });

  it("updates the appointment in list and selection on save", () => {
    const state = appointmentsReducer(
      {
        ...initialAppointmentsState,
        saving: true,
        items: [{ id: "a1", status: "CONFIRMED" } as never],
      },
      AppointmentsActions.saveSuccess({
        appointment: { id: "a1", status: "CANCELLED" } as never,
      }),
    );
    expect(state.saving).toBe(false);
    expect(state.items[0]?.status).toBe("CANCELLED");
    expect(state.selected?.status).toBe("CANCELLED");
  });

  it("keeps the detail error on save failure", () => {
    const state = appointmentsReducer(
      { ...initialAppointmentsState, saving: true },
      AppointmentsActions.saveFailure({ error: "boom" }),
    );
    expect(state.detailError).toBe("boom");
    expect(state.saving).toBe(false);
  });

  it("changes the calendar month and stores the loaded month", () => {
    const moved = appointmentsReducer(
      initialAppointmentsState,
      AppointmentsActions.calendarMonthChanged({ month: "2026-11" }),
    );
    expect(moved.calendarMonth).toBe("2026-11");

    const loaded = appointmentsReducer(
      { ...moved, calendarLoading: true },
      AppointmentsActions.loadCalendarSuccess({ items: [{ id: "a1" }] as never }),
    );
    expect(loaded.calendarItems).toHaveLength(1);
    expect(loaded.calendarLoading).toBe(false);
  });
});

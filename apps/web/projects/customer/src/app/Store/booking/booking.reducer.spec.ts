import { BookingActions } from "./booking.actions";
import { bookingReducer } from "./booking.reducer";
import { initialBookingState } from "./booking.state";

describe("bookingReducer", () => {
  it("resets and starts loading when opened", () => {
    const dirty = {
      ...initialBookingState,
      submitError: "old",
      slots: [{ id: "s1" }] as never,
    };
    const state = bookingReducer(
      dirty,
      BookingActions.opened({ workshopId: "w1" }),
    );
    expect(state.workshopId).toBe("w1");
    expect(state.loading).toBe(true);
    expect(state.slots).toEqual([]);
    expect(state.submitError).toBeNull();
  });

  it("stores workshop, slots and brands on load success", () => {
    const state = bookingReducer(
      { ...initialBookingState, loading: true },
      BookingActions.loadSuccess({
        workshop: { id: "w1" } as never,
        slots: [{ id: "s1" }] as never,
        brands: [{ id: "b1" }] as never,
      }),
    );
    expect(state.loading).toBe(false);
    expect(state.workshop?.id).toBe("w1");
    expect(state.slots).toHaveLength(1);
    expect(state.brands).toHaveLength(1);
  });

  it("marks models loading when a brand is selected", () => {
    const state = bookingReducer(
      initialBookingState,
      BookingActions.brandSelected({ brandId: "b1" }),
    );
    expect(state.selectedBrandId).toBe("b1");
    expect(state.modelsLoading).toBe(true);
    expect(state.models).toEqual([]);
  });

  it("ignores a stale models response for a different brand", () => {
    const start = bookingReducer(
      initialBookingState,
      BookingActions.brandSelected({ brandId: "b2" }),
    );
    const state = bookingReducer(
      start,
      BookingActions.modelsLoaded({
        brandId: "b1",
        models: [{ id: "m1" }] as never,
      }),
    );
    expect(state.models).toEqual([]);
    expect(state.modelsLoading).toBe(true);
  });

  it("applies the matching models response", () => {
    const start = bookingReducer(
      initialBookingState,
      BookingActions.brandSelected({ brandId: "b1" }),
    );
    const state = bookingReducer(
      start,
      BookingActions.modelsLoaded({
        brandId: "b1",
        models: [{ id: "m1" }] as never,
      }),
    );
    expect(state.models).toHaveLength(1);
    expect(state.modelsLoading).toBe(false);
  });

  it("records the booked appointment id on submit success", () => {
    const state = bookingReducer(
      { ...initialBookingState, submitting: true },
      BookingActions.submitSuccess({ appointment: { id: "a9" } as never }),
    );
    expect(state.submitting).toBe(false);
    expect(state.bookedAppointmentId).toBe("a9");
  });

  it("keeps the submit error on failure and refreshes slots", () => {
    const failed = bookingReducer(
      { ...initialBookingState, submitting: true },
      BookingActions.submitFailure({ error: "gone" }),
    );
    expect(failed.submitError).toBe("gone");
    expect(failed.submitting).toBe(false);

    const reloaded = bookingReducer(
      failed,
      BookingActions.slotsReloaded({ slots: [{ id: "s2" }] as never }),
    );
    expect(reloaded.slots).toHaveLength(1);
  });
});

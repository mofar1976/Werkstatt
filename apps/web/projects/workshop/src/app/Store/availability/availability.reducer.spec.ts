import { AvailabilityActions } from "./availability.actions";
import { availabilityReducer } from "./availability.reducer";
import { initialAvailabilityState } from "./availability.state";

describe("availabilityReducer", () => {
  it("marks loading and clears the error on load", () => {
    const state = availabilityReducer(
      { ...initialAvailabilityState, error: "boom" },
      AvailabilityActions.load(),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("stores the slots on load success", () => {
    const state = availabilityReducer(
      { ...initialAvailabilityState, loading: true },
      AvailabilityActions.loadSuccess({ slots: [{ id: "s1" }] as never }),
    );
    expect(state.slots).toHaveLength(1);
    expect(state.loading).toBe(false);
  });

  it("marks saving while a mutation runs", () => {
    expect(
      availabilityReducer(
        initialAvailabilityState,
        AvailabilityActions.createSlot({
          input: { startsAt: "2026-09-06T09:00:00.000Z", durationMinutes: 60 },
        }),
      ).saving,
    ).toBe(true);
    expect(
      availabilityReducer(
        initialAvailabilityState,
        AvailabilityActions.setSlotStatus({ slotId: "s1", status: "BLOCKED" }),
      ).saving,
    ).toBe(true);
  });

  it("replaces the slot list and clears saving on slotsChanged", () => {
    const state = availabilityReducer(
      { ...initialAvailabilityState, saving: true, slots: [{ id: "s1" }] as never },
      AvailabilityActions.slotsChanged({
        slots: [{ id: "s1" }, { id: "s2" }] as never,
      }),
    );
    expect(state.slots).toHaveLength(2);
    expect(state.saving).toBe(false);
  });

  it("keeps the error on a slot save failure", () => {
    const state = availabilityReducer(
      { ...initialAvailabilityState, saving: true },
      AvailabilityActions.slotSaveFailure({ error: "overlap" }),
    );
    expect(state.error).toBe("overlap");
    expect(state.saving).toBe(false);
  });

  it("resets on leave", () => {
    const state = availabilityReducer(
      { ...initialAvailabilityState, slots: [{ id: "s1" }] as never },
      AvailabilityActions.leave(),
    );
    expect(state).toEqual(initialAvailabilityState);
  });
});

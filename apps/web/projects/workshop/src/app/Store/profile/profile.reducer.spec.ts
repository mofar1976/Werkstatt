import { ProfileActions } from "./profile.actions";
import { profileReducer } from "./profile.reducer";
import { initialProfileState } from "./profile.state";

describe("profileReducer", () => {
  it("marks loading and clears the error on load", () => {
    const state = profileReducer(
      { ...initialProfileState, error: "boom" },
      ProfileActions.load(),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("stores the workshop on load success", () => {
    const state = profileReducer(
      { ...initialProfileState, loading: true },
      ProfileActions.loadSuccess({ workshop: { id: "w1", name: "Nord" } as never }),
    );
    expect(state.workshop?.name).toBe("Nord");
    expect(state.loading).toBe(false);
  });

  it("marks saving and applies the updated workshop", () => {
    const saving = profileReducer(
      initialProfileState,
      ProfileActions.save({
        input: {
          name: "Nord GmbH",
          address: { street: "S 1", city: "B", postalCode: "1", country: "DE" },
        },
      }),
    );
    expect(saving.saving).toBe(true);

    const saved = profileReducer(
      saving,
      ProfileActions.saveSuccess({
        workshop: { id: "w1", name: "Nord GmbH" } as never,
      }),
    );
    expect(saved.saving).toBe(false);
    expect(saved.workshop?.name).toBe("Nord GmbH");
  });

  it("keeps the error on save failure", () => {
    const state = profileReducer(
      { ...initialProfileState, saving: true },
      ProfileActions.saveFailure({ error: "nope" }),
    );
    expect(state.error).toBe("nope");
    expect(state.saving).toBe(false);
  });
});

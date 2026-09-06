import { TeamActions } from "./team.actions";
import { teamReducer } from "./team.reducer";
import { initialTeamState } from "./team.state";

describe("teamReducer", () => {
  it("marks loading and clears the error on load", () => {
    const state = teamReducer(
      { ...initialTeamState, error: "boom" },
      TeamActions.load(),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("stores the members on load success", () => {
    const state = teamReducer(
      { ...initialTeamState, loading: true },
      TeamActions.loadSuccess({ members: [{ id: "m1" }] as never }),
    );
    expect(state.members).toHaveLength(1);
    expect(state.loading).toBe(false);
  });

  it("marks saving while a mutation runs", () => {
    expect(
      teamReducer(initialTeamState, TeamActions.removeMember({ memberId: "m1" }))
        .saving,
    ).toBe(true);
    expect(
      teamReducer(
        initialTeamState,
        TeamActions.updateMember({ memberId: "m1", input: { firstName: "A" } }),
      ).saving,
    ).toBe(true);
  });

  it("replaces the member list and clears saving on membersChanged", () => {
    const state = teamReducer(
      { ...initialTeamState, saving: true, members: [{ id: "m1" }] as never },
      TeamActions.membersChanged({ members: [{ id: "m1" }, { id: "m2" }] as never }),
    );
    expect(state.members).toHaveLength(2);
    expect(state.saving).toBe(false);
  });

  it("keeps the error on a member save failure", () => {
    const state = teamReducer(
      { ...initialTeamState, saving: true },
      TeamActions.memberSaveFailure({ error: "nope" }),
    );
    expect(state.error).toBe("nope");
    expect(state.saving).toBe(false);
  });

  it("resets on leave", () => {
    const state = teamReducer(
      { ...initialTeamState, members: [{ id: "m1" }] as never, error: "x" },
      TeamActions.leave(),
    );
    expect(state).toEqual(initialTeamState);
  });
});

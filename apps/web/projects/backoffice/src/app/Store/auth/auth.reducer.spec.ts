import type { AuthResponse } from "@car-garage/shared";
import { AuthActions } from "./auth.actions";
import { authReducer } from "./auth.reducer";
import { initialAuthState } from "./auth.state";

const result: AuthResponse = {
  user: {
    id: "u1",
    email: "admin@car-garage.test",
    firstName: "Root",
    lastName: "Admin",
    audience: "ADMIN",
    roles: ["PLATFORM_ADMIN"],
    createdAt: new Date().toISOString(),
  },
  tokens: { accessToken: "a", refreshToken: "r", expiresIn: 900 },
};

describe("authReducer", () => {
  it("sets loading on login", () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.login({ email: "x", password: "y" }),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("stores user + tokens on loginSuccess", () => {
    const state = authReducer(
      { ...initialAuthState, loading: true },
      AuthActions.loginSuccess({ result }),
    );
    expect(state.user?.email).toBe("admin@car-garage.test");
    expect(state.tokens?.accessToken).toBe("a");
    expect(state.loading).toBe(false);
  });

  it("keeps the error and clears the session on loginFailure", () => {
    const state = authReducer(
      { ...initialAuthState, loading: true },
      AuthActions.loginFailure({ error: "Invalid credentials" }),
    );
    expect(state.error).toBe("Invalid credentials");
    expect(state.tokens).toBeNull();
  });

  it("resets to initial state on logout", () => {
    const loggedIn = authReducer(
      initialAuthState,
      AuthActions.loginSuccess({ result }),
    );
    const state = authReducer(loggedIn, AuthActions.logout());
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
  });
});

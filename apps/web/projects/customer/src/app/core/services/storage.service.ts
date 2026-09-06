import { Injectable } from "@angular/core";
import type { AuthTokens, AuthUser } from "@car-garage/shared";
import { STORAGE_KEYS } from "../config";

/** Thin, fail-safe wrapper around localStorage for the auth session. */
@Injectable({ providedIn: "root" })
export class StorageService {
  private read<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private write(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — ignore */
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  getTokens(): AuthTokens | null {
    const accessToken = this.read<string>(STORAGE_KEYS.accessToken);
    const refreshToken = this.read<string>(STORAGE_KEYS.refreshToken);
    return accessToken && refreshToken
      ? { accessToken, refreshToken, expiresIn: 0 }
      : null;
  }

  getUser(): AuthUser | null {
    return this.read<AuthUser>(STORAGE_KEYS.user);
  }

  saveSession(user: AuthUser, tokens: AuthTokens): void {
    this.write(STORAGE_KEYS.accessToken, tokens.accessToken);
    this.write(STORAGE_KEYS.refreshToken, tokens.refreshToken);
    this.write(STORAGE_KEYS.user, user);
  }

  clear(): void {
    this.remove(STORAGE_KEYS.accessToken);
    this.remove(STORAGE_KEYS.refreshToken);
    this.remove(STORAGE_KEYS.user);
  }
}

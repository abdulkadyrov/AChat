import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "./auth-store";
import type { AuthSession, UserProfile } from "@/shared/types/domain";

const user: UserProfile = {
  id: "remote-user",
  name: "Папа",
  avatarUrl: "",
  phone: "+7 999 123-45-67",
  about: "",
  createdAt: "2026-08-03T00:00:00.000Z"
};

const session: AuthSession = {
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  expiresAt: Date.now() + 60_000
};

describe("auth store remote identity", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, session: null });
  });

  it("does not publish a new state when the remote id is unchanged", () => {
    useAuthStore.getState().setSession(user, session);
    const initialUser = useAuthStore.getState().user;
    const listener = vi.fn();
    const unsubscribe = useAuthStore.subscribe(listener);

    useAuthStore.getState().setRemoteUserId(user.id);

    expect(useAuthStore.getState().user).toBe(initialUser);
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("updates the local id once when Supabase returns a different id", () => {
    useAuthStore.getState().setSession({ ...user, id: "local-user" }, session);

    useAuthStore.getState().setRemoteUserId(user.id);

    expect(useAuthStore.getState().user?.id).toBe(user.id);
  });
});

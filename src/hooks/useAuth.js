import { useEffect, useState, useCallback } from "react";
import { api, tokenStore } from "../api.js";

// Oturum durumunu yönetir. Açılışta token varsa /me ile doğrular.
export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (tokenStore.get()) {
        try {
          const { user } = await api.me();
          if (alive) setUser(user);
        } catch {
          tokenStore.clear();
        }
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login(email, password);
    tokenStore.set(token);
    setUser(user);
  }, []);

  const register = useCallback(async (email, password) => {
    const { token, user } = await api.register(email, password);
    tokenStore.set(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  return { user, ready, login, register, logout };
}

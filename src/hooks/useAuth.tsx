import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";

interface AuthContextValue {
  username: string | null;
  loading: boolean;
  hasAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  setup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setUsername(null);
      setLoading(false);
      const status = await api.authStatus().catch(() => ({ hasAdmin: true }));
      setHasAdmin(status.hasAdmin);
      return;
    }
    try {
      const me = await api.me();
      setUsername(me.username);
      setHasAdmin(true);
    } catch {
      api.setToken(null);
      setUsername(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (user: string, password: string) => {
    const res = await api.login(user, password);
    api.setToken(res.token);
    setUsername(res.username);
  }, []);

  const setup = useCallback(async (user: string, password: string) => {
    await api.setup(user, password);
    const res = await api.login(user, password);
    api.setToken(res.token);
    setUsername(res.username);
    setHasAdmin(true);
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{ username, loading, hasAdmin, login, setup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

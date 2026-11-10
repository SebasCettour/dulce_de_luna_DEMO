import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { DEMO_PREFIX } from "../demo/store";

// Constantes
const TOKEN_KEY = `${DEMO_PREFIX}session`;
const USER_KEY = `${DEMO_PREFIX}user`;

// Tipos
export interface User {
  id: number;
  email: string;
  nombre: string;
  role: string;
  telefono?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  codigo_postal?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  getAuthHeaders: () => HeadersInit;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =========================
// 🔥 HOOK PRINCIPAL
// =========================
function useAuthState() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [loading] = useState(false);

  // =========================
  // 🔐 VALIDAR TOKEN
  // =========================
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // 🔥 IMPORTANTE: avisar al carrito
    window.dispatchEvent(new Event("user-logout"));

    setToken(null);
    setUser(null);
  }, []);

  // =========================
  // 🔄 SYNC ENTRE PESTAÑAS
  // =========================
  useEffect(() => {
    const syncAuth = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) {
        setToken(localStorage.getItem(TOKEN_KEY));

        const storedUser = localStorage.getItem(USER_KEY);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      }
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // =========================
  // LOGIN
  // =========================
  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  // =========================
  // HEADERS
  // =========================
  const getAuthHeaders = useCallback((): HeadersInit => {
    const t = token ?? localStorage.getItem(TOKEN_KEY);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (t) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;
    }

    return headers;
  }, [token]);

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    getAuthHeaders,
    updateUser,
  };
}

// =========================
// HOOK
// =========================
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

export default useAuth;

// =========================
// PROVIDER
// =========================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const auth = useAuthState();

  const value = useMemo(
    () => auth,
    [auth.user, auth.token, auth.isAuthenticated, auth.loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

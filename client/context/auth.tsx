import React, { createContext, useContext, useMemo, useState } from "react";

export type AuthUser = { id: string; nombre: string; correo: string; rol: "admin" | "cliente" } | null;

const AuthContext = createContext<{ 
  user: AuthUser; 
  login: (correo: string, password: string) => Promise<void>; 
  logout: () => void 
} | null>(null);

const AUTH_KEY = "manolos-gestion:auth";

function loadUser(): AuthUser {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(() => loadUser());

  const value = useMemo(() => ({
    user,
    login: async (correo: string, password: string) => {
      // Hardcoded credentials check
      if (correo !== "admin@gmail.com" || password !== "tupassword") {
        throw new Error("Credenciales inválidas");
      }
      
      // Create mock user data
      const mockUser = { 
        id: "6902a1d4ade8c9d8fc967adc",
        nombre: "Prueba",
        correo: "admin@gmail.com",
        rol: "admin" as const
      };
      
      // Store mock token
      const mockToken = btoa(JSON.stringify({ 
        header: { alg: "none", typ: "JWT" },
        payload: { ...mockUser, sub: mockUser.id }
      }));
      localStorage.setItem("manolos-gestion:token", mockToken);
      localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
    },
    logout: () => {
      setUser(null);
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem("manolos-gestion:token");
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

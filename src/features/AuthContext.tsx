import { createContext, useContext } from "react";

export type User = { id: string; nombre: string; email: string };
export type Result = { ok: boolean; error?: string };

export type AuthContextType = {
  user: User | null;
  register: (nombre: string, email: string, password: string) => Result;
  login: (email: string, password: string) => Result;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

import { createContext, useContext } from "react";

export type User = { id: string; nombre: string; email: string; espectadorId?: number };
export type Result = { ok: boolean; error?: string };

export type AuthContextType = {
  user: User | null;
  register: (
    nombre: string,
    apellido: string,
    dni: string,
    telefono: string,
    email: string,
    password: string,
  ) => Promise<Result>;
  linkEspectador: (id: number) => void;
  login: (email: string, password: string) => Result;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

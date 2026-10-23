import { useState, type ReactNode } from "react";
import { AuthContext, type User, type Result } from "./AuthContext";

type StoredUser = User & { password: string };

const USERS_KEY = "cv_users";
const SESSION_KEY = "cv_session";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => read<User | null>(SESSION_KEY, null));

  function startSession(u: User) {
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  }

  function register(nombre: string, email: string, password: string): Result {
    const users = read<StoredUser[]>(USERS_KEY, []);
    const mail = email.trim().toLowerCase();

    if (users.some((u) => u.email === mail)) {
      return { ok: false, error: "Ya existe una cuenta con ese email" };
    }

    const nuevo: StoredUser = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      email: mail,
      password,
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, nuevo]));
    startSession({ id: nuevo.id, nombre: nuevo.nombre, email: nuevo.email });
    return { ok: true };
  }

  function login(email: string, password: string): Result {
    const users = read<StoredUser[]>(USERS_KEY, []);
    const mail = email.trim().toLowerCase();
    const found = users.find((u) => u.email === mail && u.password === password);

    if (!found) return { ok: false, error: "Email o contraseña incorrectos" };

    startSession({ id: found.id, nombre: found.nombre, email: found.email });
    return { ok: true };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

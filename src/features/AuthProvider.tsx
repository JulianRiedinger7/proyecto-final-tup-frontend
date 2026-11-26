import { useState, type ReactNode } from "react";
import { AuthContext, type User, type Result } from "./AuthContext";

type StoredUser = User & {
  apellido: string;
  dni: string;
  telefono: string;
  password: string;
};

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

  async function register(
    nombre: string,
    apellido: string,
    dni: string,
    telefono: string,
    email: string,
    password: string,
  ): Promise<Result> {
    const users = read<StoredUser[]>(USERS_KEY, []);
    const mail = email.trim().toLowerCase();

    if (users.some((u) => u.email === mail)) {
      return { ok: false, error: "Ya existe una cuenta con ese email" };
    }

    const nuevo: StoredUser = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      telefono: telefono.trim(),
      email: mail,
      password,
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, nuevo]));
    startSession({
      id: nuevo.id,
      nombre: nuevo.nombre,
      email: nuevo.email,
      espectadorId: nuevo.espectadorId,
    });
    return { ok: true };
  }

  function login(email: string, password: string): Result {
    const users = read<StoredUser[]>(USERS_KEY, []);
    const mail = email.trim().toLowerCase();
    const found = users.find((u) => u.email === mail && u.password === password);

    if (!found) return { ok: false, error: "Email o contraseña incorrectos" };

    startSession({
      id: found.id,
      nombre: found.nombre,
      email: found.email,
      espectadorId: found.espectadorId,
    });
    return { ok: true };
  }

  function linkEspectador(id: number) {
    if (!user) return;

    const updated: User = { ...user, espectadorId: id };
    startSession(updated);

    const users = read<StoredUser[]>(USERS_KEY, []);
    const index = users.findIndex((u) => u.id === user.id);
    if (index === -1) return;

    users[index] = { ...users[index], espectadorId: id };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout, linkEspectador }}>
      {children}
    </AuthContext.Provider>
  );
}

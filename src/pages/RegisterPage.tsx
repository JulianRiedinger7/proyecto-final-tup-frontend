// src/pages/RegisterPage.tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/features/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    if (password !== confirm) return setError("Las contraseñas no coinciden");

    const res = register(nombre, email, password);
    if (res.ok) navigate("/");
    else setError(res.error ?? "Error");
  }

  const input = "rounded-lg bg-surface-container-high px-4 py-2 text-white";

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold !text-white">Registrate</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={input}
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={input}
        />
        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
        />
        <input
          type="password"
          required
          placeholder="Repetí la contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={input}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          className="rounded-full bg-primary-container px-5 py-2 font-semibold text-surface"
        >
          Crear cuenta
        </button>
      </form>

      <p className="mt-4 text-base text-on-surface-variant">
        ¿Ya tenés cuenta?&nbsp;{" "}
        <Link to="/login" className="text-[#ffb0ca]">
          Ingresá
        </Link>
      </p>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/features/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = login(email, password);
    if (res.ok) navigate("/");
    else setError(res.error ?? "Error");
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold !text-white">Ingresá</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg bg-surface-container-high px-4 py-2 text-white"
        />
        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg bg-surface-container-high px-4 py-2 text-white"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          className="rounded-full bg-primary-container px-5 py-2 font-semibold text-surface"
        >
          Ingresar
        </button>
      </form>

      <p className="mt-4 text-base text-on-surface-variant">
        ¿No tenés cuenta?&nbsp;{" "}
        <Link to="/registro" className="text-[#ffb0ca]">
          Registrate
        </Link>
      </p>
    </div>
  );
}

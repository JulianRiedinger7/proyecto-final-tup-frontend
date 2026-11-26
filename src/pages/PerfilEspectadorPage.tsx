import { useState, type FormEvent } from "react";
import { useAuth } from "@/features/AuthContext";
import { createEspectador } from "@/services/espectadores";

const input = "rounded-lg bg-surface-container-high px-4 py-2 text-white";

export function PerfilEspectadorPage() {
  const { user, linkEspectador } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? "");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return <p className="mx-auto max-w-sm px-4 py-12">Ingresá para ver tu perfil.</p>;
  const userEmail = user.email;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) return setError("Completá nombre y apellido");
    if (!/^\d{7,8}$/.test(dni.trim())) return setError("El DNI debe tener 7 u 8 dígitos");
    if (!/^\+?\d[\d\s]{6,14}$/.test(telefono.trim())) return setError("Teléfono inválido");

    setError("");
    setSubmitting(true);
    const response = await createEspectador({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: userEmail,
      dni: dni.trim(),
      telefono: telefono.trim(),
    });
    setSubmitting(false);

    if (response.code >= 400 || !response.data?.id) return setError(response.msg);
    linkEspectador(response.data.id);
  }

  if (user.espectadorId) {
    return (
      <div className="mx-auto max-w-sm px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold !text-white">Mi perfil</h1>
        <p>
          {user.nombre} — {user.email}
        </p>
        <p>Perfil de espectador completado.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-12">
      <h1 className="text-3xl font-bold !text-white">Completá tu perfil</h1>
      <input
        required
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className={input}
      />
      <input
        required
        placeholder="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
        className={input}
      />
      <input
        required
        inputMode="numeric"
        placeholder="DNI"
        value={dni}
        onChange={(e) => setDni(e.target.value)}
        className={input}
      />
      <input
        required
        type="tel"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        className={input}
      />
      <p className="text-sm text-on-surface-variant">Email: {user.email}</p>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-primary-container px-5 py-2 font-semibold text-surface"
      >
        {submitting ? "Guardando..." : "Completar perfil"}
      </button>
    </form>
  );
}

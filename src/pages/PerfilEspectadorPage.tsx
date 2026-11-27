import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useAuth } from "@/features/AuthContext";
import {
  createEspectador,
  getEspectador,
  patchEspectador,
  type Espectador,
  type PatchEspectadorPayload,
} from "@/services/espectadores";
import { listTickets, type Ticket } from "@/services/tickets";

const input = "rounded-lg bg-surface-container-high px-4 py-2 text-white";

function esProximo(ticket: Ticket) {
  if (ticket.estado === "CANCELADO" || ticket.estado === "UTILIZADO") return false;
  return new Date(ticket.evento.fechaHora).getTime() >= Date.now();
}

function esVisto(ticket: Ticket) {
  return ticket.estado === "UTILIZADO" || ticket.fechaValidacionPuerta !== null;
}

function Eventos({ titulo, items }: { titulo: string; items: Ticket[] }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-semibold !text-white">{titulo}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-on-surface-variant">Sin eventos.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((ticket) => (
            <li key={ticket.id} className="rounded-lg bg-surface-container-high p-4">
              <Link
                to={`/tickets/${ticket.id}`}
                className="font-semibold text-[#ffb0ca] hover:underline"
              >
                {ticket.evento.titulo}
              </Link>
              <p className="text-sm text-on-surface-variant">
                {new Date(ticket.evento.fechaHora).toLocaleString()} — {ticket.evento.lugar}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function PerfilEspectadorPage() {
  const { user, linkEspectador } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? "");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [espectador, setEspectador] = useState<Espectador | null>(null);
  const [proximos, setProximos] = useState<Ticket[]>([]);
  const [vistos, setVistos] = useState<Ticket[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(user?.espectadorId));
  const [submitting, setSubmitting] = useState(false);
  const [editando, setEditando] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const id = user?.espectadorId;
    if (!id) return;

    let activo = true;

    void Promise.all([getEspectador(id), listTickets({ limit: 100 })])
      .then(([espectadorRes, ticketsRes]) => {
        if (!activo) return;
        setError("");
        if (espectadorRes.code >= 400 || !espectadorRes.data) {
          setError(espectadorRes.msg);
          return;
        }

        setEspectador(espectadorRes.data);
        const mios = (ticketsRes.data?.items ?? []).filter((ticket) => ticket.espectador.id === id);
        setProximos(mios.filter(esProximo));
        setVistos(mios.filter(esVisto));
      })
      .catch(() => {
        if (activo) setError("No se pudieron cargar tus datos.");
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, [user?.espectadorId, refreshKey]);

  function validarCampos() {
    if (!nombre.trim() || !apellido.trim()) return "Completá nombre y apellido";
    if (!/^\d{7,8}$/.test(dni.trim())) return "El DNI debe tener 7 u 8 dígitos";
    if (!/^\+?\d[\d\s]{6,14}$/.test(telefono.trim())) return "Teléfono inválido";
    return null;
  }

  function abrirEdicion() {
    setNombre(espectador?.nombre ?? "");
    setApellido(espectador?.apellido ?? "");
    setDni(espectador?.dni ?? "");
    setTelefono(espectador?.telefono ?? "");
    setError("");
    setEditando(true);
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!user?.espectadorId) return;

    const mensaje = validarCampos();
    if (mensaje) return setError(mensaje);

    const payload: PatchEspectadorPayload = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      telefono: telefono.trim(),
    };

    setError("");
    setSubmitting(true);
    const response = await patchEspectador(user.espectadorId, payload);
    setSubmitting(false);

    if (response.code >= 400) return setError(response.msg);
    setEditando(false);
    setLoading(true);
    setRefreshKey((key) => key + 1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const mensaje = validarCampos();
    if (mensaje) return setError(mensaje);

    setError("");
    setSubmitting(true);
    const response = await createEspectador({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: user?.email ?? "",
      dni: dni.trim(),
      telefono: telefono.trim(),
      createdAt: new Date(),
      isActive: true,
    });
    setSubmitting(false);

    if (response.code >= 400 || !response.data?.id) return setError(response.msg);
    setLoading(true);
    linkEspectador(response.data.id);
  }

  if (!user) return <p className="mx-auto max-w-sm px-4 py-12">Ingresá para ver tu perfil.</p>;

  const esEdicion = Boolean(user.espectadorId) && editando;
  const faltantes = [
    ["nombre", espectador?.nombre],
    ["apellido", espectador?.apellido],
    ["DNI", espectador?.dni],
    ["Teléfono", espectador?.telefono],
  ]
    .filter(([, valor]) => !valor)
    .map(([label]) => label);

  if (!user.espectadorId || esEdicion) {
    return (
      <form
        onSubmit={esEdicion ? handleEdit : handleSubmit}
        className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-12"
      >
        <h1 className="text-3xl font-bold !text-white">
          {esEdicion ? "Editar usuario" : "Completá tu perfil"}
        </h1>
        <div className="flex flex-col gap-1">
          <label htmlFor="nombre" className="text-sm text-on-surface-variant">
            Nombre
          </label>
          <input
            id="nombre"
            required
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={input}
          />
        </div>
        <label htmlFor="nombre" className="text-sm text-on-surface-variant">
          Apellido
        </label>
        <input
          required
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          className={input}
        />
        <label htmlFor="nombre" className="text-sm text-on-surface-variant">
          DNI
        </label>
        <input
          required
          inputMode="numeric"
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          className={input}
        />
        <label htmlFor="nombre" className="text-sm text-on-surface-variant">
          Teléfono
        </label>
        <input
          required
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className={input}
        />
        <p className="text-sm text-on-surface-variant">Email: {user.email}</p>
        {esEdicion && faltantes.length > 0 && (
          <p className="text-sm text-on-surface-variant">
            Faltan completar: {faltantes.join(", ")}
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary-container px-5 py-2 font-semibold text-surface"
          >
            {submitting ? "Guardando..." : esEdicion ? "Guardar cambios" : "Completar perfil"}
          </button>
          {esEdicion && (
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="rounded-full px-5 py-2 font-semibold text-on-surface-variant"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    );
  }

  const campos: [string, string | undefined][] = [
    ["Nombre", espectador?.nombre],
    ["Apellido", espectador?.apellido],
    ["DNI", espectador?.dni],
    ["Teléfono", espectador?.telefono],
    ["Email", espectador?.email],
  ];

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold !text-white">Mi perfil</h1>
        <button
          type="button"
          onClick={abrirEdicion}
          disabled={loading}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold !text-white disabled:opacity-50"
        >
          Editar usuario
        </button>
      </div>
      {loading && <p className="text-sm text-on-surface-variant">Cargando...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {espectador && (
        <dl className="flex flex-col gap-2">
          {campos
            .filter(([, valor]) => Boolean(valor))
            .map(([label, valor]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-white/10 pb-2">
                <dt className="text-sm text-on-surface-variant">{label}</dt>
                <dd className="text-white">{valor}</dd>
              </div>
            ))}
        </dl>
      )}
      <Eventos titulo="Eventos para ver" items={proximos} />
      <Eventos titulo="Eventos que ya viste" items={vistos} />
    </div>
  );
}

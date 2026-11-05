import { getTicket, TICKET_ESTADOS, type Ticket, type TicketEstado } from "@/services/tickets";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

const estadoLabels: Record<TicketEstado, string> = {
  RESERVADO: "Reservado",
  CONFIRMADO: "Confirmado",
  UTILIZADO: "Utilizado",
  CANCELADO: "Cancelado",
};

const inputClassName =
  "mt-1.5 w-full rounded-md border border-white/15 bg-surface-container-high px-3 py-2 text-sm text-white outline-none focus:border-primary disabled:opacity-70";

function formatDate(value: string | null) {
  if (!value) return "Sin registrar";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function isTicketEstado(value: string): value is TicketEstado {
  return TICKET_ESTADOS.some((estado) => estado === value);
}

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [estado, setEstado] = useState<TicketEstado>("RESERVADO");
  const [precio, setPrecio] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchTicket = () => {
      setLoading(true);
      setError(null);
      setTicket(null);
      setEditing(false);

      const id = Number(ticketId);
      if (!ticketId || !Number.isInteger(id) || id < 1) {
        setError("El identificador del ticket no es válido.");
        setLoading(false);
        return;
      }

      getTicket(id)
        .then((response) => {
          if (!active) return;

          if (response.code >= 400) {
            setError(response.msg || "No se pudo cargar el ticket.");
            return;
          }

          if (!response.data) {
            setError("No encontramos el ticket solicitado.");
            return;
          }

          setTicket(response.data);
          setEstado(response.data.estado);
          setPrecio(String(response.data.precioUnitario));
        })
        .catch((loadError) => {
          if (!active) return;
          console.error("Error al cargar el detalle del ticket:", loadError);
          setError("No se pudo cargar el ticket.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    fetchTicket();

    return () => {
      active = false;
    };
  }, [ticketId]);

  function cancelEditing() {
    if (!ticket) return;
    setEstado(ticket.estado);
    setPrecio(String(ticket.precioUnitario));
    setEditing(false);
  }

  if (loading) {
    return (
      <p className="mx-auto max-w-5xl px-4 py-12 text-on-surface-variant" role="status">
        Cargando ticket...
      </p>
    );
  }

  if (error || !ticket) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link to="/tickets" className="text-sm text-primary hover:underline">
          ← Volver a tickets
        </Link>
        <p
          className="mt-6 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-red-200"
          role="alert"
        >
          {error ?? "No encontramos el ticket solicitado."}
        </p>
      </section>
    );
  }

  const spectator = `${ticket.espectador.nombre} ${ticket.espectador.apellido}`.trim();

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to="/tickets" className="text-sm text-on-surface-variant hover:text-primary">
        ← Volver a tickets
      </Link>

      <header className="mb-6 mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 font-label-sm text-[10px] tracking-wider text-on-surface-variant uppercase">
            Tickets / #{ticket.id}
          </p>
          <h1 className="text-3xl font-semibold text-white">Detalle del ticket</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Información del ticket y del evento.
          </p>
        </div>
        {editing ? (
          <button
            type="button"
            onClick={cancelEditing}
            className="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md border border-primary/60 px-4 py-2 text-sm text-primary hover:bg-primary/10"
          >
            Editar
          </button>
        )}
      </header>

      <section className="overflow-hidden rounded-lg border border-white/10 bg-surface-container-low">
        <h2 className="border-b border-white/10 px-5 py-4 text-lg font-medium text-white">
          {`Ticket #${ticket.id}`}
        </h2>

        <div className="grid gap-x-5 gap-y-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs text-on-surface-variant">
            ID
            <input className={inputClassName} value={ticket.id} disabled />
          </label>

          <label className="text-xs text-on-surface-variant">
            Estado
            <select
              className={inputClassName}
              value={estado}
              disabled={!editing}
              onChange={(event) => {
                if (isTicketEstado(event.target.value)) setEstado(event.target.value);
              }}
            >
              {TICKET_ESTADOS.map((ticketEstado) => (
                <option key={ticketEstado} value={ticketEstado}>
                  {estadoLabels[ticketEstado]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-on-surface-variant">
            Precio unitario
            <input
              className={inputClassName}
              type="number"
              min="0"
              step="0.01"
              value={precio}
              disabled={!editing}
              onChange={(event) => setPrecio(event.target.value)}
            />
          </label>

          <label className="text-xs text-on-surface-variant">
            Código QR
            <input className={inputClassName} value={ticket.codigoQr} disabled />
          </label>

          <label className="text-xs text-on-surface-variant">
            Evento
            <input className={inputClassName} value={ticket.evento.titulo} disabled />
          </label>

          <label className="text-xs text-on-surface-variant">
            Lugar
            <input className={inputClassName} value={ticket.evento.lugar} disabled />
          </label>

          <label className="text-xs text-on-surface-variant">
            Fecha del evento
            <input
              className={inputClassName}
              value={formatDate(ticket.evento.fechaHora)}
              disabled
            />
          </label>

          <label className="text-xs text-on-surface-variant">
            Espectador
            <input className={inputClassName} value={spectator} disabled />
          </label>

          <label className="text-xs text-on-surface-variant">
            Creado
            <input className={inputClassName} value={formatDate(ticket.createdAt)} disabled />
          </label>

          <label className="text-xs text-on-surface-variant sm:col-span-2 lg:col-span-1">
            Validación en puerta
            <input
              className={inputClassName}
              value={formatDate(ticket.fechaValidacionPuerta)}
              disabled
            />
          </label>
        </div>

        {editing && (
          <p className="border-t border-white/10 px-5 py-3 text-xs text-on-surface-variant">
            Los cambios son temporales; todavía no se envían al servidor.
          </p>
        )}
      </section>
    </section>
  );
}

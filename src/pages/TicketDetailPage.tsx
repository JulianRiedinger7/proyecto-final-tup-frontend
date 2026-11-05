import {
  getTicket,
  type PatchTicketPayload,
  TICKET_ESTADOS,
  type Ticket,
  type TicketEstado,
  patchTicket,
  deleteTicket,
} from "@/services/tickets";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

const estadoLabels: Record<TicketEstado, string> = {
  RESERVADO: "Reservado",
  CONFIRMADO: "Confirmado",
  UTILIZADO: "Utilizado",
  CANCELADO: "Cancelado",
};

const inputClassName =
  "mt-1.5 w-full rounded-md border border-white/15 bg-surface-container-high px-3 py-2 text-sm text-white outline-none focus:border-primary disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-surface-container-low disabled:text-on-surface-variant disabled:opacity-60";

const editableInputClassName =
  "border-primary/70 bg-primary/10 ring-1 ring-primary/25 disabled:cursor-default disabled:border-primary/70 disabled:bg-primary/10 disabled:text-white disabled:opacity-100";

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
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedFields, setUpdatedFields] = useState<PatchTicketPayload>({});

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
          setUpdatedFields({});
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
    setUpdatedFields({});
    setError(null);
    setEditing(false);
  }

  function startEditing() {
    if (!ticket) return;
    setEstado(ticket.estado);
    setUpdatedFields({});
    setError(null);
    setEditing(true);
  }

  function handleEstadoChange(nextEstado: TicketEstado) {
    setEstado(nextEstado);
    setError(null);
    setUpdatedFields((previous) => {
      const nextFields = { ...previous };
      if (nextEstado === ticket?.estado) {
        delete nextFields.estado;
      } else {
        nextFields.estado = nextEstado;
      }
      return nextFields;
    });
  }

  function registerValidationNow() {
    setUpdatedFields((previous) => ({
      ...previous,
      fechaValidacionPuerta: new Date().toISOString(),
    }));
    setError(null);
  }

  async function handleSaveChanges() {
    if (!ticket || saving) return;
    if (Object.keys(updatedFields).length === 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await patchTicket(ticket.id, updatedFields);
      if (response.code >= 400) {
        setError(response.msg || "No se pudo actualizar el ticket.");
        return;
      }

      if (!response.data) {
        setError("No se pudo actualizar el ticket.");
        return;
      }

      setTicket(response.data);
      setEstado(response.data.estado);
      setUpdatedFields({});
      setEditing(false);
    } catch (saveError) {
      console.error("Error al guardar los cambios del ticket:", saveError);
      setError("No se pudo actualizar el ticket.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTicket() {
    if (!ticket) return;
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.",
    );
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    try {
      const response = await deleteTicket(ticket.id);
      if (response.code >= 400) {
        setError(response.msg || "No se pudo eliminar el ticket.");
        return;
      }
      setTicket(null);
    } catch (deleteError) {
      console.error("Error al eliminar el ticket:", deleteError);
      setError("No se pudo eliminar el ticket.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="mx-auto max-w-5xl px-4 py-12 text-on-surface-variant" role="status">
        Cargando ticket...
      </p>
    );
  }

  if (!ticket) {
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
  const validationDate = updatedFields.fechaValidacionPuerta ?? ticket.fechaValidacionPuerta;

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
        <div className="flex gap-2">
          {!editing && (
            <button
              type="button"
              onClick={handleDeleteTicket}
              className="rounded-md border border-red-400/60 bg-red-400/10 px-4 py-2 text-sm text-red-200 hover:bg-red-400/20"
            >
              Eliminar
            </button>
          )}
          {editing ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                className="rounded-md border border-primary/60 bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="rounded-md border border-primary/60 px-4 py-2 text-sm text-primary hover:bg-primary/10"
            >
              Editar
            </button>
          )}
        </div>
      </header>

      {error && (
        <p
          className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}

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
            <span className="flex items-center justify-between">
              Estado
              {editing && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Editable
                </span>
              )}
            </span>
            <select
              className={`${inputClassName} ${editing ? editableInputClassName : ""}`}
              value={estado}
              disabled={!editing || saving}
              onChange={(event) => {
                if (isTicketEstado(event.target.value)) handleEstadoChange(event.target.value);
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
              value={ticket.precioUnitario}
              disabled
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

          <div
            className={`text-xs text-on-surface-variant sm:col-span-2 lg:col-span-1 ${
              editing ? "rounded-lg border border-primary/30 bg-primary/5 p-3" : ""
            }`}
          >
            <label htmlFor="validation-date" className="flex items-center justify-between">
              Validación en puerta
              {editing && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Editable
                </span>
              )}
            </label>
            <input
              id="validation-date"
              className={`${inputClassName} ${editing ? editableInputClassName : ""}`}
              value={formatDate(validationDate)}
              disabled
            />
            {editing && (
              <>
                <p className="mt-2 text-[11px] text-on-surface-variant">
                  Se registrará la fecha y hora actuales.
                </p>
                <button
                  type="button"
                  onClick={registerValidationNow}
                  disabled={saving}
                  className="mt-2 rounded-md border border-primary/50 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                >
                  {updatedFields.fechaValidacionPuerta
                    ? "Actualizar fecha a ahora"
                    : "Registrar fecha actual"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}

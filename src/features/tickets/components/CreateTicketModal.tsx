import { Modal } from "@/components/ui/Modal";
import { listEspectadores, type Espectador } from "@/services/espectadores";
import { listEventos, type Evento } from "@/services/eventos";
import { createTicket, type Ticket } from "@/services/tickets";
import { useEffect, useState, type FormEvent } from "react";

type CreateTicketModalProps = {
  onClose: () => void;
  onCreated: (ticket: Ticket) => void;
};

type FieldErrors = {
  eventoId?: string;
  espectadorId?: string;
};

const selectClassName =
  "mt-1.5 w-full rounded-md border border-white/15 bg-surface-container-high px-3 py-2.5 text-sm text-white outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60";

export function CreateTicketModal({ onClose, onCreated }: CreateTicketModalProps) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [espectadores, setEspectadores] = useState<Espectador[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [eventoId, setEventoId] = useState("");
  const [espectadorId, setEspectadorId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([listEventos({ page: 1, limit: 50 }), listEspectadores({ page: 1, limit: 50 })])
      .then(([eventosRes, espectadoresRes]) => {
        if (!active) return;

        if (eventosRes.code >= 400 || espectadoresRes.code >= 400) {
          setError(
            eventosRes.code >= 400
              ? eventosRes.msg || "No se pudieron cargar los eventos."
              : espectadoresRes.msg || "No se pudieron cargar los espectadores.",
          );
          return;
        }

        setEventos(eventosRes.data?.items ?? []);
        setEspectadores(espectadoresRes.data?.items ?? []);
      })
      .catch((loadError) => {
        if (!active) return;
        console.error("Error al cargar opciones:", loadError);
        setError("No se pudieron cargar los eventos y espectadores.");
      })
      .finally(() => {
        if (active) setLoadingOptions(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function validateForm(): boolean {
    const errors: FieldErrors = {};

    const parsedEventoId = Number(eventoId);
    if (!eventoId) {
      errors.eventoId = "Seleccioná un evento.";
    } else if (!Number.isInteger(parsedEventoId) || parsedEventoId < 1) {
      errors.eventoId = "El evento seleccionado no es válido.";
    }

    const parsedEspectadorId = Number(espectadorId);
    if (!espectadorId) {
      errors.espectadorId = "Seleccioná un espectador.";
    } else if (!Number.isInteger(parsedEspectadorId) || parsedEspectadorId < 1) {
      errors.espectadorId = "El espectador seleccionado no es válido.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || loadingOptions || !validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await createTicket({
        eventoId: Number(eventoId),
        espectadorId: Number(espectadorId),
      });

      if (response.code >= 400 || !response.data) {
        setError(response.msg || "No se pudo crear el ticket.");
        return;
      }

      onCreated(response.data);
      onClose();
    } catch (submitError) {
      console.error("Error al crear ticket:", submitError);
      setError("No se pudo crear el ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = loadingOptions || submitting;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Nuevo ticket"
      description="Seleccioná el evento y el espectador para emitir un ticket."
      disableClose={submitting}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && (
          <p
            className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        )}

        <label className="text-xs text-on-surface-variant">
          Evento
          <select
            value={eventoId}
            disabled={disabled || eventos.length === 0}
            onChange={(event) => {
              setEventoId(event.target.value);
              setFieldErrors((prev) => ({ ...prev, eventoId: undefined }));
              setError(null);
            }}
            className={`${selectClassName} ${fieldErrors.eventoId ? "border-red-400/70" : ""}`}
          >
            <option value="" className="bg-surface">
              {loadingOptions
                ? "Cargando eventos..."
                : eventos.length === 0
                  ? "No hay eventos disponibles"
                  : "Seleccioná un evento"}
            </option>
            {eventos.map((evento) => (
              <option key={evento.id} value={evento.id} className="bg-surface">
                {evento.titulo} — {evento.lugar}
              </option>
            ))}
          </select>
          {fieldErrors.eventoId && (
            <p className="mt-1.5 text-xs text-red-300">{fieldErrors.eventoId}</p>
          )}
        </label>

        <label className="text-xs text-on-surface-variant">
          Espectador
          <select
            value={espectadorId}
            disabled={disabled || espectadores.length === 0}
            onChange={(event) => {
              setEspectadorId(event.target.value);
              setFieldErrors((prev) => ({ ...prev, espectadorId: undefined }));
              setError(null);
            }}
            className={`${selectClassName} ${fieldErrors.espectadorId ? "border-red-400/70" : ""}`}
          >
            <option value="" className="bg-surface">
              {loadingOptions
                ? "Cargando espectadores..."
                : espectadores.length === 0
                  ? "No hay espectadores disponibles"
                  : "Seleccioná un espectador"}
            </option>
            {espectadores.map((espectador) => (
              <option key={espectador.id} value={espectador.id} className="bg-surface">
                {espectador.nombre} {espectador.apellido}
              </option>
            ))}
          </select>
          {fieldErrors.espectadorId && (
            <p className="mt-1.5 text-xs text-red-300">{fieldErrors.espectadorId}</p>
          )}
        </label>

        <div className="mt-2 flex justify-end gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={disabled || eventos.length === 0 || espectadores.length === 0}
            className="rounded-md bg-primary-container px-4 py-2 text-sm font-semibold text-surface hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Creando..." : "Crear ticket"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

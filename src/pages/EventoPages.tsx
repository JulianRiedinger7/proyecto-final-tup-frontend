import { EventoForm } from "@/features/eventos/components/EventoForm";
import { getEvento, type Evento } from "@/services/eventos";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

const valueClassName =
  "mt-1.5 block min-h-10 rounded-md border border-white/10 bg-surface-container-high px-3 py-2.5 text-sm text-white";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export function EventoFormPage() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/eventos" className="text-sm text-on-surface-variant hover:text-primary">
        ← Volver a cartelera
      </Link>
      <header className="mb-6 mt-6">
        <p className="mb-2 font-label-sm text-xs tracking-[0.18em] text-primary uppercase">
          Gestión de eventos
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Nuevo evento</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Completá los datos para sumar un evento a la cartelera.
        </p>
      </header>
      <div className="rounded-xl border border-white/10 bg-surface-container-low p-5 sm:p-7">
        <EventoForm
          onCancel={() => navigate("/eventos")}
          onSaved={(evento) => navigate(`/eventos/${evento.id}`)}
        />
      </div>
    </section>
  );
}

export function EventoDetailPage() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState<{
    id: number;
    evento: Evento | null;
    error: string | null;
  } | null>(null);
  const id = Number(eventoId);
  const validId = Boolean(eventoId) && Number.isInteger(id) && id > 0;
  const loading = validId && result?.id !== id;
  const evento = validId && result?.id === id ? result.evento : null;
  const error = validId && result?.id === id ? result.error : null;

  useEffect(() => {
    let active = true;
    if (!validId) {
      return () => {
        active = false;
      };
    }

    getEvento(id)
      .then((response) => {
        if (!active) return;
        if (response.code >= 400 || !response.data) {
          setResult({
            id,
            evento: null,
            error: response.msg || "No se pudo cargar el evento.",
          });
          return;
        }
        setResult({ id, evento: response.data, error: null });
      })
      .catch((loadError) => {
        if (!active) return;
        console.error("Error al cargar el detalle del evento:", loadError);
        setResult({ id, evento: null, error: "No se pudo cargar el evento." });
      });

    return () => {
      active = false;
    };
  }, [id, validId]);

  if (!validId) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link to="/eventos" className="text-sm text-on-surface-variant hover:text-primary">
          ← Volver a cartelera
        </Link>
        <p
          className="mt-6 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-red-200"
          role="alert"
        >
          El identificador del evento no es válido.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <p className="mx-auto max-w-5xl px-4 py-12 text-on-surface-variant" role="status">
        Cargando evento...
      </p>
    );
  }

  if (!evento) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link to="/eventos" className="text-sm text-on-surface-variant hover:text-primary">
          ← Volver a cartelera
        </Link>
        <p
          className="mt-6 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-red-200"
          role="alert"
        >
          {error ?? "No encontramos el evento solicitado."}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/eventos" className="text-sm text-on-surface-variant hover:text-primary">
        ← Volver a cartelera
      </Link>
      <header className="mb-6 mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 font-label-sm text-[10px] tracking-wider text-on-surface-variant uppercase">
            Cartelera / Evento #{evento.id}
          </p>
          <h1 className="text-3xl font-semibold text-white">{evento.titulo}</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Información del evento y capacidad de la sala.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md border border-primary/60 px-4 py-2 text-sm text-primary hover:bg-primary/10"
          >
            Editar evento
          </button>
        )}
      </header>

      {editing ? (
        <div className="rounded-xl border border-white/10 bg-surface-container-low p-5 sm:p-7">
          <EventoForm
            initialEvento={evento}
            onCancel={() => setEditing(false)}
            onSaved={(updatedEvento) => {
              setResult({ id, evento: updatedEvento, error: null });
              setEditing(false);
            }}
          />
        </div>
      ) : (
        <article className="overflow-hidden rounded-xl border border-white/10 bg-surface-container-low">
          <h2 className="border-b border-white/10 px-5 py-4 text-lg font-medium text-white">
            Detalle del evento
          </h2>
          <dl className="grid gap-x-5 gap-y-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2">
              <dt className="text-xs text-on-surface-variant">Descripción</dt>
              <dd className={valueClassName}>{evento.descripcion}</dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant">Fecha y hora</dt>
              <dd className={valueClassName}>{formatDate(evento.fechaHora)}</dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant">Sala o lugar</dt>
              <dd className={valueClassName}>{evento.lugar}</dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant">Aforo máximo</dt>
              <dd className={valueClassName}>{evento.aforoMaximo} personas</dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant">Cupo de reservas web</dt>
              <dd className={valueClassName}>{evento.cupoReservasWeb} personas</dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant">Precio de preventa</dt>
              <dd className={valueClassName}>
                {evento.precioPreventa.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant">Precio en puerta</dt>
              <dd className={valueClassName}>
                {evento.precioPuerta.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </dd>
            </div>
          </dl>
        </article>
      )}
    </section>
  );
}

import { useState, type FormEvent } from "react";
import { createEvento, patchEvento, type Evento, type EventoPayload } from "@/services/eventos";

type EventoFormProps = {
  initialEvento?: Evento;
  onCancel: () => void;
  onSaved: (evento: Evento) => void;
};

type FormValues = {
  titulo: string;
  descripcion: string;
  fechaHora: string;
  lugar: string;
  aforoMaximo: string;
  cupoReservasWeb: string;
  precioPreventa: string;
  precioPuerta: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const fieldClassName =
  "mt-1.5 w-full rounded-md border border-white/15 bg-surface-container-high px-3 py-2.5 text-sm text-white outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60";

function toLocalDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function getInitialValues(evento?: Evento): FormValues {
  return {
    titulo: evento?.titulo ?? "",
    descripcion: evento?.descripcion ?? "",
    fechaHora: evento ? toLocalDateTime(evento.fechaHora) : "",
    lugar: evento?.lugar ?? "",
    aforoMaximo: evento ? String(evento.aforoMaximo) : "",
    cupoReservasWeb: evento ? String(evento.cupoReservasWeb) : "0",
    precioPreventa: evento ? String(evento.precioPreventa) : "0",
    precioPuerta: evento ? String(evento.precioPuerta) : "0",
  };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.titulo.trim()) errors.titulo = "Ingresá el título del evento.";
  if (!values.descripcion.trim()) errors.descripcion = "Ingresá una descripción.";
  if (!values.fechaHora || Number.isNaN(new Date(values.fechaHora).getTime())) {
    errors.fechaHora = "Ingresá una fecha y hora válidas.";
  }
  if (!values.lugar.trim()) errors.lugar = "Ingresá la sala o lugar.";

  const aforo = Number(values.aforoMaximo);
  if (!values.aforoMaximo || !Number.isInteger(aforo) || aforo < 1) {
    errors.aforoMaximo = "El aforo debe ser un número entero mayor a cero.";
  }

  const cupoWeb = Number(values.cupoReservasWeb);
  if (!values.cupoReservasWeb || !Number.isInteger(cupoWeb) || cupoWeb < 0) {
    errors.cupoReservasWeb = "El cupo web debe ser un entero igual o mayor a cero.";
  } else if (Number.isInteger(aforo) && cupoWeb > aforo) {
    errors.cupoReservasWeb = "El cupo web no puede superar el aforo máximo.";
  }

  for (const [field, label] of [
    ["precioPreventa", "El precio de preventa"],
    ["precioPuerta", "El precio de puerta"],
  ] as const) {
    const price = Number(values[field]);
    if (values[field] === "" || !Number.isFinite(price) || price < 0) {
      errors[field] = `${label} debe ser igual o mayor a cero.`;
    }
  }

  return errors;
}

export function EventoForm({ initialEvento, onCancel, onSaved }: EventoFormProps) {
  const [values, setValues] = useState(() => getInitialValues(initialEvento));
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload: EventoPayload = {
      titulo: values.titulo.trim(),
      descripcion: values.descripcion.trim(),
      fechaHora: new Date(values.fechaHora).toISOString(),
      lugar: values.lugar.trim(),
      aforoMaximo: Number(values.aforoMaximo),
      cupoReservasWeb: Number(values.cupoReservasWeb),
      precioPreventa: Number(values.precioPreventa),
      precioPuerta: Number(values.precioPuerta),
    };

    setSubmitting(true);
    setError(null);
    try {
      const response = initialEvento
        ? await patchEvento(initialEvento.id, payload)
        : await createEvento(payload);

      if (response.code >= 400 || !response.data) {
        setError(response.msg || "No se pudo guardar el evento.");
        return;
      }
      onSaved(response.data);
    } catch (submitError) {
      console.error("Error al guardar el evento:", submitError);
      setError("No se pudo guardar el evento.");
    } finally {
      setSubmitting(false);
    }
  }

  function renderInput(
    field: keyof FormValues,
    label: string,
    type = "text",
    options?: { min?: number; step?: number; required?: boolean },
  ) {
    return (
      <label className="text-xs text-on-surface-variant">
        {label}
        <input
          type={type}
          min={options?.min}
          step={options?.step}
          required={options?.required ?? true}
          value={values[field]}
          onChange={(event) => updateField(field, event.target.value)}
          aria-invalid={Boolean(fieldErrors[field])}
          className={`${fieldClassName} ${fieldErrors[field] ? "border-red-400/70" : ""}`}
        />
        {fieldErrors[field] && (
          <span className="mt-1 block text-xs text-red-300">{fieldErrors[field]}</span>
        )}
      </label>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && (
        <p
          className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {renderInput("titulo", "Título")}
        {renderInput("lugar", "Sala o lugar")}
        {renderInput("fechaHora", "Fecha y hora", "datetime-local")}
        {renderInput("aforoMaximo", "Aforo máximo", "number", { min: 1, step: 1 })}
        {renderInput("cupoReservasWeb", "Cupo de reservas web", "number", { min: 0, step: 1 })}
        {renderInput("precioPreventa", "Precio de preventa", "number", { min: 0, step: 0.01 })}
        {renderInput("precioPuerta", "Precio en puerta", "number", { min: 0, step: 0.01 })}
        <label className="text-xs text-on-surface-variant sm:col-span-2">
          Descripción
          <textarea
            required
            rows={4}
            maxLength={500}
            value={values.descripcion}
            onChange={(event) => updateField("descripcion", event.target.value)}
            aria-invalid={Boolean(fieldErrors.descripcion)}
            className={`${fieldClassName} resize-y ${fieldErrors.descripcion ? "border-red-400/70" : ""}`}
          />
          {fieldErrors.descripcion && (
            <span className="mt-1 block text-xs text-red-300">{fieldErrors.descripcion}</span>
          )}
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary-container px-4 py-2 text-sm font-semibold text-surface hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Guardando..." : initialEvento ? "Guardar cambios" : "Crear evento"}
        </button>
      </div>
    </form>
  );
}

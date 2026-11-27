import { getEspectador, listEspectadores, type Espectador } from "@/services/espectadores";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { formatDate } from "./TicketDetailPage";

type Resultado = {
  clave: string;
  espectador: Espectador | null;
  items: Espectador[];
  error: string;
};

export function EspectadoresDetailPage() {
  const { espectadorId } = useParams<{ espectadorId: string }>();
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const clave = espectadorId ?? "todos";
  const id = espectadorId === undefined ? null : Number(espectadorId);
  const idInvalido = espectadorId !== undefined && (!Number.isInteger(id) || (id ?? 0) < 1);
  const actual = resultado?.clave === clave ? resultado : null;
  const loading = !actual && !idInvalido;
  const error = idInvalido
    ? "El identificador del espectador no es válido."
    : (actual?.error ?? "");
  const espectador = actual?.espectador ?? null;
  const espectadores = actual?.items ?? [];

  useEffect(() => {
    if (idInvalido) return;

    let activo = true;

    if (id !== null) {
      getEspectador(id)
        .then((response) => {
          if (!activo) return;
          setResultado({
            clave,
            espectador: response.code < 400 ? (response.data ?? null) : null,
            items: [],
            error: response.code >= 400 ? response.msg || "No se pudo cargar el espectador." : "",
          });
        })
        .catch(() => {
          if (activo) {
            setResultado({
              clave,
              espectador: null,
              items: [],
              error: "No se pudo cargar el espectador.",
            });
          }
        });

      return () => {
        activo = false;
      };
    }

    listEspectadores({ limit: 100 })
      .then((response) => {
        if (!activo) return;
        setResultado({
          clave,
          espectador: null,
          items: response.code < 400 ? (response.data?.items ?? []) : [],
          error:
            response.code >= 400 ? response.msg || "No se pudieron cargar los espectadores." : "",
        });
      })
      .catch(() => {
        if (activo) {
          setResultado({
            clave,
            espectador: null,
            items: [],
            error: "No se pudieron cargar los espectadores.",
          });
        }
      });

    return () => {
      activo = false;
    };
  }, [clave, id, idInvalido]);

  if (espectadorId !== undefined) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold !text-white">
          {espectador?.nombre} {espectador?.apellido}
        </h1>

        {loading && <p className="text-on-surface-variant">Cargando...</p>}
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {espectador && (
          <dl className="flex flex-col gap-2 rounded-xl border border-white/10 bg-surface-container-low p-5">
            {[
              ["ID", espectador.id],
              ["Email", espectador.email],
              ["DNI", espectador.dni],
              ["Creado", formatDate(espectador.createdAt)],
              ["Estado", espectador.isActive ? "Activo" : "Inactivo"],
            ].map(([label, valor]) => (
              <div
                key={String(label)}
                className="flex justify-between gap-4 border-b border-white/10 pb-2"
              >
                <dt className="text-sm text-on-surface-variant">{label}</dt>
                <dd className="text-white">{valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold !text-white">Espectadores inscriptos</h1>

      {loading && <p className="text-on-surface-variant">Cargando...</p>}
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container-low">
          <table className="w-full text-left">
            <thead className="bg-white/[0.03]">
              <tr className="border-b border-white/10">
                {["ID", "Nombre", "Apellido", "Email"].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-5 py-4 text-[10px] tracking-[0.14em] text-on-surface-variant uppercase"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {espectadores.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 text-sm text-on-surface">{item.id}</td>
                  <td className="px-5 py-4 text-sm text-on-surface">{item.nombre}</td>
                  <td className="px-5 py-4 text-sm text-on-surface">{item.apellido}</td>
                  <td className="px-5 py-4 text-sm text-on-surface">{item.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

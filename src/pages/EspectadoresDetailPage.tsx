import { listEspectadores, type Espectador } from "@/services/espectadores";
import { useEffect, useState } from "react";

export function EspectadoresDetailPage() {
  const [espectadores, setEspectadores] = useState<Espectador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    listEspectadores({ limit: 100 })
      .then((response) => {
        if (!activo) return;
        if (response.code >= 400 || !response.data) {
          setError(response.msg || "No se pudieron cargar los espectadores.");
          return;
        }
        setEspectadores(response.data.items);
      })
      .catch(() => {
        if (activo) setError("No se pudieron cargar los espectadores.");
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, []);

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
              {espectadores.map((espectador) => (
                <tr key={espectador.id}>
                  <td className="px-5 py-4 text-sm text-on-surface">{espectador.id}</td>
                  <td className="px-5 py-4 text-sm text-on-surface">{espectador.nombre}</td>
                  <td className="px-5 py-4 text-sm text-on-surface">{espectador.apellido}</td>
                  <td className="px-5 py-4 text-sm text-on-surface">{espectador.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

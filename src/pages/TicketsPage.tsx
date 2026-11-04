import { listTickets, type Ticket } from "@/services/tickets";
import { useEffect, useState } from "react";

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = () => {
      setLoading(true);
      setError(null);
      listTickets()
        .then((response) => {
          if (response.code >= 400) {
            setError(response.msg);
            return;
          }
          setTickets(response.data?.items ?? []);
        })
        .catch((error) => {
          console.error("Error al obtener tickets:", error);
          setError("No se pudieron cargar los tickets.");
        })
        .finally(() => setLoading(false));
    };

    fetchTickets();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-2 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-label-sm text-xs tracking-[0.18em] text-primary uppercase">
            Gestión
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Tickets</h1>
        </div>
        {!loading && !error && (
          <p className="font-label-sm text-xs tracking-wide text-on-surface-variant">
            {tickets.length} {tickets.length === 1 ? "TICKET" : "TICKETS"}
          </p>
        )}
      </header>

      {loading && (
        <p className="py-12 text-center text-on-surface-variant" role="status">
          Cargando tickets...
        </p>
      )}
      {error && (
        <p
          className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}
      {!loading && !error && tickets.length === 0 && (
        <p className="rounded-lg border border-white/10 bg-surface-container-low px-4 py-10 text-center text-on-surface-variant">
          No hay tickets disponibles.
        </p>
      )}
      {!loading && !error && tickets.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container-low shadow-2xl shadow-black/20">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-white/[0.03]">
              <tr className="border-b border-white/10">
                <th
                  scope="col"
                  className="px-5 py-4 font-label-sm text-[10px] tracking-[0.14em] text-on-surface-variant uppercase"
                >
                  Ticket
                </th>
                <th
                  scope="col"
                  className="px-5 py-4 font-label-sm text-[10px] tracking-[0.14em] text-on-surface-variant uppercase"
                >
                  Evento
                </th>
                <th
                  scope="col"
                  className="px-5 py-4 font-label-sm text-[10px] tracking-[0.14em] text-on-surface-variant uppercase"
                >
                  Espectador
                </th>
                <th
                  scope="col"
                  className="px-5 py-4 font-label-sm text-[10px] tracking-[0.14em] text-on-surface-variant uppercase"
                >
                  Precio
                </th>
                <th
                  scope="col"
                  className="px-5 py-4 font-label-sm text-[10px] tracking-[0.14em] text-on-surface-variant uppercase"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-5 py-4 text-right font-label-sm text-[10px] tracking-[0.14em] text-on-surface-variant uppercase"
                >
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-4">
                    <p className="font-label-sm text-sm text-white">#{ticket.id}</p>
                    <p className="mt-1 font-label-sm text-xs text-on-surface-variant">
                      {ticket.codigoQr}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-white">
                    {ticket.evento.titulo}
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface">
                    {ticket.espectador.nombre} {ticket.espectador.apellido}
                  </td>
                  <td className="px-5 py-4 font-label-sm text-sm text-white">
                    {ticket.precioUnitario.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-label-sm text-[10px] tracking-wide text-primary">
                      {ticket.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      disabled
                      aria-label={`Ver detalle del ticket ${ticket.id}`}
                      title="Disponible próximamente"
                      className="cursor-not-allowed rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-on-surface-variant/60"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

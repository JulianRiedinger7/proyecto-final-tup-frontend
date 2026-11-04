import { listTickets, type Ticket } from "@/services/tickets";
import { DataTable } from "@/components/ui/DataTable";
import { PageSizeSelector } from "@/components/ui/PageSizeSelector";
import { Pagination } from "@/components/Pagination";
import { useEffect, useState } from "react";

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ticketHeaders = ["Código QR", "Evento", "Espectador", "Precio", "Estado"];
  const ticketRows = tickets.map((ticket) => ({
    id: ticket.id,
    values: [
      ticket.codigoQr,
      ticket.evento.titulo,
      `${ticket.espectador.nombre} ${ticket.espectador.apellido}`,
      ticket.precioUnitario.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }),
      ticket.estado,
    ],
  }));

  useEffect(() => {
    let active = true;

    const fetchTickets = () => {
      setLoading(true);
      setError(null);
      listTickets({ page: currentPage, limit: pageSize })
        .then((response) => {
          if (!active) return;
          if (response.code >= 400) {
            setError(response.msg);
            return;
          }
          setTickets(response.data?.items ?? []);
          setTotalTickets(response.data?.total ?? 0);
        })
        .catch((error) => {
          if (!active) return;
          console.error("Error al obtener tickets:", error);
          setError("No se pudieron cargar los tickets.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    fetchTickets();

    return () => {
      active = false;
    };
  }, [currentPage, pageSize]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-2 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-label-sm text-xs tracking-[0.18em] text-primary uppercase">
            Gestión
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Tickets</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {!loading && !error && (
            <p className="font-label-sm text-xs tracking-wide text-on-surface-variant">
              {totalTickets} {totalTickets === 1 ? "TICKET" : "TICKETS"}
            </p>
          )}
          <PageSizeSelector
            value={pageSize}
            onChange={(newPageSize) => {
              setPageSize(newPageSize);
              setCurrentPage(1);
            }}
          />
        </div>
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
      {!loading && !error && (
        <>
          <DataTable entityName="tickets" headers={ticketHeaders} rows={ticketRows} />
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalTickets / pageSize)}
            handlePageChange={setCurrentPage}
            label="Paginación de tickets"
            className="mt-6"
          />
        </>
      )}
    </div>
  );
}

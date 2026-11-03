import { listTickets, type Ticket } from "@/services/tickets";
import { useEffect, useState } from "react";

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = () => {
      setLoading(true);
      listTickets()
        .then((response) => {
          if (response.code >= 400) {
            setError(response.msg);
            return;
          }
          setTickets(response.data?.items ?? []);
        })
        .catch((error) => console.error("Error fetching tickets:", error))
        .finally(() => setLoading(false));
    };

    fetchTickets();
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-center text-3xl font-bold text-white">Tickets</h1>
      {loading && <p className="text-center text-white">Cargando tickets...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}
      {!loading && !error && tickets.length === 0 && (
        <p className="text-center text-white">No hay tickets disponibles.</p>
      )}
      {!error && tickets.length > 0 && (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li
              key={ticket.id}
              className="rounded-lg border border-white/15 bg-white/5 p-4 text-white"
            >
              <p className="font-semibold">Ticket #{ticket.id}</p>
              <p>Evento: {ticket.eventoId}</p>
              <p>Código QR: {ticket.codigoQr}</p>
              <p>Precio: {ticket.precioUnitario}</p>
              <p>Estado: {ticket.estado}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

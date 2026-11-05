import type { ApiResponse, PaginatedData } from "@/types/api";

export const TICKET_ESTADOS = ["RESERVADO", "CONFIRMADO", "UTILIZADO", "CANCELADO"] as const;
export type TicketEstado = (typeof TICKET_ESTADOS)[number];

export type TicketEvento = {
  id: number;
  titulo: string;
  fechaHora: string;
  lugar: string;
};

export type TicketEspectador = {
  id: number;
  nombre: string;
  apellido: string;
};

export type Ticket = {
  id: number;
  codigoQr: string;
  precioUnitario: number;
  estado: TicketEstado;
  createdAt: string;
  fechaValidacionPuerta: string | null;
  evento: TicketEvento;
  espectador: TicketEspectador;
};

export type PatchTicketPayload = Partial<Pick<Ticket, "estado" | "fechaValidacionPuerta">>;

export type TicketSortBy =
  | "id"
  | "codigoQr"
  | "precioUnitario"
  | "estado"
  | "createdAt"
  | "fechaValidacionPuerta";

export type TicketListParams = {
  page?: number;
  limit?: number;
  sortBy?: TicketSortBy;
  sortOrder?: "asc" | "desc";
};

export async function listTickets(
  params: TicketListParams = {},
): Promise<ApiResponse<PaginatedData<Ticket>>> {
  try {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.sortBy !== undefined) query.set("sortBy", params.sortBy);
    if (params.sortOrder !== undefined) query.set("sortOrder", params.sortOrder);

    const queryString = query.size > 0 ? `?${query.toString()}` : "";
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets${queryString}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al obtener tickets:", error);
    return { msg: "Error al obtener tickets", code: 500 };
  }
}

export async function getTicket(id: number): Promise<ApiResponse<Ticket>> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${id}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al obtener ticket:", error);
    return { msg: "Error al obtener ticket", code: 500 };
  }
}

export async function patchTicket(
  id: number,
  updatedFields: PatchTicketPayload,
): Promise<ApiResponse<Ticket>> {
  try {
    const payload: PatchTicketPayload = {};
    if (updatedFields.estado !== undefined) payload.estado = updatedFields.estado;
    if (updatedFields.fechaValidacionPuerta !== undefined) {
      payload.fechaValidacionPuerta = updatedFields.fechaValidacionPuerta;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al actualizar ticket:", error);
    return { msg: "Error al actualizar ticket", code: 500 };
  }
}

import type { ApiResponse, PaginatedData } from "@/types/api";

export type Evento = {
  id: number;
  titulo: string;
  fechaHora: string;
  lugar: string;
};

export type EventoListParams = {
  page?: number;
  limit?: number;
};

export async function listEventos(
  params: EventoListParams = {},
): Promise<ApiResponse<PaginatedData<Evento>>> {
  try {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));

    const queryString = query.size > 0 ? `?${query.toString()}` : "";
    const res = await fetch(`${import.meta.env.VITE_API_URL}/eventos${queryString}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return { msg: "Error al obtener eventos", code: 500 };
  }
}

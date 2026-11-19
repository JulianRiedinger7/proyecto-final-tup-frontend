import type { ApiResponse, PaginatedData } from "@/types/api";

export type Evento = {
  id: number;
  titulo: string;
  descripcion: string;
  fechaHora: string;
  lugar: string;
  aforoMaximo: number;
  cupoReservasWeb: number;
  precioPreventa: number;
  precioPuerta: number;
};

export type EventoListParams = {
  page?: number;
  limit?: number;
  titulo?: string;
  lugar?: string;
  sortOrder?: "asc" | "desc";
};

export type EventoPayload = Omit<Evento, "id">;

export async function listEventos(
  params: EventoListParams = {},
): Promise<ApiResponse<PaginatedData<Evento>>> {
  try {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.titulo) query.set("titulo", params.titulo);
    if (params.lugar) query.set("lugar", params.lugar);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);

    const queryString = query.size > 0 ? `?${query.toString()}` : "";
    const res = await fetch(`${import.meta.env.VITE_API_URL}/eventos${queryString}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return { msg: "Error al obtener eventos", code: 500 };
  }
}

export async function getEvento(id: number): Promise<ApiResponse<Evento>> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/eventos/${id}`);
    return await res.json();
  } catch (error) {
    console.error("Error al obtener evento:", error);
    return { msg: "Error al obtener evento", code: 500 };
  }
}

export async function createEvento(payload: EventoPayload): Promise<ApiResponse<Evento>> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/eventos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error("Error al crear evento:", error);
    return { msg: "Error al crear evento", code: 500 };
  }
}

export async function patchEvento(
  id: number,
  payload: Partial<EventoPayload>,
): Promise<ApiResponse<Evento>> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/eventos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    return { msg: "Error al actualizar evento", code: 500 };
  }
}

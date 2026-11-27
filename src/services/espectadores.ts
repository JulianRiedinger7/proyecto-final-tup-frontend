import type { ApiResponse, PaginatedData } from "@/types/api";

export type Espectador = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
};

export type CreateEspectadorPayload = {
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
  createdAt: Date;
  isActive: boolean;
};

export type EspectadorListParams = {
  page?: number;
  limit?: number;
};

export async function listEspectadores(
  params: EspectadorListParams = {},
): Promise<ApiResponse<PaginatedData<Espectador>>> {
  try {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));

    const queryString = query.size > 0 ? `?${query.toString()}` : "";
    const res = await fetch(`${import.meta.env.VITE_API_URL}/espectadores${queryString}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al obtener espectadores:", error);
    return { msg: "Error al obtener espectadores", code: 500 };
  }
}

export async function getEspectador(id: number): Promise<ApiResponse<Espectador>> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/espectadores/${id}`);
    return await res.json();
  } catch (error) {
    console.error("Error al obtener espectador:", error);
    return { msg: "Error al obtener espectador", code: 500 };
  }
}

export type PatchEspectadorPayload = Partial<CreateEspectadorPayload>;

export async function patchEspectador(
  id: number,
  updatedFields: PatchEspectadorPayload,
): Promise<ApiResponse<Espectador>> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/espectadores/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFields),
    });
    return await res.json();
  } catch (error) {
    console.error("Error al actualizar espectador:", error);
    return { msg: "Error al actualizar espectador", code: 500 };
  }
}

export async function createEspectador(
  payload: CreateEspectadorPayload,
): Promise<ApiResponse<Espectador>> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/espectadores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al crear espectador:", error);
    return { msg: "Error al crear espectador", code: 500 };
  }
}

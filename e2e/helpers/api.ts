import { expect, type APIRequestContext } from "@playwright/test";

export const API_URL = process.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export type EventoCreado = { id: number; titulo: string };
export type EspectadorCreado = { id: number; nombre: string; apellido: string };

async function post<T>(request: APIRequestContext, path: string, data: object): Promise<T> {
  const res = await request.post(`${API_URL}${path}`, { data });
  expect(res.ok(), `POST ${path} falló: ${await res.text()}`).toBeTruthy();
  const body = (await res.json()) as { data: T };
  return body.data;
}

export function crearEventoFuturo(request: APIRequestContext, sufijo: string) {
  const dentroDeUnaSemana = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return post<EventoCreado>(request, "/eventos", {
    titulo: `Show E2E ${sufijo}`,
    descripcion: "Evento generado para prueba E2E de tickets",
    fechaHora: dentroDeUnaSemana.toISOString(),
    lugar: "Teatro E2E",
    aforoMaximo: 100,
    cupoReservasWeb: 50,
    precioPreventa: 15000,
    precioPuerta: 20000,
  });
}

export function crearEspectador(request: APIRequestContext, sufijo: string) {
  return post<EspectadorCreado>(request, "/espectadores", {
    nombre: "Lucia",
    apellido: `Test${sufijo}`,
    email: `e2e${sufijo}@test.com`,
    dni: `40${sufijo}`,
    telefono: `1144${sufijo}`,
  });
}

export async function eliminar(request: APIRequestContext, path: string) {
  await request.delete(`${API_URL}${path}`).catch(() => {});
}

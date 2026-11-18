import { expect, test, type Page } from "@playwright/test";
import {
  API_URL,
  crearEspectador,
  crearEventoFuturo,
  eliminar,
  type EspectadorCreado,
  type EventoCreado,
} from "./helpers/api";

const COLUMNAS = ["Código QR", "Evento", "Espectador", "Precio", "Estado", "Acción"];
const COLUMNA_ESTADO = COLUMNAS.indexOf("Estado");

type TicketCreado = { id: number; codigoQr: string; precioUnitario: number; estado: string };

function esperarRespuesta(page: Page, metodo: string, url: string) {
  return page.waitForResponse(
    (res) => res.request().method() === metodo && res.url().includes(url),
  );
}

async function buscarFilaTicket(page: Page, codigoQr: string) {
  const fila = page.locator("tbody tr", { hasText: codigoQr });
  const siguiente = page.getByRole("button", { name: "Página siguiente" });

  await expect(page.getByRole("table")).toBeVisible();

  const tamanioPagina = page.getByLabel("Cantidad por página");
  if ((await tamanioPagina.inputValue()) !== "50") {
    const recarga = esperarRespuesta(page, "GET", "/tickets");
    await tamanioPagina.selectOption("50");
    await recarga;
  }

  while ((await fila.count()) === 0 && (await siguiente.isVisible())) {
    if (await siguiente.isDisabled()) break;
    const otraPagina = esperarRespuesta(page, "GET", "/tickets");
    await siguiente.click();
    await otraPagina;
  }

  await expect(fila).toBeVisible();
  return fila;
}

test.describe("Tickets - flujo crítico", () => {
  let evento: EventoCreado | undefined;
  let espectador: EspectadorCreado | undefined;
  let ticketId: number | undefined;

  test.beforeEach(async ({ request }) => {
    const sufijo = Date.now().toString().slice(-6);
    evento = await crearEventoFuturo(request, sufijo);
    espectador = await crearEspectador(request, sufijo);
    ticketId = undefined;
  });

  test.afterEach(async ({ request }) => {
    if (ticketId) await eliminar(request, `/tickets/${ticketId}`);
    if (evento) await eliminar(request, `/eventos/${evento.id}`);
    if (espectador) await eliminar(request, `/espectadores/${espectador.id}`);
  });

  test("crear, ver en listado, confirmar y eliminar un ticket", async ({ page, request }) => {
    const { titulo } = evento!;
    const nombreEspectador = `${espectador!.nombre} ${espectador!.apellido}`;
    let ticket!: TicketCreado;

    await test.step("crear el ticket desde el modal", async () => {
      await page.goto("/tickets");
      await page.getByRole("button", { name: "Nuevo ticket" }).click();

      const modal = page.getByRole("dialog", { name: "Nuevo ticket" });
      await modal.getByLabel("Evento").selectOption(String(evento!.id));
      await modal.getByLabel("Espectador").selectOption(String(espectador!.id));

      const respuesta = esperarRespuesta(page, "POST", "/tickets");
      await modal.getByRole("button", { name: "Crear ticket" }).click();
      const res = await respuesta;

      expect(res.ok(), `POST /tickets falló: ${await res.text()}`).toBeTruthy();
      ticket = ((await res.json()) as { data: TicketCreado }).data;
      ticketId = ticket.id;

      expect(ticket.estado).toBe("RESERVADO");
      await expect(modal).toBeHidden();
      await expect(page.getByText(`Ticket #${ticket.id} creado correctamente.`)).toBeVisible();
    });

    await test.step("el ticket aparece en el listado como RESERVADO", async () => {
      await expect(page.getByRole("columnheader")).toHaveText(COLUMNAS);

      const fila = await buscarFilaTicket(page, ticket.codigoQr);
      const precio = ticket.precioUnitario.toLocaleString("es-AR", { maximumFractionDigits: 0 });

      await expect(fila.getByRole("cell")).toHaveText([
        ticket.codigoQr,
        titulo,
        nombreEspectador,
        new RegExp(precio.replace(".", "\\.")),
        "RESERVADO",
        "Ver detalle",
      ]);
    });

    await test.step("editar el estado a CONFIRMADO", async () => {
      const fila = await buscarFilaTicket(page, ticket.codigoQr);
      await fila.getByRole("button", { name: "Ver detalle" }).click();
      await expect(page).toHaveURL(`/tickets/${ticket.id}`);

      await page.getByRole("button", { name: "Editar" }).click();
      await page.getByLabel(/^Estado/).selectOption("CONFIRMADO");

      const respuesta = esperarRespuesta(page, "PATCH", `/tickets/${ticket.id}`);
      await page.getByRole("button", { name: "Guardar cambios" }).click();
      const res = await respuesta;
      expect(res.ok(), `PATCH falló: ${await res.text()}`).toBeTruthy();

      await page.reload();
      await expect(page.getByLabel(/^Estado/)).toHaveValue("CONFIRMADO");
    });

    await test.step("el listado muestra el ticket como CONFIRMADO", async () => {
      await page.getByRole("link", { name: /Volver a tickets/ }).click();

      const fila = await buscarFilaTicket(page, ticket.codigoQr);
      await expect(fila.getByRole("cell").nth(COLUMNA_ESTADO)).toHaveText("CONFIRMADO");
    });

    await test.step("eliminar el ticket", async () => {
      const fila = await buscarFilaTicket(page, ticket.codigoQr);
      await fila.getByRole("button", { name: "Ver detalle" }).click();

      page.once("dialog", (confirmacion) => confirmacion.accept());
      const respuesta = esperarRespuesta(page, "DELETE", `/tickets/${ticket.id}`);
      await page.getByRole("button", { name: "Eliminar" }).click();
      const res = await respuesta;
      expect(res.ok(), `DELETE falló: ${await res.text()}`).toBeTruthy();

      await expect(page.getByText("No encontramos el ticket solicitado.")).toBeVisible();
    });

    await test.step("el ticket ya no existe", async () => {
      await page.getByRole("link", { name: /Volver a tickets/ }).click();
      await expect(page.getByRole("table")).toBeVisible();
      await expect(page.locator("tbody tr", { hasText: ticket.codigoQr })).toHaveCount(0);

      const res = await request.get(`${API_URL}/tickets/${ticket.id}`);
      expect(res.status()).toBe(404);
      ticketId = undefined;
    });
  });
});

import { Pagination } from "@/components/Pagination";
import { PageSizeSelector } from "@/components/ui/PageSizeSelector";
import { listEventos, type Evento } from "@/services/eventos";
import { Download, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

const REPORT_PAGE_SIZE = 100;

function csvCell(value: string | number) {
  const text = String(value);
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function downloadCsv(eventos: Evento[]) {
  const headers = [
    "ID",
    "Título",
    "Descripción",
    "Fecha y hora",
    "Sala o lugar",
    "Aforo máximo",
    "Cupo reservas web",
    "Precio preventa",
    "Precio puerta",
  ];
  const rows = eventos.map((evento) => [
    evento.id,
    evento.titulo,
    evento.descripcion,
    evento.fechaHora,
    evento.lugar,
    evento.aforoMaximo,
    evento.cupoReservasWeb,
    evento.precioPreventa,
    evento.precioPuerta,
  ]);
  const content = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reporte-eventos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function EventosPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tituloInput, setTituloInput] = useState("");
  const [lugarInput, setLugarInput] = useState("");
  const [filters, setFilters] = useState({ titulo: "", lugar: "" });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    requestKey: string;
    eventos: Evento[];
    total: number;
    error: string | null;
  }>({ requestKey: "", eventos: [], total: 0, error: null });

  const requestKey = JSON.stringify([currentPage, pageSize, filters.titulo, filters.lugar]);
  const loading = result.requestKey !== requestKey;
  const error = loading ? null : result.error;
  const eventos = loading ? [] : result.eventos;
  const totalEventos = loading ? 0 : result.total;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters({ titulo: tituloInput.trim(), lugar: lugarInput.trim() });
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [tituloInput, lugarInput]);

  useEffect(() => {
    let active = true;

    listEventos({
      page: currentPage,
      limit: pageSize,
      titulo: filters.titulo,
      lugar: filters.lugar,
    })
      .then((response) => {
        if (!active) return;
        if (response.code >= 400 || !response.data) {
          setResult({
            requestKey,
            eventos: [],
            total: 0,
            error: response.msg || "No se pudieron cargar los eventos.",
          });
          return;
        }
        setResult({
          requestKey,
          eventos: response.data.items,
          total: response.data.total,
          error: null,
        });
      })
      .catch((loadError) => {
        if (!active) return;
        console.error("Error al obtener eventos:", loadError);
        setResult({
          requestKey,
          eventos: [],
          total: 0,
          error: "No se pudieron cargar los eventos.",
        });
      });

    return () => {
      active = false;
    };
  }, [currentPage, pageSize, filters, requestKey]);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      const firstResponse = await listEventos({
        page: 1,
        limit: REPORT_PAGE_SIZE,
        titulo: filters.titulo,
        lugar: filters.lugar,
      });
      if (firstResponse.code >= 400 || !firstResponse.data) {
        throw new Error(firstResponse.msg || "No se pudo generar el reporte.");
      }

      const allEventos = [...firstResponse.data.items];
      const pageCount = Math.ceil(firstResponse.data.total / REPORT_PAGE_SIZE);
      for (let page = 2; page <= pageCount; page += 1) {
        const response = await listEventos({
          page,
          limit: REPORT_PAGE_SIZE,
          titulo: filters.titulo,
          lugar: filters.lugar,
        });
        if (response.code >= 400 || !response.data) {
          throw new Error(response.msg || "No se pudo completar el reporte.");
        }
        allEventos.push(...response.data.items);
      }
      downloadCsv(allEventos);
    } catch (exportFailure) {
      console.error("Error al exportar el reporte de eventos:", exportFailure);
      setExportError(
        exportFailure instanceof Error ? exportFailure.message : "No se pudo generar el reporte.",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-label-sm text-xs tracking-[0.18em] text-primary uppercase">
            Gestión
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Cartelera</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Explorá y administrá los próximos eventos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!loading && !error && (
            <p className="font-label-sm text-xs tracking-wide text-on-surface-variant">
              {totalEventos} {totalEventos === 1 ? "EVENTO" : "EVENTOS"}
            </p>
          )}
          <PageSizeSelector
            value={pageSize}
            onChange={(newPageSize) => {
              setPageSize(newPageSize);
              setCurrentPage(1);
            }}
          />
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-primary/60 hover:text-primary disabled:opacity-50"
          >
            <Download aria-hidden="true" size={16} />
            {exporting ? "Exportando..." : "Exportar reporte"}
          </button>
          <Link
            to="/eventos/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
          >
            <Plus aria-hidden="true" size={16} />
            Nuevo evento
          </Link>
        </div>
      </header>

      <div className="mb-6 grid gap-3 rounded-xl border border-white/10 bg-surface-container-low p-4 sm:grid-cols-2">
        <label className="text-xs text-on-surface-variant">
          Buscar por título
          <span className="relative mt-1.5 block">
            <Search
              aria-hidden="true"
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="search"
              value={tituloInput}
              onChange={(event) => setTituloInput(event.target.value)}
              placeholder="Ej. Noche de Rock"
              className="w-full rounded-md border border-white/15 bg-surface-container-high py-2.5 pr-3 pl-9 text-sm text-white outline-none focus:border-primary"
            />
          </span>
        </label>
        <label className="text-xs text-on-surface-variant">
          Buscar por sala o lugar
          <span className="relative mt-1.5 block">
            <Search
              aria-hidden="true"
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="search"
              value={lugarInput}
              onChange={(event) => setLugarInput(event.target.value)}
              placeholder="Ej. Sala Cultural"
              className="w-full rounded-md border border-white/15 bg-surface-container-high py-2.5 pr-3 pl-9 text-sm text-white outline-none focus:border-primary"
            />
          </span>
        </label>
      </div>

      {exportError && (
        <p
          className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {exportError}
        </p>
      )}
      {loading && (
        <p className="py-12 text-center text-on-surface-variant" role="status">
          Cargando eventos...
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
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container-low shadow-2xl shadow-black/20">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-white/[0.03]">
                <tr className="border-b border-white/10">
                  {["Evento", "Fecha y hora", "Sala", "Aforo", "Cupo web", "Precio"].map(
                    (header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-5 py-4 font-label-sm text-[10px] tracking-[0.14em] text-on-surface-variant uppercase"
                      >
                        {header}
                      </th>
                    ),
                  )}
                  <th scope="col" className="px-5 py-4 text-right text-xs text-on-surface-variant">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {eventos.length > 0 ? (
                  eventos.map((evento) => (
                    <tr key={evento.id} className="transition-colors hover:bg-white/[0.025]">
                      <td className="px-5 py-4 text-sm font-medium text-white">{evento.titulo}</td>
                      <td className="px-5 py-4 text-sm text-on-surface">
                        {new Intl.DateTimeFormat("es-AR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(evento.fechaHora))}
                      </td>
                      <td className="px-5 py-4 text-sm text-on-surface">{evento.lugar}</td>
                      <td className="px-5 py-4 text-sm text-on-surface">{evento.aforoMaximo}</td>
                      <td className="px-5 py-4 text-sm text-on-surface">
                        {evento.cupoReservasWeb}
                      </td>
                      <td className="px-5 py-4 text-sm text-on-surface">
                        {evento.precioPreventa.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/eventos/${evento.id}`}
                          aria-label={`Ver detalle del evento ${evento.titulo}`}
                          className="inline-flex rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-on-surface-variant"
                    >
                      No hay eventos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalEventos / pageSize)}
            handlePageChange={setCurrentPage}
            label="Paginación de eventos"
            className="mt-6"
          />
        </>
      )}
    </section>
  );
}

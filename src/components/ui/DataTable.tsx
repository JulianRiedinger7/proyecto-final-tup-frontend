type DataTableProps = {
  entityName: string;
  headers: string[];
  rows: { id: string | number; values: string[] }[];
  onViewDetail?: (id: string | number) => void;
};

export function DataTable({ entityName, headers, rows, onViewDetail }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container-low shadow-2xl shadow-black/20">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead className="bg-white/[0.03]">
          <tr className="border-b border-white/10">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-5 py-4 font-label-sm text-[10px] tracking-[0.14em] text-on-surface-variant uppercase"
              >
                {header}
              </th>
            ))}
            <th
              scope="col"
              className="px-5 py-4 text-right font-label-sm text-[10px] tracking-[0.14em] text-on-surface-variant uppercase"
            >
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.07]">
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-white/[0.025]">
                {row.values.map((value, index) => (
                  <td key={`${row.id}-${index}`} className="px-5 py-4 text-sm text-on-surface">
                    {value}
                  </td>
                ))}
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    disabled={!onViewDetail}
                    onClick={() => onViewDetail?.(row.id)}
                    aria-label={`Ver detalle del registro ${row.id}`}
                    title={onViewDetail ? undefined : "Disponible próximamente"}
                    className="rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors enabled:hover:border-primary/50 enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length + 1}
                className="px-5 py-10 text-center text-sm text-on-surface-variant"
              >
                No hay {entityName} disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

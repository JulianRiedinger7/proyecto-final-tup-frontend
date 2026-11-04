type PageSizeSelectorProps = {
  value: number;
  onChange: (pageSize: number) => void;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function PageSizeSelector({ value, onChange }: PageSizeSelectorProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-on-surface-variant">
      <span>Mostrar</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Cantidad por página"
        className="rounded-md border border-white/15 bg-surface-container-low px-3 py-2 font-label-sm text-sm text-white outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
      >
        {PAGE_SIZE_OPTIONS.map((option) => (
          <option key={option} value={option} className="bg-surface">
            {option}
          </option>
        ))}
      </select>
      <span>por página</span>
    </label>
  );
}

import { ArrowLeft, ArrowRight } from "lucide-react";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  label?: string;
  className?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  handlePageChange,
  label = "Paginación",
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const pageButtonClass =
    "inline-flex size-10 items-center justify-center rounded-lg border border-[var(--color-surface-container-high)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tertiary)] disabled:cursor-not-allowed disabled:opacity-40 max-[380px]:size-8";
  const activePageClass =
    "border-[var(--color-primary-container)] bg-[var(--color-primary-container)] text-[var(--color-primary)] hover:text-[var(--color-surface)] font-bold";

  return (
    <nav
      aria-label={label}
      className={`flex items-center justify-center gap-2 ${className}`.trim()}
    >
      <button
        type="button"
        aria-label="Página anterior"
        className={pageButtonClass}
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ArrowLeft aria-hidden="true" size={16} />
      </button>

      <ul className="flex list-none items-center gap-1 p-0" aria-label="Páginas">
        {pages.map((page) => (
          <li key={page}>
            <button
              type="button"
              aria-label={`Ir a la página ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              className={`${pageButtonClass} ${page === currentPage ? activePageClass : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label="Página siguiente"
        className={pageButtonClass}
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        <ArrowRight aria-hidden="true" size={16} />
      </button>
    </nav>
  );
}

import { useState, type SetStateAction } from "react";

export type SortOrder = "asc" | "desc";

type UseFiltersOptions<TFilters> = {
  initialFilters: TFilters;
  initialLimit?: number;
  initialSortBy?: string;
  initialSortOrder?: SortOrder;
};

export function useFilters<TFilters>({
  initialFilters,
  initialLimit = 10,
  initialSortBy,
  initialSortOrder = "asc",
}: UseFiltersOptions<TFilters>) {
  const [filters, setFiltersState] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimitState] = useState(Math.max(1, Math.trunc(initialLimit)));
  const [sortBy, setSortByState] = useState(initialSortBy);
  const [sortOrder, setSortOrderState] = useState(initialSortOrder);

  function setFilters(nextFilters: SetStateAction<TFilters>) {
    setFiltersState(nextFilters);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    if (Number.isFinite(page)) {
      setCurrentPage(Math.max(1, Math.trunc(page)));
    }
  }

  function setLimit(nextLimit: number) {
    if (Number.isFinite(nextLimit) && nextLimit > 0) {
      setLimitState(Math.max(1, Math.trunc(nextLimit)));
      setCurrentPage(1);
    }
  }

  function setSorting(nextSortBy?: string, nextSortOrder: SortOrder = "asc") {
    setSortByState(nextSortBy);
    setSortOrderState(nextSortOrder);
    setCurrentPage(1);
  }

  return {
    filters,
    setFilters,
    currentPage,
    handlePageChange,
    limit,
    setLimit,
    sortBy,
    sortOrder,
    setSorting,
  };
}

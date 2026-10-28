# Hooks compartidos

Colocar aquí hooks usados por más de una funcionalidad. Los hooks específicos pertenecen al directorio de su funcionalidad.

## `useFilters`

Mantiene el estado de filtros, página, límite y orden. Al cambiar filtros, límite u orden, vuelve a la primera página. Cada vista usa esos valores para consultar su propia entidad.

```tsx
const { filters, setFilters, currentPage, handlePageChange, limit, sortBy, sortOrder } =
  useFilters<TicketFilters>({
    initialFilters: {},
    initialLimit: 10,
  });

const totalPages = Math.ceil(totalItems / limit);

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  handlePageChange={handlePageChange}
/>;
```

La vista o un hook específico de la entidad se encarga de solicitar los datos cuando cambian estos valores.

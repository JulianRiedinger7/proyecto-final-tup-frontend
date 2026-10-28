import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-semibold">Página no encontrada</h1>
      <p className="text-on-surface-variant">La dirección que abriste no existe.</p>
      <Link className="text-primary underline underline-offset-4" to="/">
        Volver al inicio
      </Link>
    </main>
  );
}

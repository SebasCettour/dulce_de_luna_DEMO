import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
    ? error.message
    : "Ha ocurrido un error inesperado.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 p-6">
      <div className="surface-card max-w-xl w-full p-8 text-center">
        <h1 className="text-3xl font-bold text-pink-700 mb-4">¡Uy! Algo salió mal</h1>
        <p className="text-slate-600 mb-6">{message}</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-pink-700 px-6 py-3 text-white font-semibold transition hover:bg-pink-800"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

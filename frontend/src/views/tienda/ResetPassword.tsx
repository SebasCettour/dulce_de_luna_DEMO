import { Link } from "react-router-dom";

export default function ResetPassword() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-50 p-6">
      <div className="surface-card max-w-md p-6 space-y-4">
        <h1 className="text-xl font-bold">Recuperación no disponible en la demo</h1>
        <p>La demo no utiliza contraseñas ni envía correos.</p>
        <Link className="text-pink-700 underline" to="/login">Volver a los accesos demo</Link>
      </div>
    </main>
  );
}

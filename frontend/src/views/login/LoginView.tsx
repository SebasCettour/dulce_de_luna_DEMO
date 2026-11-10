import { useNavigate } from "react-router-dom";
import useAuth from "../../context/AuthContext";
import { readDemo } from "../../demo/store";
import PageMeta from "../../components/PageMeta";

export default function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const enter = (role: "cliente" | "admin") => {
    const user = readDemo().users.find((item) => item.role === role && item.activo);
    if (!user) {
      alert("El usuario demo está desactivado. Restablecé los datos para recuperarlo.");
      return;
    }
    login("demo", user);
    navigate(role === "admin" ? "/admin" : "/tienda");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <PageMeta />
      <section className="surface-card w-full max-w-md p-8 text-center space-y-5">
        <h1 className="text-2xl font-bold text-pink-700">Tienda natural demo</h1>
        <p>Explorá la tienda o su panel de gestión. No ingreses datos personales.</p>
        <button className="btn-primary w-full" onClick={() => enter("cliente")}>
          Entrar como cliente demo
        </button>
        <button className="btn-primary w-full" onClick={() => enter("admin")}>
          Entrar como admin demo
        </button>
      </section>
    </main>
  );
}

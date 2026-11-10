import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import useAuth from "../../context/AuthContext";
import { apiFetch } from "../../api";

export default function Checkout() {
  const { cart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    if (!cart.length) {
      toast.error("El carrito está vacío");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/ventas", {
        method: "POST",
        body: JSON.stringify({
          cliente: user?.nombre ?? "Cliente Demo",
          productos: cart.map((item) => ({
            nombre: item.name, cantidad: item.quantity, precio: item.price,
          })),
          total,
          estado_pago: "pendiente",
          estado_envio: "pendiente",
          pago: "simulado",
          entrega: "simulada",
          direccion: null,
          notas: "",
        }),
      });
      clearCart();
      toast.success("Compra simulada guardada en este navegador. No se realizó ningún pago.");
      navigate("/tienda");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la compra simulada");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="surface-card max-w-2xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold text-pink-700">Checkout simulado</h1>
        <p>No se realiza ningún pago ni se envía ningún pedido.</p>
        <ul className="space-y-2">
          {cart.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toLocaleString("es-AR")}</span>
            </li>
          ))}
        </ul>
        <p className="font-bold">Total ficticio: ${total.toLocaleString("es-AR")}</p>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={confirm} disabled={saving || !cart.length}>
            {saving ? "Guardando..." : "Confirmar compra simulada"}
          </button>
          <button className="btn-primary" onClick={() => navigate("/tienda")}>Volver a la tienda</button>
        </div>
      </div>
    </main>
  );
}

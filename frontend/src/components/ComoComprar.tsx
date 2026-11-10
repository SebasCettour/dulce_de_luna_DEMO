import { X } from "lucide-react";
import { useAccessibleDialog } from "../hooks/useAccessibleDialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComoComprar({ isOpen, onClose }: Props) {
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="how-to-buy-title" className="relative bg-white w-[90%] max-w-md rounded-2xl shadow-2xl p-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 id="how-to-buy-title" className="text-lg font-bold text-pink-800">¿Cómo comprar?</h2>

          <button
            onClick={onClose}
            aria-label="Cerrar cómo comprar"
            className="p-1 rounded-full border border-transparent text-slate-700 hover:bg-slate-100 hover:border-pink-300 hover:text-pink-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="space-y-4 text-sm text-slate-700">
          <div className="flex gap-3">
            <span className="text-pink-800 font-bold">1.</span>
            <p>Elegí los productos que quieras comprar 🛒</p>
          </div>

          <div className="flex gap-3">
            <span className="text-pink-800 font-bold">2.</span>
            <p>Ajustá la cantidad o peso según necesites</p>
          </div>

          <div className="flex gap-3">
            <span className="text-pink-800 font-bold">3.</span>
            <p>
              Tocá en <strong>Agregar</strong> para sumar al carrito
            </p>
          </div>

          <div className="flex gap-3">
            <span className="text-pink-800 font-bold">4.</span>
            <p>Revisá tu carrito cuando quieras</p>
          </div>

          <div className="flex gap-3">
            <span className="text-pink-800 font-bold">5.</span>
            <p>Confirmá la compra simulada: no se envía ningún pedido ni se realiza ningún pago.</p>
          </div>
        </div>

        {/* FOOTER */}
        <button
          onClick={onClose}
          className="mt-6 w-full bg-pink-700 text-white py-2 rounded-xl hover:bg-pink-800 transition"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart, CartItem } from "../context/CartContext";
import { useAccessibleDialog } from "../hooks/useAccessibleDialog";
import toast from "react-hot-toast";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    total,
  } = useCart();

  const navigate = useNavigate();
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const formatQuantity = (item: CartItem) =>
    item.tipo_venta === "peso"
      ? item.quantity >= 1
        ? `${item.quantity.toFixed(2)} kg`
        : `${Math.round(item.quantity * 1000)} g`
      : `${item.quantity}`;

  const formatUnitPrice = (item: CartItem) =>
    item.tipo_venta === "peso"
      ? `${formatPrice(item.price)} / kg`
      : `${formatPrice(item.price)} c/u`;

  const formatLine = (item: CartItem) => {
    const qty =
      item.tipo_venta === "peso"
        ? item.quantity >= 1
          ? `${item.quantity.toFixed(2)} kg`
          : `${Math.round(item.quantity * 1000)} g`
        : `${item.quantity}`;

    return `${qty} × ${formatUnitPrice(item)}`;
  };

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  const handleRemove = (item: CartItem) => {
    if (window.confirm(`¿Querés quitar “${item.name}” del carrito?`)) {
      removeFromCart(item.id);
      toast.success(`${item.name} quitado del carrito`);
    }
  };

  const handleClear = () => {
    if (window.confirm("¿Querés vaciar todo el carrito?")) {
      clearCart();
      toast.success("Carrito vaciado");
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
    >
      {/* MODAL */}
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
        className="relative bg-white w-full max-h-[92vh] sm:h-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl
      rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in"
      >
        {/* HEADER */}
        <div className="p-4 sm:p-6 border-b">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-pink-700 text-white hover:bg-white hover:border-red-500 hover:text-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            ✕
          </button>

          <h2
            id="cart-modal-title"
            className="text-lg sm:text-2xl font-bold text-center text-pink-800"
          >
            Tu carrito
          </h2>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center text-slate-500 text-sm sm:text-base px-4 pb-10 sm:pb-14">
            Tu carrito está vacío 🛍️
            <button
              onClick={onClose}
              className="mt-8 px-6 py-2 rounded-full bg-pink-700 text-white text-xs sm:text-sm font-medium hover:bg-pink-800 transition tracking-wide"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            {/* LISTA */}
            <ul className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 space-y-3">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="bg-white border border-pink-100 rounded-2xl p-3 shadow-sm"
                >
                  <div className="flex justify-between gap-3">
                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                        {item.name}
                      </p>

                      <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                        {formatLine(item)}
                      </p>

                      {/* CONTROLES */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.id)}
                          aria-label={`Disminuir cantidad de ${item.name}`}
                          className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-pink-100 text-pink-800 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-700"
                        >
                          −
                        </button>

                        <span className="text-sm font-semibold min-w-[50px] text-center">
                          {formatQuantity(item)}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.id)}
                          aria-label={`Aumentar cantidad de ${item.name}`}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-700 text-white hover:bg-pink-800 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-700 focus-visible:ring-offset-2"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* PRECIO */}
                    <div className="flex flex-col items-end justify-between">
                      <div>
                        <p className="font-bold text-base sm:text-lg text-slate-800">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <p className="text-[11px] text-slate-400 text-right">
                          {formatUnitPrice(item)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        aria-label={`Quitar ${item.name} del carrito`}
                        className="text-xs text-slate-600 hover:text-red-600 underline underline-offset-2 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* FOOTER FIJO */}
            <div className="border-t bg-white p-4 sm:p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-semibold text-slate-700">
                  Total
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-pink-800">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-pink-700 text-white rounded-2xl font-semibold hover:bg-pink-800 transition"
              >
                Continuar compra
              </button>

              <button
                onClick={handleClear}
                className="w-full text-xs sm:text-sm text-slate-600 hover:text-red-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded"
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;

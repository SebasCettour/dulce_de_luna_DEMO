import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import useAuth from "./AuthContext";
import { DEMO_PREFIX } from "../demo/store";

// =========================
// 🧠 TIPADO
// =========================
export interface CartItem {
  id: string;
  name: string;
  price: number; // precio por kg o por unidad
  quantity: number; // cantidad en kg si tipo_venta="peso", o unidades si "unidad"
  tipo_venta: "unidad" | "peso";
  unidad_medida?: string;
  incremento?: number; // step para aumentar/disminuir (en la unidad enviada)
  cantidad_minima?: number; // mínimo a agregar (en la unidad enviada)
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (value: boolean) => void;
}

// =========================
// 🔥 HOOK INTERNO
// =========================
function useCartState(): CartContextType {
  const { user, isAuthenticated, loading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getCartKey = () => `${DEMO_PREFIX}cart_${user?.id}`;

  // Cargar carrito al montar, solo si hay user y ya no está cargando
  useEffect(() => {
    if (loading || !isAuthenticated || !user?.id) return;
    const stored = localStorage.getItem(getCartKey());
    setCart(stored ? JSON.parse(stored) : []);
  }, [user?.id, isAuthenticated, loading]);

  // Guardar carrito cada vez que cambia
  useEffect(() => {
    if (loading || !isAuthenticated || !user?.id) return;
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
  }, [cart, user?.id, isAuthenticated, loading]);

  // Sincronizar entre pestañas
  useEffect(() => {
    if (loading || !isAuthenticated || !user?.id) return;
    const syncCart = (e: StorageEvent) => {
      if (e.key === getCartKey()) {
        const stored = localStorage.getItem(getCartKey());
        setCart(stored ? JSON.parse(stored) : []);
      }
    };
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, [user?.id, isAuthenticated, loading]);

  // Helpers
  const getStep = (item: CartItem) =>
    item.tipo_venta === "peso" ? item.incremento || 0.1 : 1; // por defecto 100 g (0.1 kg)
  const getMin = (item: CartItem) =>
    item.tipo_venta === "peso" ? item.cantidad_minima || 0.1 : 1;

  // Actions
  const addToCart = useCallback((item: CartItem) => {
    const unit = item.unidad_medida?.toLowerCase();
    const weightFactor = item.tipo_venta === "peso" && unit === "g" ? 1 / 1000 : 1;
    const quantity =
      item.tipo_venta === "peso"
        ? Math.max(item.quantity * weightFactor, (item.cantidad_minima ?? 0.1) * weightFactor)
        : item.quantity || 1;
    const normalizedItem =
      item.tipo_venta === "peso"
        ? {
            ...item,
            quantity,
            unidad_medida: "kg",
            incremento: (item.incremento ?? 0.1) * weightFactor,
            cantidad_minima: (item.cantidad_minima ?? 0.1) * weightFactor,
          }
        : { ...item, quantity };

    setCart((prev) => {
      const existing = prev.find((i) => i.id === normalizedItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === normalizedItem.id
            ? {
                ...i,
                quantity: Number((i.quantity + normalizedItem.quantity).toFixed(3)),
              }
            : i,
        );
      }
      return [...prev, normalizedItem];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const increaseQuantity = useCallback((id: string) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id !== id
          ? i
          : { ...i, quantity: Number((i.quantity + getStep(i)).toFixed(3)) },
      ),
    );
  }, []);

  const decreaseQuantity = useCallback((id: string) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const newQty = i.quantity - getStep(i);
        return {
          ...i,
          quantity: newQty >= getMin(i) ? Number(newQty.toFixed(3)) : getMin(i),
        };
      }),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(
    () => cart.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [cart],
  );

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    total,
    isCartOpen,
    setIsCartOpen,
  };
}

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

// Provider
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cartState = useCartState();
  return (
    <CartContext.Provider value={cartState}>{children}</CartContext.Provider>
  );
};

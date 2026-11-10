import React, { useState, useMemo, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import Spinner from "./Spinner";

type Product = {
  id: number;
  name: string;
  price: number;
  categoria_nombre?: string;
  description?: string;
  tipo_venta?: "unidad" | "peso";
  unidad_medida?: string;
  incremento?: number;
  cantidad_minima?: number;
};

type BuscadorProps = {
  products: Product[];
  isLoading?: boolean;
  placeholder?: string;
};

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function fuzzyMatch(text: string, query: string) {
  let t = text.toLowerCase();
  let q = query.toLowerCase();
  let ti = 0;
  let qi = 0;

  while (ti < t.length && qi < q.length) {
    if (t[ti] === q[qi]) qi++;
    ti++;
  }

  return qi === q.length;
}

function getScore(product: Product, query: string) {
  const text =
    `${product.name} ${product.categoria_nombre} ${product.description}`
      .toLowerCase()
      .trim();

  const q = query.toLowerCase().trim();

  if (!text || !q) return 0;

  if (product.name.toLowerCase().startsWith(q)) return 4;
  if (product.name.toLowerCase().includes(q)) return 3;
  if (text.includes(q)) return 2;
  if (fuzzyMatch(text, q)) return 1;

  return 0;
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, query: string) {
  if (!query) return text;

  const safeQuery = escapeRegex(query);
  const regex = new RegExp(`(${safeQuery})`, "gi");

  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <strong key={i} className="text-pink-800">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

const Buscador: React.FC<BuscadorProps> = ({
  products,
  isLoading = false,
  placeholder = "Buscar producto...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const mappedProducts = useMemo(() => {
    return (products || []).map((p) => ({
      ...p,
      name: p.name?.trim() || "Producto sin nombre",
      price: typeof p.price === "number" ? p.price : 0,
      tipo_venta: p.tipo_venta || "unidad",
      unidad_medida: p.unidad_medida || "kg",
      incremento: p.incremento || 0.25,
      cantidad_minima: p.cantidad_minima || 0.25,
    }));
  }, [products]);

  const filteredResults = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];

    return mappedProducts
      .map((product) => ({
        product,
        score: getScore(product, debouncedSearchTerm),
      }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((p) => p.product);
  }, [mappedProducts, debouncedSearchTerm]);

  const showResults = isFocused && searchTerm.trim();

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 2000);
    return () => clearTimeout(t);
  }, [showToast]);

  return (
    <>
      <div className="relative w-full">
        {/* INPUT */}
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          disabled={isLoading}
          className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm sm:text-base
          rounded-full border border-pink-200 bg-white
          focus:ring-2 focus:ring-pink-400 outline-none transition"
        />

        {/* ICONO */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
          {isLoading ? <Spinner size={14} /> : "🔍"}
        </span>

        {/* RESULTADOS */}
        {showResults && (
          <div className="absolute left-0 right-0 top-full mt-2 z-[70]">
            <div className="max-h-64 sm:max-h-72 overflow-y-auto bg-white border border-pink-100 rounded-2xl shadow-xl">
              {filteredResults.length > 0 ? (
                filteredResults.map((product) => {
                  const safeId = String(product.id);

                  return (
                    <div
                      key={safeId}
                      className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3 hover:bg-pink-50 transition"
                    >
                      <div
                        onClick={() => navigate(`/producto/${safeId}`)}
                        className="cursor-pointer flex-1 min-w-0"
                      >
                        <div className="text-sm font-medium truncate">
                          {highlightText(product.name, searchTerm)}
                        </div>

                        <div className="text-xs text-gray-500">
                          ${product.price.toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          addToCart({
                            id: safeId,
                            name: product.name,
                            price: product.price,
                            quantity:
                              product.tipo_venta === "peso"
                                ? product.cantidad_minima || 0.25
                                : 1,
                            tipo_venta: product.tipo_venta!,
                            unidad_medida: product.unidad_medida,
                            incremento: product.incremento,
                            cantidad_minima: product.cantidad_minima,
                          });

                          setShowToast(true);
                        }}
                        className="h-8 w-8 sm:h-9 sm:w-9 text-sm rounded-full bg-pink-700 text-white flex items-center justify-center active:scale-95 transition hover:bg-pink-800"
                      >
                        +
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-sm text-gray-600 py-4">
                  Sin resultados
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Toast
        show={showToast}
        message="Producto agregado"
        onClose={() => setShowToast(false)}
        type="success"
      />
    </>
  );
};

export default Buscador;

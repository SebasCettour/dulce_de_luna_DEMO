import { useEffect, useState } from "react";
import { useCart, CartItem } from "../../context/CartContext";
import ReactModal from "react-modal";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl, uploadUrl } from "../../api";
import { buildFotoVariant } from "../../utils/media";
import { useAccessibleDialog } from "../../hooks/useAccessibleDialog";
import { demoFetch } from "../../demo/store";

type Product = {
  id: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  tipo_venta: "peso" | "unidad";
  unidad_medida?: string | null;
  cantidad_minima?: number | null;
  incremento?: number | null;
  imagen_url?: string | null;
};

export default function ProductDetail() {
  const { addToCart } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState<number | "">(1);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<"g" | "kg">("g");
  const [showPreview, setShowPreview] = useState(false);
  const [added, setAdded] = useState(false);
  const imageDialogRef = useAccessibleDialog<HTMLDivElement>(!!modalImg, () => setModalImg(null));

  useEffect(() => {
    if (!id) {
      setError("ID inválido");
      setLoading(false);
      return;
    }
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await demoFetch(apiUrl(`/products/${id}`), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Error en la respuesta");
        const data = await res.json();
        const normalized: Product = {
          id: data.id,
          name: data.name,
          description: data.description ?? "",
          price: Number(data.price ?? 0),
          stock: data.stock ?? 0,
          tipo_venta: data.tipo_venta || "unidad",
          unidad_medida: data.unidad_medida || "kg",
          cantidad_minima: Number(data.cantidad_minima ?? 0.1),
          incremento: Number(data.incremento ?? 0.1),
          imagen_url:
            data.imagen_url?.trim() && data.imagen_url !== "null"
              ? data.imagen_url
              : null,
        };
        setProduct(normalized);
      } catch (err: unknown) {
        if (!(err instanceof Error && err.name === "AbortError"))
          setError("No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    if (product.tipo_venta === "unidad") {
      setCantidad(1);
      return;
    }
    const unidad = product.unidad_medida === "kg" ? "kg" : "g";
    const factor = unidad === "kg" ? 1000 : 1;
    setUnidadSeleccionada(unidad);
    setCantidad(Math.max(1, (product.cantidad_minima ?? 0.1) * factor));
  }, [product]);

  const imageUrl = product?.imagen_url
    ? uploadUrl(product.imagen_url.trim())
    : "/default-category.jpg";

  const cantidadNumerica = cantidad === "" ? 0 : cantidad;
  const calculatedPrice = product
    ? product.tipo_venta === "peso"
      ? (cantidadNumerica / 1000) * product.price
      : cantidadNumerica * product.price
    : 0;

  const formatQuantity = () => {
    if (!product) return "";
    if (cantidad === "") return "";
    if (product.tipo_venta === "peso")
      return cantidad >= 1000
        ? `${(cantidad / 1000).toFixed(2)} kg`
        : `${cantidad} g`;
    return `${cantidad} u`;
  };

  const handleAddToCart = () => {
    if (!product) return;
    const cantidadParaAgregar =
      cantidad === "" ? cantidadMinimaEnGramos : cantidad;
    const item: CartItem = {
      id: String(product.id),
      name: product.name,
      price: product.price,
      quantity: cantidadParaAgregar,
      tipo_venta: product.tipo_venta,
      unidad_medida: product.tipo_venta === "peso" ? "g" : undefined,
      cantidad_minima:
        product.tipo_venta === "peso"
          ? (product.cantidad_minima ?? 0.1) *
            (product.unidad_medida === "kg" ? 1000 : 1)
          : undefined,
      incremento:
        product.tipo_venta === "peso"
          ? (product.incremento ?? 0.1) *
            (product.unidad_medida === "kg" ? 1000 : 1)
          : undefined,
    };
    addToCart(item);
    setAdded(true);
    setShowPreview(true);
    setTimeout(() => {
      setAdded(false);
      setShowPreview(false);
    }, 3000);
  };

  const cantidadMinimaEnGramos = product
    ? (product.cantidad_minima ?? 0.1) *
      (product.unidad_medida === "kg" ? 1000 : 1)
    : 0;

  // ── LOADING ──
  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );

  // ── ERROR ──
  if (error || !product)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-500 text-sm">
          {error || "Producto no encontrado"}
        </p>
        <button
          onClick={() => navigate("/tienda")}
          className="
    px-5 py-2.5
    text-sm font-semibold

    bg-pink-700 text-white
    rounded-md

    transition-all duration-200 ease-out

    hover:bg-white hover:text-pink-700
    hover:shadow-sm

    active:scale-95

    flex items-center justify-center gap-2
  "
        >
          Volver a la tienda
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white pb-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* BREADCRUMB */}
        <button
          onClick={() => navigate(-1)}
          className="
          rounded-md
    flex items-center gap-1
    text-sm font-medium
    text-slate-700
    hover:text-pink-800
    hover:bg-pink-100
    transition-colors duration-200
    mb-6
  "
        >
          ← Volver
        </button>

        {/* CARD PRINCIPAL */}
        <div className="surface-card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* ── IMAGEN ── */}
            <div className="bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-8 sm:p-12 min-h-[280px] sm:min-h-[380px]">
              <picture>
                <source srcSet={buildFotoVariant(product.imagen_url, "avif")} type="image/avif" />
                <source srcSet={buildFotoVariant(product.imagen_url, "webp")} type="image/webp" />
                <img
                  src={imageUrl}
                  alt={product.name}
                  width="720"
                  height="720"
                  fetchPriority="high"
                  className="max-h-[240px] sm:max-h-[320px] w-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300"
                  onClick={() => setModalImg(imageUrl)}
                />
              </picture>
            </div>

            {/* ── INFO ── */}
            <div className="flex flex-col p-6 sm:p-8 gap-4">
              {/* Nombre */}
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 leading-tight">
                  {product.name}
                </h1>
                {product.description && (
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Precio */}
              <div className="bg-pink-50 rounded-2xl p-4 flex flex-col gap-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {product.tipo_venta === "peso"
                    ? "Precio por kg"
                    : "Precio por unidad"}
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  $
                  {product.price.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <div className="h-px bg-pink-200 my-1" />
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Cantidad seleccionada
                </p>
                <p className="text-base font-semibold text-gray-700">
                  {formatQuantity()}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Total
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-pink-800">
                  $
                  {calculatedPrice.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Selector cantidad */}
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Cantidad
                </p>
                <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 w-fit">
                  <button
                    onClick={() =>
                      setCantidad(
                        product.tipo_venta === "peso"
                          ? Math.max(
                              (product.cantidad_minima ?? 0.1) *
                                (product.unidad_medida === "kg" ? 1000 : 1),
                              (cantidadNumerica || cantidadMinimaEnGramos) -
                                (product.incremento ?? 0.1) *
                                  (product.unidad_medida === "kg" ? 1000 : 1),
                            )
                          : Math.max(1, (cantidadNumerica || 1) - 1),
                      )
                    }
                    className="w-9 h-9 rounded-full bg-white shadow text-pink-800 font-bold text-xl flex items-center justify-center active:scale-90 transition"
                  >
                    −
                  </button>
                  {product.tipo_venta === "peso" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={
                          ((product.cantidad_minima ?? 0.1) *
                            (product.unidad_medida === "kg" ? 1000 : 1)) /
                            (unidadSeleccionada === "kg" ? 1000 : 1)
                        }
                        step={unidadSeleccionada === "kg" ? 0.01 : 1}
                        value={
                          cantidad === ""
                            ? ""
                            : cantidad /
                              (unidadSeleccionada === "kg" ? 1000 : 1)
                        }
                        placeholder="Cantidad"
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) =>
                          setCantidad(
                            event.target.value === ""
                              ? ""
                              : Number(event.target.value) *
                                (unidadSeleccionada === "kg" ? 1000 : 1),
                          )
                        }
                        className="w-24 border border-pink-200 rounded-lg px-2 py-1 text-center text-sm outline-none focus:ring-2 focus:ring-pink-300"
                      />
                      <select
                        value={unidadSeleccionada}
                        onChange={(event) =>
                          setUnidadSeleccionada(event.target.value as "g" | "kg")
                        }
                        className="border border-pink-200 rounded-lg px-2 py-1 text-sm bg-white outline-none focus:ring-2 focus:ring-pink-300"
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  ) : (
                    <span className="text-base font-semibold min-w-[72px] text-center text-gray-800">
                      {formatQuantity()}
                    </span>
                  )}
                  <button
                    onClick={() =>
                      setCantidad(
                        product.tipo_venta === "peso"
                          ? (cantidadNumerica || cantidadMinimaEnGramos) +
                            (product.incremento ?? 0.1) *
                              (product.unidad_medida === "kg" ? 1000 : 1)
                          : cantidadNumerica + 1,
                      )
                    }
                    className="w-9 h-9 rounded-full bg-pink-700 text-white font-bold text-xl flex items-center justify-center active:scale-90 transition hover:bg-pink-800"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botón agregar */}
              <button
                onClick={handleAddToCart}
                className={`
    w-full
    py-3.5
    rounded-md
    font-semibold
    text-sm sm:text-base
    flex items-center justify-center gap-2
    transition-all duration-300 ease-out
    shadow-sm hover:shadow-md
    active:scale-95
    transform-gpu

    ${
      added
        ? "bg-green-700 text-white"
        : "bg-pink-700 text-white hover:bg-pink-800"
    }
  `}
              >
                <span
                  className={`
      transition-all duration-300
      ${added ? "scale-110" : "scale-100"}
    `}
                >
                  {added ? "✔" : "🛒"}
                </span>

                <span className="transition-all duration-300">
                  {added ? "Agregado" : "Agregar al carrito"}
                </span>
              </button>

              {/* Stock */}
              {product.stock > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  {product.stock} unidades disponibles
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MINI PREVIEW ── */}
      <div
        className={`
        fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:bottom-6 sm:right-4
        w-[92vw] sm:w-72 z-[200]
        transition-all duration-300
        ${showPreview ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
      >
        <div className="bg-white shadow-2xl rounded-2xl p-4 border border-pink-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-500">✔</span>
            <p className="text-sm font-semibold text-pink-800">
              Agregado al carrito
            </p>
          </div>
          <p className="text-sm text-gray-700 font-medium line-clamp-1">
            {product.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatQuantity()} · $
            {calculatedPrice.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <button
            onClick={() => setShowPreview(false)}
            className="
    mt-3 w-full

    py-2.5
    rounded-md

    text-sm font-medium
    text-pink-800

    border border-pink-200
    bg-white/70 backdrop-blur

    hover:bg-pink-50 hover:border-pink-300

    active:scale-95
    transition-all duration-200

    shadow-sm hover:shadow-md
  "
          >
            Seguir comprando
          </button>
        </div>
      </div>

      {/* ── MODAL IMAGEN ── */}
      <ReactModal
        isOpen={!!modalImg}
        onRequestClose={() => setModalImg(null)}
        className="fixed inset-0 flex items-center justify-center z-[70] p-4"
        overlayClassName="fixed inset-0 bg-black/70 backdrop-blur-sm"
        ariaHideApp={false}
      >
        {modalImg && (
          <div ref={imageDialogRef} role="dialog" aria-modal="true" aria-labelledby="product-image-title" className="relative">
            <h2 id="product-image-title" className="sr-only">Vista ampliada del producto</h2>
            <img
              src={modalImg}
              alt={`Vista ampliada de ${product?.name ?? "producto"}`}
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
            />
            <button type="button" onClick={() => setModalImg(null)} aria-label="Cerrar imagen ampliada" className="absolute top-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-pink-700 text-white hover:bg-white hover:border-red-500 hover:text-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-300">
              ✕
            </button>
          </div>
        )}
      </ReactModal>
    </div>
  );
}

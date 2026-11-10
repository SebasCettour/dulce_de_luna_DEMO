import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useEffect, useMemo, useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import { useCategoryProducts } from "../../hooks/useCategoryProducts";
import { buildFotoSrc, buildFotoVariant } from "../../utils/media";
import WhatsAppBubble from "../../components/WhatsAppBubble";
import EmptyState from "../../components/EmptyState";
import { ProductGridSkeleton } from "../../components/Skeleton";

const PAGE_SIZE = 12;

export default function ProductsByCategory() {
  const { id } = useParams();
  const categoryId = id ? Number(id) : undefined;

  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [currentPage, setCurrentPage] = useState(1);
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const [cantidades, setCantidades] = useState<Record<number, number | "">>({});
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const {
    products: rawProducts = [],
    loading: loadingProductos,
    error: errorProductos,
  } = useCategoryProducts(categoryId);
  const {
    categories = [],
    loading: loadingCategorias,
    error: errorCategorias,
  } = useCategories();

  const productos = useMemo(() => {
    return rawProducts
      .map((p: any) => ({
        id: p.id_producto ?? p.id,
        nombre: p.nombre ?? p.name,
        precio: Number(p.precio ?? p.price ?? 0),
        foto: p.foto ?? p.imagen_url ?? "",
        tipo_venta: p.tipo_venta ?? "unidad",
        unidad_medida: p.unidad_medida ?? "unidad",
        cantidad_minima: p.cantidad_minima ?? 1,
        incremento: p.incremento ?? 1,
      }))
      .sort((a, b) =>
        ordenAscendente
          ? a.nombre.localeCompare(b.nombre)
          : b.nombre.localeCompare(a.nombre),
      );
  }, [rawProducts, ordenAscendente]);

  useEffect(() => {
    const initial: Record<number, number> = {};
    productos.forEach((p) => {
      initial[p.id] = p.cantidad_minima;
    });
    setCantidades(initial);
  }, [productos]);

  const categoriaNombre = useMemo(() => {
    const cat = categories.find((c) => c.id_categoria === categoryId);
    return cat?.nombre || "Categoría";
  }, [categories, categoryId]);

  const totalPages = Math.ceil(productos.length / PAGE_SIZE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return productos.slice(start, start + PAGE_SIZE);
  }, [productos, currentPage]);

  const loading = loadingProductos || loadingCategorias;
  const error = errorProductos || errorCategorias;

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, ordenAscendente]);

  const handleAddToCart = (producto: any) => {
    const cantidadIngresada = cantidades[producto.id];
    let cantidad =
      cantidadIngresada === "" || cantidadIngresada == null
        ? producto.cantidad_minima || 1
        : cantidadIngresada;
    addToCart({
      id: producto.id.toString(),
      name: producto.nombre,
      price: producto.precio,
      quantity: cantidad,
      tipo_venta: producto.tipo_venta,
      unidad_medida: producto.unidad_medida,
        cantidad_minima: producto.cantidad_minima,
        incremento: producto.incremento,
    });
    setAnimatingId(producto.id);
    setTimeout(() => setAnimatingId(null), 200);
    setPreviewItem(producto);
    setShowPreview(true);
    setTimeout(() => setShowPreview(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white pb-20">
      {/* ── TÍTULO ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <button
          onClick={() => navigate("/tienda")}
          className="flex items-center gap-1 text-slate-700 text-sm hover:text-pink-800 hover:bg-pink-100 transition mb-4 rounded-lg px-2 py-1"
        >
          ← Volver a categorías
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-700">
            {categoriaNombre}
          </h1>

          <button
            onClick={() => setOrdenAscendente((prev) => !prev)}
            className="btn-secondary self-start gap-2 text-xs sm:self-auto sm:text-sm"
          >
            <span>Orden:</span>
            <span className="font-semibold">
              {ordenAscendente ? "A → Z" : "Z → A"}
            </span>
          </button>
        </div>

        {!loading && !error && (
          <p className="text-xs text-gray-500 mt-1">
            {productos.length} producto{productos.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      {/* ── LOADING ── */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ProductGridSkeleton />
        </div>
      )}
      {/* ── ERROR ── */}
      {error && (
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600 shadow-sm">
          <p className="font-semibold">No pudimos cargar los productos</p>
          <p className="mt-1 text-red-500">{String(error)}</p>
          <p className="mt-3 text-xs text-red-400">
            Intenta volver a cargar la página o contacta al administrador si el
            problema continúa.
          </p>
        </div>
      )}
      {/* ── GRID ── */}
      {!loading && !error && (
        <>
          {paginatedProducts.length === 0 ? (
            <EmptyState title="No hay productos en esta categoría" description="Probá con otra categoría o volvé a intentarlo más tarde." />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {paginatedProducts.map((producto) => {
                  const cantidad = cantidades[producto.id] ?? 1;
                  const cantidadNumerica = cantidad === "" ? 0 : cantidad;
                  const cantidadEnKg =
                    producto.tipo_venta === "peso"
                      ? cantidadNumerica /
                        (producto.unidad_medida === "g" ? 1000 : 1)
                      : cantidadNumerica;
                  const precioSeleccionado = producto.precio * cantidadEnKg;
                  return (
                    <div
                      key={producto.id}
                      className="surface-card flex flex-col overflow-hidden"
                    >
                      {/* IMG */}
                      <div
                        className="w-full aspect-square bg-pink-50 flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/producto/${producto.id}`)}
                      >
                        <picture>
                          <source srcSet={buildFotoVariant(producto.foto, "thumb")} type="image/webp" />
                          <img
                            src={buildFotoSrc(producto.foto)}
                            alt={producto.nombre}
                            loading="lazy"
                            width="480"
                            height="480"
                          className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
                          />
                        </picture>
                      </div>

                      <div className="p-3 flex flex-col gap-2 flex-1">
                        <h2
                          className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 cursor-pointer hover:text-pink-800 transition"
                          onClick={() => navigate(`/producto/${producto.id}`)}
                        >
                          {producto.nombre}
                        </h2>

                        <p className="text-pink-800 font-bold text-sm sm:text-base">
                          ${producto.precio.toLocaleString("es-AR")}
                          {producto.tipo_venta === "peso" && (
                            <span className="text-xs font-normal text-gray-500 ml-1">
                              /kg
                            </span>
                          )}
                        </p>
                        <p className="rounded-lg border border-pink-200 bg-pink-50 px-2.5 py-2 text-sm font-semibold text-pink-800">
                          {producto.tipo_venta === "peso" ? (
                            <>
                              Comprás {cantidad} {producto.unidad_medida}
                              <span                               className="ml-1.5 font-extrabold text-pink-800">
                                = $
                                {precioSeleccionado.toLocaleString("es-AR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </>
                          ) : (
                            <>
                              Subtotal:
                              <span                               className="ml-1.5 font-extrabold text-pink-800">
                                $
                                {precioSeleccionado.toLocaleString("es-AR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </>
                          )}
                        </p>

                        {/* SELECTOR CANTIDAD */}
                        {producto.tipo_venta === "unidad" ? (
                          <div className="flex items-center justify-between bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                            <button
                              onClick={() =>
                                setCantidades((prev) => ({
                                  ...prev,
                                  [producto.id]: Math.max(
                                    producto.cantidad_minima,
                                    cantidadNumerica - 1,
                                  ),
                                }))
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-90 text-pink-800 font-bold text-lg"
                            >
                              −
                            </button>
                            <span className="text-sm font-semibold w-8 text-center">
                              {cantidad}
                            </span>
                            <button
                              onClick={() =>
                                setCantidades((prev) => ({
                                  ...prev,
                                  [producto.id]:
                                    cantidadNumerica + producto.incremento,
                                }))
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-700 text-white active:scale-90 font-bold text-lg shadow-sm hover:bg-pink-800"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">
                              Cantidad ({producto.unidad_medida})
                            </label>
                            <input
                              type="number"
                              min={producto.cantidad_minima}
                              step={producto.incremento}
                              value={cantidad}
                              onFocus={(e) => e.currentTarget.select()}
                              onChange={(e) =>
                                setCantidades((prev) => ({
                                  ...prev,
                                  [producto.id]:
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                }))
                              }
                              className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-300 outline-none"
                            />
                          </div>
                        )}

                        {/* BOTÓN AGREGAR */}
                        <button
                          onClick={() => handleAddToCart(producto)}
                          className={`
    mt-auto w-full
    text-sm font-semibold
    px-3 py-2 rounded-md

    bg-pink-700 text-white
    transition-all duration-200 ease-out

    hover:bg-pink-800 hover:text-white
    hover:shadow-sm

    active:scale-95

    flex items-center justify-center gap-2

    ${animatingId === producto.id ? "scale-95 bg-pink-900 text-white shadow-sm" : ""}
  `}
                        >
                          Agregar al carrito
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── PAGINACIÓN ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary text-sm disabled:opacity-40"
                  >
                    ← Anterior
                  </button>

                  <span className="text-sm text-gray-500">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="btn-secondary text-sm disabled:opacity-40"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {/* ── MINI PREVIEW ── */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:bottom-6 sm:right-4 z-[200]
          w-[92vw] sm:w-80
          transform transition-all duration-300
          ${showPreview ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        {previewItem && (
          <div className="bg-white shadow-2xl rounded-2xl p-4 border border-pink-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-500 text-lg">✔</span>
              <p className="text-sm text-pink-800 font-semibold">
                Producto agregado
              </p>
            </div>

            <p className="font-medium text-gray-800 text-sm line-clamp-1">
              {previewItem.nombre}
            </p>

                  <p className="text-xs text-gray-500 mt-0.5">
              {previewItem.tipo_venta === "peso"
                ? `${cantidades[previewItem.id]} g × $${previewItem.precio}/kg`
                : `${cantidades[previewItem.id]} × $${previewItem.precio}`}
            </p>

            <p className="text-base font-bold text-pink-800 mt-1">
              $
              {previewItem.tipo_venta === "peso"
                ? (
                    Number(cantidades[previewItem.id] || 0) / 1000 *
                    previewItem.precio
                  ).toLocaleString("es-AR", { minimumFractionDigits: 2 })
                : (
                    Number(cantidades[previewItem.id] || 0) * previewItem.precio
                  ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                }}
                className="flex-1 text-sm border border-pink-700 rounded-xl py-2 hover:bg-pink-800 transition hover:text-white text-white bg-pink-700 font-semibold"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        )}
      </div>
      <WhatsAppBubble />
    </div>
  );
}

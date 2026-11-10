import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/AuthContext";
import { lazyModal } from "../../components/LazyModal";

const ProductModal = lazyModal(() => import("../../components/ProductModal"));
import toast from "react-hot-toast";
import { apiFetch } from "../../api";
import { useQueryClient } from "@tanstack/react-query";
import type { DemoCategory as Categoria, DemoProduct as CategoryProduct } from "../../demo/store";

type ProductRow = Omit<CategoryProduct, "foto"> & {
  id_producto: number;
  categoria_ids: number[];
  activo: boolean;
  foto?: string | null;
};

// Quita acentos para que el buscador encuentre "organico" === "orgánico",
// "te" === "té", etc.
function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const ProductosCategoriasTable: React.FC = () => {
  const navigate = useNavigate();
  const { getAuthHeaders, logout } = useAuth();
  const queryClient = useQueryClient();

  const [data, setData] = useState<ProductRow[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);

  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [estadoFilter, setEstadoFilter] = useState("todos");

  useEffect(() => {
    apiFetch<Categoria[]>("/categories/admin", { headers: getAuthHeaders() })
      .then((data) =>
        setCategorias(
          [...data].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
        ),
      )
      .catch(() => setCategorias([]));
  }, [getAuthHeaders]);

  const loadProductos = useCallback(async () => {
    try {
      const json = await apiFetch<Array<Record<string, unknown>>>(
        "/products?includeInactive=true",
        {
          headers: getAuthHeaders(),
        },
      );

      setData(
        json.map(
          (p: Record<string, unknown>): ProductRow => ({
            id_producto: Number(p.id_producto ?? p.id ?? 0),
            nombre: String(p.nombre ?? p.name ?? ""),
            descripcion: String(p.descripcion ?? p.description ?? ""),
            precio: Number(p.precio ?? p.price ?? 0),
            stock: Number(p.stock ?? 0),
            foto: (p.foto as string | null) ?? null,

            categoria_ids: Array.isArray(p.categoria_ids)
              ? (p.categoria_ids as number[])
              : Array.isArray(p.categorias)
                ? (p.categorias as Array<Record<string, unknown>>)
                    .map((c) => Number(c.id_categoria ?? c.id))
                    .filter((n) => Number.isInteger(n) && n > 0)
                : [],

            activo: Boolean(p.activo),

            tipo_venta: p.tipo_venta === "peso" ? "peso" : "unidad",
            unidad_medida: p.unidad_medida as string | null,
            cantidad_minima: p.cantidad_minima as number | null,
            incremento: p.incremento as number | null,
          }),
        ),
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Sesión expirada")) {
          logout();
          navigate("/login");
          return;
        }

        if (error.message.includes("permiso")) {
          toast.error(error.message);
          return;
        }
      }

      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, logout, navigate]);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  const filteredData = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return data.filter((p) => {
      const matchSearch = normalizedSearch
        ? normalizeText(p.nombre).includes(normalizedSearch)
        : true;

      const matchCategoria =
        categoriaFilter === "todas"
          ? true
          : p.categoria_ids.includes(Number(categoriaFilter));

      const matchEstado =
        estadoFilter === "todos"
          ? true
          : estadoFilter === "activo"
            ? p.activo
            : !p.activo;

      return matchSearch && matchCategoria && matchEstado;
    });
  }, [data, search, categoriaFilter, estadoFilter]);

  const openCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (p: ProductRow) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const removeProduct = async (p: ProductRow) => {
    if (!window.confirm(`¿Eliminar ${p.nombre} de la demo?`)) return;
    try {
      await apiFetch(`/products/${p.id_producto}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await loadProductos();
      toast.success("Producto eliminado de la demo");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el producto");
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="p-2 sm:p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Productos</h1>

        <button
          onClick={openCreate}
          className="btn-primary w-full sm:w-auto"
        >
          + Nuevo producto
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="border p-2 rounded w-full sm:w-1/3"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded w-full sm:w-auto"
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
        >
          <option value="todas">Todas categorías</option>
          {categorias.map((c) => (
            <option key={c.id_categoria} value={c.id_categoria}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded w-full sm:w-auto"
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      {/* Contador de resultados, útil cuando hay filtros aplicados */}
      <p className="text-xs text-gray-500 sm:hidden">
        {filteredData.length}{" "}
        {filteredData.length === 1 ? "producto" : "productos"}
      </p>

      {/* ===================== VISTA MOBILE: CARDS ===================== */}
      <div className="space-y-3 sm:hidden">
        {filteredData.length === 0 && (
          <div className="text-center text-gray-500 py-8 border rounded">
            No se encontraron productos
          </div>
        )}

        {filteredData.map((p) => (
          <div
            key={p.id_producto}
            className="surface-card p-3"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-medium break-words">{p.nombre}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                    p.activo
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {p.activo ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Precio: ${p.precio}</span>
                <span>Stock: {p.stock}</span>
              </div>

              <button
                onClick={() => openEdit(p)}
                className="bg-blue-700 text-white px-3 py-2 rounded w-full mt-2 hover:bg-blue-800"
              >
                Editar
              </button>
              <button onClick={() => removeProduct(p)} className="text-red-700 ml-3">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== VISTA DESKTOP: TABLA ===================== */}
      <div className="hidden sm:block overflow-x-auto border rounded">
        <table className="w-full border-collapse min-w-[640px] text-sm sm:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left whitespace-nowrap">Nombre</th>
              <th className="p-2 text-left whitespace-nowrap">Precio</th>
              <th className="p-2 text-left whitespace-nowrap">Stock</th>
              <th className="p-2 text-left whitespace-nowrap">Estado</th>
              <th className="p-2 text-right whitespace-nowrap">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No se encontraron productos
                </td>
              </tr>
            )}

            {filteredData.map((p) => (
              <tr key={p.id_producto} className="border-t">
                <td className="p-2 min-w-[140px]">{p.nombre}</td>
                <td className="p-2">{p.precio}</td>
                <td className="p-2">{p.stock}</td>
                <td className="p-2">{p.activo ? "Activo" : "Inactivo"}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => openEdit(p)}
                    className="bg-blue-700 text-white px-2 py-1 rounded whitespace-nowrap hover:bg-blue-800"
                  >
                    Editar
                  </button>
                  <button onClick={() => removeProduct(p)} className="text-red-700 ml-3">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductModal
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        categorias={categorias}
        product={editingProduct}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          loadProductos();
        }}
      />
    </div>
  );
};

export default ProductosCategoriasTable;

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../context/AuthContext";
import type { DemoCategory as Categoria, DemoProduct } from "../demo/store";
import { demoFetch } from "../demo/store";
import { useAccessibleDialog } from "../hooks/useAccessibleDialog";

type ProductPayload = Omit<DemoProduct, "id_producto" | "categoria_ids"> & {
  organico?: boolean;
  vegan?: boolean;
  sin_tacc?: boolean;
};
interface ProductModalProps {
  show: boolean;
  onClose: () => void;
  categorias: Categoria[];
  onSaved: () => void;
  // Si viene un producto, el modal entra en modo edición
  product?: (Partial<Omit<ProductPayload, "foto">> & {
    id_producto: number;
    categoria_ids?: number[];
    foto?: string | null;
  }) | null;
}

type FormState = Omit<
  ProductPayload,
  "foto" | "organico" | "vegan" | "sin_tacc"
> & {
  categoria_ids: number[];
};

const inputClass =
  "border border-gray-300 rounded-lg px-3 h-10 w-full text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500";

const labelClass = "text-sm font-medium text-gray-700 block mb-1.5";

const emptyForm: FormState = {
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
  categoria_ids: [],
  activo: true,
  tipo_venta: "unidad",
  unidad_medida: "",
  cantidad_minima: 0,
  incremento: 0,
};

export default function ProductModal({
  show,
  onClose,
  categorias,
  onSaved,
  product,
}: ProductModalProps) {
  const { getAuthHeaders } = useAuth();
  const isEditing = Boolean(product?.id_producto);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentFoto, setCurrentFoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dialogRef = useAccessibleDialog<HTMLDivElement>(show, onClose);

  // Precarga el formulario cuando se abre en modo edición
  useEffect(() => {
    if (show && product) {
      setForm({
        nombre: product.nombre ?? "",
        descripcion: product.descripcion ?? "",
        precio: product.precio ?? 0,
        stock: product.stock ?? 0,
        categoria_ids: product.categoria_ids ?? [],
        activo: product.activo ?? true,
        tipo_venta: product.tipo_venta ?? "unidad",
        unidad_medida: product.unidad_medida ?? "",
        cantidad_minima: product.cantidad_minima ?? 0,
        incremento: product.incremento ?? 0,
      });
      setCurrentFoto(product.foto ?? null);
      setImageFile(null);
    } else if (show && !product) {
      setForm(emptyForm);
      setCurrentFoto(null);
      setImageFile(null);
    }
  }, [show, product]);

  if (!show) return null;

  const MAX_DIGITS = 6;

  const handleFormattedNumber = (field: "precio" | "stock", value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, MAX_DIGITS);
    setForm((prev) => ({ ...prev, [field]: clean === "" ? 0 : Number(clean) }));
  };

  const validate = () => {
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return false;
    }
    if (!form.categoria_ids.length) {
      toast.error("Seleccioná al menos una categoría");
      return false;
    }
    if (form.precio <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return false;
    }
    if (form.stock < 0) {
      toast.error("El stock no puede ser negativo");
      return false;
    }
    if (form.tipo_venta === "peso") {
      if (!form.unidad_medida) {
        toast.error("Seleccioná la unidad de venta a granel");
        return false;
      }
      if (form.cantidad_minima == null || form.cantidad_minima <= 0) {
        toast.error("La cantidad mínima debe ser mayor a 0");
        return false;
      }
      if (form.incremento == null || form.incremento <= 0) {
        toast.error("El incremento debe ser mayor a 0");
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("descripcion", form.descripcion || "");
      formData.append("precio", String(form.precio));
      formData.append("stock", String(form.stock));
      formData.append("categoria_ids", JSON.stringify(form.categoria_ids));
      formData.append("activo", String(form.activo));
      formData.append("tipo_venta", form.tipo_venta);

      if (form.tipo_venta === "peso") {
        formData.append("unidad_medida", form.unidad_medida || "");
        formData.append("cantidad_minima", String(form.cantidad_minima));
        formData.append("incremento", String(form.incremento));
      }

      if (imageFile) {
        formData.append("foto", imageFile);
      }

      const ah = getAuthHeaders() as Record<string, string>;
      const url = isEditing
        ? `/products/${product!.id_producto}`
        : "/products";

      const res = await demoFetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: ah.Authorization ? { Authorization: ah.Authorization } : {},
        body: formData,
      });

      if (!res.ok) throw new Error(`Error al ${isEditing ? "editar" : "crear"} producto`);

      toast.success(isEditing ? "Producto actualizado ✏️" : "Producto creado 🎉");
      onClose();
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = () => setForm((prev: FormState) => ({ ...prev, activo: !prev.activo }));

  const toggleCategoria = (id: number) => {
    setForm((prev: FormState) => {
      const yaEsta = prev.categoria_ids.includes(id);
      return {
        ...prev,
        categoria_ids: yaEsta
          ? prev.categoria_ids.filter((c: number) => c !== id)
          : [...prev.categoria_ids, id],
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="product-modal-title" className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="product-modal-title" className="text-lg font-bold text-gray-900">
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-pink-700 text-white hover:bg-white hover:border-red-500 hover:text-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-name" className={labelClass}>Nombre</label>
              <input
                id="product-name"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Manzana orgánica"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="product-description" className={labelClass}>Descripción</label>
              <input
                id="product-description"
                value={form.descripcion ?? ""}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Breve descripción del producto"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="product-photo" className={labelClass}>Foto</label>
            {currentFoto && !imageFile && (
              <div className="mb-2 flex items-center gap-3">
                <img
                  src={currentFoto}
                  alt="Foto actual"
                  className="w-16 h-16 object-cover rounded border"
                />
                <span className="text-xs text-gray-500">
                  Imagen de ejemplo de la demo
                </span>
              </div>
            )}
            <input
              id="product-photo"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-pink-100 file:text-pink-800 file:text-sm file:font-medium hover:file:bg-pink-200"
            />
            <p className="text-xs text-gray-600">La imagen elegida no se sube ni se guarda; se usa la imagen de ejemplo.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div>
              <label htmlFor="product-price" className={`${labelClass} min-h-[42px] flex items-end`}>
                Precio
              </label>
              <input
                id="product-price"
                value={form.precio || ""}
                onChange={(e) => handleFormattedNumber("precio", e.target.value)}
                placeholder="0"
                inputMode="numeric"
                maxLength={MAX_DIGITS}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="product-stock" className={`${labelClass} min-h-[42px] flex items-end`}>
                {form.tipo_venta === "peso"
                  ? "Stock disponible (gramos)"
                  : "Stock disponible (unidades)"}
              </label>
              <input
                id="product-stock"
                value={form.stock || ""}
                onChange={(e) => handleFormattedNumber("stock", e.target.value)}
                placeholder="0"
                inputMode="numeric"
                maxLength={MAX_DIGITS}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-pink-100 bg-pink-50/50 p-4">
            <div>
              <label htmlFor="product-sale-type" className={labelClass}>Modalidad de venta</label>
              <select
                id="product-sale-type"
                value={form.tipo_venta}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tipo_venta: e.target.value as FormState["tipo_venta"],
                  })
                }
                className={inputClass}
              >
                <option value="unidad">Por unidad</option>
                <option value="peso">A granel</option>
              </select>
            </div>

            {form.tipo_venta === "peso" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="product-weight-unit" className={labelClass}>Unidad de peso</label>
                  <select
                    id="product-weight-unit"
                    value={form.unidad_medida || ""}
                    onChange={(e) =>
                      setForm({ ...form, unidad_medida: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="" disabled>
                      -- Seleccionar --
                    </option>
                    <option value="g">Gramos</option>
                    <option value="kg">Kilos</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="product-min-quantity" className={labelClass}>Cantidad mínima</label>
                  <input
                    id="product-min-quantity"
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.cantidad_minima || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cantidad_minima: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="product-increment" className={labelClass}>Incremento</label>
                  <input
                    id="product-increment"
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.incremento || ""}
                    onChange={(e) =>
                      setForm({ ...form, incremento: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Categorías{" "}
              <span className="font-normal text-gray-400">
                ({form.categoria_ids.length} seleccionada
                {form.categoria_ids.length === 1 ? "" : "s"})
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => {
                const seleccionada = form.categoria_ids.includes(c.id_categoria);
                return (
                  <button
                    key={c.id_categoria}
                    type="button"
                    onClick={() => toggleCategoria(c.id_categoria)}
                    aria-pressed={seleccionada}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      seleccionada
                        ? "bg-pink-700 text-white border-pink-700 hover:bg-pink-800"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-pink-700 hover:border-pink-700 hover:text-white"
                    }`}
                  >
                    {c.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className={labelClass}>Estado</span>
            <label
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-colors ${
                form.activo
                  ? "bg-pink-50 border-pink-300 text-pink-700"
                  : "bg-white border-gray-300 text-gray-700 hover:border-pink-300"
              }`}
            >
              <input
                type="checkbox"
                checked={form.activo}
                onChange={toggleActivo}
                className="accent-pink-600"
              />
              Activo
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-pink-700 text-white hover:bg-pink-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </div>
    </div>
  );
}
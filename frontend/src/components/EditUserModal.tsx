import { useState, useEffect } from "react";
import { useAccessibleDialog } from "../hooks/useAccessibleDialog";

export type UserFormData = {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  codigo_postal?: string;
  role?: string;
};

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void> | void;
  initialData?: UserFormData;
  isAdmin?: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isAdmin = false,
}) => {
  const [form, setForm] = useState<UserFormData>({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigo_postal: "",
    role: "cliente",
  });

  const [loading, setLoading] = useState(false);
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (initialData && isOpen) {
      setForm({
        nombre: initialData.nombre || "",
        email: initialData.email || "",
        telefono: initialData.telefono || "",
        direccion: initialData.direccion || "",
        ciudad: initialData.ciudad || "",
        codigo_postal: initialData.codigo_postal || "",
        role: initialData.role || "cliente",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="edit-user-title" className="bg-white w-full h-[90vh] sm:h-auto sm:max-w-lg md:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-xl p-4 sm:p-6 relative overflow-y-auto">
        {/* ❌ Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-pink-700 text-white hover:bg-white hover:border-red-500 hover:text-red-700 transition text-lg focus:outline-none focus:ring-2 focus:ring-red-300"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h2 id="edit-user-title" className="text-xl sm:text-2xl font-bold text-pink-700 mb-4 sm:mb-6">
          Editar Usuario
        </h2>
        <p className="mb-3 text-sm text-pink-800">Usá únicamente datos ficticios; se guardan en este navegador.</p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        >
          {/* Nombre */}
          <input
            id="edit-user-nombre"
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            className="border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-pink-400 col-span-1 sm:col-span-2"
            required
          />
          <label htmlFor="edit-user-nombre" className="sr-only">Nombre</label>

          {/* Email */}
          <input
            id="edit-user-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-pink-400 col-span-1 sm:col-span-2"
            disabled={!isAdmin}
            required
          />
          <label htmlFor="edit-user-email" className="sr-only">Email</label>

          {/* Teléfono */}
          <input
            id="edit-user-telefono"
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Teléfono"
            className="border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-pink-400"
          />
          <label htmlFor="edit-user-telefono" className="sr-only">Teléfono</label>

          {/* Ciudad */}
          <input
            id="edit-user-ciudad"
            type="text"
            name="ciudad"
            value={form.ciudad}
            onChange={handleChange}
            placeholder="Ciudad"
            className="border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-pink-400"
          />
          <label htmlFor="edit-user-ciudad" className="sr-only">Ciudad</label>

          {/* Dirección */}
          <input
            id="edit-user-direccion"
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Dirección"
            className="border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-pink-400 col-span-1 sm:col-span-2"
          />
          <label htmlFor="edit-user-direccion" className="sr-only">Dirección</label>

          {/* Código Postal */}
          <input
            id="edit-user-codigo-postal"
            type="text"
            name="codigo_postal"
            value={form.codigo_postal}
            onChange={handleChange}
            placeholder="Código Postal"
            className="border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-pink-400"
          />
          <label htmlFor="edit-user-codigo-postal" className="sr-only">Código Postal</label>

          {/* Rol */}
          {isAdmin && (
            <>
              <select
                id="edit-user-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-pink-400"
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
              </select>
              <label htmlFor="edit-user-role" className="sr-only">Rol</label>
            </>
          )}

          {/* Botón */}
          <div className="col-span-1 sm:col-span-2 mt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                loading
                  ? "bg-pink-300 cursor-not-allowed"
                  : "bg-pink-700 hover:bg-pink-800 text-white"
              }`}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;

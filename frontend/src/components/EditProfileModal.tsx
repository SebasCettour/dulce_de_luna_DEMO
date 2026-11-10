import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import useAuth from "../context/AuthContext";
import toast from "react-hot-toast";
import { apiUrl } from "../api";
import { useAccessibleDialog } from "../hooks/useAccessibleDialog";
import { demoFetch } from "../demo/store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: Props) {
  const { user, getAuthHeaders, updateUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isOpen, onClose);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigo_postal: "",
  });

  useEffect(() => {
    if (!isOpen || !user) return;

    setForm({
      nombre: user.nombre || "",
      email: user.email || "",
      telefono: user.telefono || "",
      direccion: user.direccion || "",
      ciudad: user.ciudad || "",
      codigo_postal: user.codigo_postal || "",
    });
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setLoading(true);

      const res = await demoFetch(apiUrl(`/users/${user.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      let updatedUser;

      try {
        updatedUser = await res.json();
      } catch {
        updatedUser = { ...user, ...form };
      }

      updateUser(updatedUser);

      toast.success("Datos actualizados ✅");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  // Renderizamos en portal con z-index mayor
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="surface-card w-full max-w-md p-6 relative">
        <p className="mb-3 text-sm text-pink-800">Usá únicamente datos ficticios; se guardan en este navegador.</p>
        {/* cerrar */}
        <button
          onClick={onClose}
          className="btn-icon absolute right-3 top-3 bg-pink-700 text-white hover:bg-white hover:border-red-500 hover:text-red-700"
          aria-label="Cerrar"
        >
          ✖
        </button>

        <h2 id="edit-profile-title" className="text-xl font-semibold text-pink-700 mb-4">
          Editar Datos
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {Object.entries(form).map(([key, value]) => (
            <div key={key}>
              <label htmlFor={`edit-profile-${key}`} className="sr-only">
                {key.replace("_", " ")}
              </label>
              <input
                id={`edit-profile-${key}`}
                name={key}
                type="text"
                placeholder={key.replace("_", " ")}
                value={value}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="input-base"
              />
            </div>
          ))}

          <button
            disabled={loading}
            className="w-full bg-pink-700 text-white py-2.5 rounded-lg flex justify-center hover:bg-pink-800"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

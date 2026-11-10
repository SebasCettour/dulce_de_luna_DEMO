import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/AuthContext";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";
import type { UserFormData } from "../../components/EditUserModal";
import { lazyModal } from "../../components/LazyModal";

const EditUserModal = lazyModal(() => import("../../components/EditUserModal"));
import { apiFetch } from "../../api";

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  role: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  codigo_postal?: string;
  activo: boolean; // 👈 NUEVO
};

const GestionUsuarios: React.FC = () => {
  const { getAuthHeaders, logout } = useAuth();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // 🔄 Cargar usuarios
  const loadUsuarios = useCallback(async () => {
    try {
      const data = await apiFetch<Usuario[]>("/users", {
        headers: getAuthHeaders(),
      });

      setUsuarios(data);
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

      console.error(error);
      toast.error("Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, logout, navigate]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  // 🔑 Reset password
  const handleResetPassword = async (id: number) => {
    if (!window.confirm("La demo no utiliza contraseñas. ¿Continuar con la simulación?")) return;

    try {
      await apiFetch(`/users/${id}/reset-password`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      toast.success("Simulación completada; no existe una contraseña real");
    } catch {
      toast.error("Error al resetear contraseña");
    }
  };

  // ✏️ Update user
  const handleUpdateUser = async (data: UserFormData) => {
    if (!selectedUser) return;

    try {
      await apiFetch(`/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      toast.success("Usuario actualizado");
      setIsEditOpen(false);
      loadUsuarios();
    } catch {
      toast.error("Error al actualizar usuario");
    }
  };

  // 🔁 Activar / Desactivar (SOFT DELETE)
  const toggleActivo = async (user: Usuario) => {
    const accion = user.activo ? "desactivar" : "activar";

    if (!window.confirm(`¿Seguro que querés ${accion} este usuario?`)) return;

    try {
      await apiFetch(`/users/${user.id}/toggle-active`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      toast.success(`Usuario ${user.activo ? "desactivado" : "activado"}`);
      loadUsuarios();
    } catch {
      toast.error("Error al cambiar estado del usuario");
    }
  };

  // 🔍 FILTRO
  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.nombre} ${u.email} ${u.role} ${u.telefono} ${u.direccion} ${u.ciudad}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  if (loading) return <Spinner className="py-12" size={40} />;

  return (
    <div className="min-h-screen bg-pink-100/60 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="btn-primary order-2 self-start text-sm sm:order-1 sm:self-auto sm:text-base"
          >
            ← Volver
          </button>

          <h1 className="order-1 sm:order-2 text-2xl sm:text-3xl font-bold text-pink-700 text-center sm:flex-1">
            Gestión de Usuarios
          </h1>

          <div className="hidden sm:block sm:order-3 sm:w-[110px]" />
        </div>

        {/* CONTENEDOR */}
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 border">
          {/* BUSCADOR */}
          <div className="mb-6 flex flex-col md:flex-row gap-3 md:gap-4 md:items-center md:justify-between">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
            />

            <span className="text-sm text-gray-500">
              {usuariosFiltrados.length} usuarios encontrados
            </span>
          </div>

          {/* LISTA */}
          {usuariosFiltrados.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No se encontraron usuarios
            </div>
          ) : (
            <>
              {/* VISTA TARJETAS - MÓVIL */}
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {usuariosFiltrados.map((u) => (
                  <div
                    key={u.id}
                    className="surface-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {u.nombre}
                        </p>
                        <p className="text-xs text-gray-500 break-all">
                          {u.email}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold ${
                          u.activo
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>ID: {u.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsEditOpen(true);
                        }}
                        className="flex-1 min-w-[80px] px-3 py-2 text-xs rounded-lg bg-blue-700 hover:bg-blue-800 text-white"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleResetPassword(u.id)}
                        className="flex-1 min-w-[80px] px-3 py-2 text-xs rounded-lg bg-yellow-300 hover:bg-yellow-400 text-slate-900"
                      >
                        Reset
                      </button>

                      <button
                        onClick={() => toggleActivo(u)}
                        className={`flex-1 min-w-[80px] px-3 py-2 text-xs rounded-lg text-white ${
                          u.activo
                            ? "bg-orange-700 hover:bg-orange-800"
                            : "bg-green-700 hover:bg-green-800"
                        }`}
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* VISTA TABLA - TABLET / DESKTOP */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-pink-100 text-pink-800 text-xs uppercase">
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Nombre</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Rol</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosFiltrados.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{u.id}</td>
                        <td className="p-3 font-medium">{u.nombre}</td>
                        <td className="p-3">{u.email}</td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* ESTADO */}
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              u.activo
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {u.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        {/* ACCIONES */}
                        <td className="p-3">
                          <div className="flex justify-center gap-2 flex-wrap">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setIsEditOpen(true);
                              }}
                              className="px-3 py-1 text-xs rounded-lg bg-blue-700 hover:bg-blue-800 text-white"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() => handleResetPassword(u.id)}
                              className="px-3 py-1 text-xs rounded-lg bg-yellow-300 hover:bg-yellow-400 text-slate-900"
                            >
                              Reset
                            </button>

                            <button
                              onClick={() => toggleActivo(u)}
                              className={`px-3 py-1 text-xs rounded-lg text-white ${
                                u.activo
                                  ? "bg-orange-700 hover:bg-orange-800"
                                  : "bg-green-700 hover:bg-green-800"
                              }`}
                            >
                              {u.activo ? "Desactivar" : "Activar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={selectedUser || undefined}
        isAdmin
        onSave={handleUpdateUser}
      />
    </div>
  );
};

export default GestionUsuarios;

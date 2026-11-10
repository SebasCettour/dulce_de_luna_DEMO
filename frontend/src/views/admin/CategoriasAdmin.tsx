import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "../../context/AuthContext";
import { apiFetch } from "../../api";
import { buildFotoSrc } from "../../utils/media";

interface CategoriaRow {
  id_categoria: number;
  nombre: string;
  descripcion?: string | null;
  foto?: string | null;
  activo: number | boolean;
}

const CategoriasAdmin: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const queryClient = useQueryClient();
  const [categorias, setCategorias] = useState<CategoriaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CategoriaRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [nombre, setNombre] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<CategoriaRow[]>("/categories/admin", {
        headers: getAuthHeaders(),
      });
      setCategorias(
        [...data].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
      );
    } catch {
      toast.error("Error al obtener categorías");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const update = async (id: number, body: FormData) => {
    const { Authorization } = getAuthHeaders() as Record<string, string>;
    await apiFetch(`/categories/${id}`, {
      method: "PUT",
      headers: Authorization ? { Authorization } : {},
      body,
    });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    await load();
  };

  const startEdit = (c: CategoriaRow) => {
    setEditing(c);
    setNombre(c.nombre);
    setFile(null);
  };

  const closeEdit = () => {
    setEditing(null);
    setCreating(false);
    setNombre("");
    setFile(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const body = new FormData();
    body.append("nombre", nombre.trim());
    if (file) body.append("foto", file);
    setSaving(true);
    try {
      if (editing) {
        await update(editing.id_categoria, body);
        toast.success("Categoría actualizada");
      } else {
        const { Authorization } = getAuthHeaders() as Record<string, string>;
        await apiFetch("/categories", {
          method: "POST",
          headers: Authorization ? { Authorization } : {},
          body,
        });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        await load();
        toast.success("Categoría creada");
      }
      closeEdit();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: CategoriaRow) => {
    const next = !c.activo;
    const body = new FormData();
    body.append("activo", String(next));
    try {
      await update(c.id_categoria, body);
      toast.success(next ? "Categoría activada" : "Categoría desactivada");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar",
      );
    }
  };

  const remove = async (c: CategoriaRow) => {
    if (!window.confirm(`¿Eliminar ${c.nombre} de la demo? Se quitará de sus productos.`)) return;
    try {
      await apiFetch(`/categories/${c.id_categoria}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await load();
      toast.success("Categoría eliminada de la demo");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la categoría");
    }
  };

  if (loading) return <p className="text-slate-500">Cargando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-pink-700">Categorías</h1>
        <button
          onClick={() => {
            setEditing(null);
            setNombre("");
            setFile(null);
            setCreating(true);
          }}
          className="px-4 py-2 rounded-lg bg-pink-700 text-white hover:bg-pink-800"
        >
          Nueva categoría
        </button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categorias.map((c) => {
          const activa = Boolean(c.activo);
          return (
            <li
              key={c.id_categoria}
              className={`bg-white rounded-xl border p-3 flex items-center gap-3 ${
                activa ? "" : "opacity-60"
              }`}
            >
              <img
                src={buildFotoSrc(c.foto)}
                alt={c.nombre}
                className="h-16 w-16 rounded-lg object-cover bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.nombre}</p>
                <p
                  className={`text-xs ${activa ? "text-green-700" : "text-red-700"}`}
                >
                  {activa ? "Activa" : "Desactivada"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => startEdit(c)}
                  className="text-sm px-3 py-1 rounded-lg bg-pink-700 text-white hover:bg-pink-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggle(c)}
                  className="text-sm px-3 py-1 rounded-lg border border-slate-300 text-slate-700"
                >
                  {activa ? "Desactivar" : "Activar"}
                </button>
                <button onClick={() => remove(c)} className="text-sm text-red-700">
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {(editing || creating) && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={creating ? "Crear categoría" : "Editar categoría"}
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) closeEdit();
          }}
        >
          <form
            onSubmit={save}
            className="relative bg-white rounded-xl p-6 w-full max-w-md space-y-4"
          >
            <button
              type="button"
              onClick={closeEdit}
              aria-label="Cerrar"
              className="absolute top-3 right-3 h-8 w-8 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-gray-100 hover:text-slate-800"
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-pink-700 pr-8">
              {creating ? "Nueva categoría" : "Editar categoría"}
            </h2>
            <label className="block text-sm">
              Nombre
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                required
              />
              <p className="text-xs text-slate-600">La demo usa una imagen de ejemplo al guardar.</p>
            </label>
            <div className="space-y-2">
              <img
                src={preview ?? buildFotoSrc(editing?.foto)}
                alt="Foto de la categoría"
                className="h-32 w-32 rounded-lg object-cover bg-gray-100"
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                className="px-4 py-2 rounded-lg border"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-pink-700 text-white hover:bg-pink-800 disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategoriasAdmin;

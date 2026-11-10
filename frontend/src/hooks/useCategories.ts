import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "../api";
import { demoFetch } from "../demo/store";

export interface Category {
  id_categoria: number;
  nombre: string;
  descripcion: string;
  foto: string | null;
}

const CATEGORIES_URL = apiUrl("/categories");

// 🔥 Fetch real
async function fetchCategories(): Promise<Category[]> {
  const response = await demoFetch(CATEGORIES_URL);

  if (!response.ok) {
    throw new Error("Error al obtener categorías");
  }

  const data = await response.json();

  // 🔤 ordenar por nombre
  return Array.isArray(data)
    ? [...data].sort((a, b) => a.nombre.localeCompare(b.nombre))
    : [];
}

// 🚀 Hook con React Query
export function useCategories() {
  const query = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,

    // ⚙️ config
    staleTime: 5 * 60 * 1000, // 5 min (categorías cambian poco)
    refetchOnWindowFocus: true,
  });

  return {
    categories: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

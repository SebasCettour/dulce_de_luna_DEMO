import { useQuery } from "@tanstack/react-query";
import { apiUrl, uploadUrl } from "../api";
import { demoFetch } from "../demo/store";

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  imagen_url: string;
  categoryId: number;

  // 🆕 NUEVO
  tipo_venta: "unidad" | "peso";
  unidad_medida?: string;
  cantidad_minima?: number;
  incremento?: number;
}

const PRODUCTS_URL = apiUrl("/products");

async function fetchProducts(): Promise<Product[]> {
  const response = await demoFetch(PRODUCTS_URL);
  if (!response.ok) throw new Error("Error al obtener productos");

  const data = await response.json();

  return Array.isArray(data)
    ? data.map((prod) => ({
        id: prod.id_producto ?? prod.id ?? 0,
        name: prod.nombre?.trim() || prod.name?.trim() || "Producto sin nombre",
        price: Number(prod.precio ?? prod.price ?? 0),
        description: prod.descripcion ?? prod.description ?? "",
        imagen_url: uploadUrl(prod.foto),
        categoryId: Number(prod.id_categoria ?? prod.categoryId ?? 0),

        // ✅ CLAVE
        tipo_venta: prod.tipo_venta ?? "unidad",
        unidad_medida: prod.unidad_medida ?? "kg",
        cantidad_minima: Number(prod.cantidad_minima ?? 1),
        incremento: Number(prod.incremento ?? 1),
      }))
    : [];
}

export function useAllProducts() {
  const query = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    products: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

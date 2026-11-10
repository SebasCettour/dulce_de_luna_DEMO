import { useQuery } from "@tanstack/react-query";
import type { Product } from "./useAllProducts";
import { apiFetch, uploadUrl } from "../api";

// 🔥 Fetch por categoría + NORMALIZACIÓN COMPLETA
async function fetchCategoryProducts(categoryId: number): Promise<Product[]> {
  const data = await apiFetch<unknown[]>(`/products?categoryId=${categoryId}`);

  return Array.isArray(data)
    ? data.map((prod) => {
        const rawImage =
          (prod as Record<string, unknown>).imagen_url ||
          (prod as Record<string, unknown>).foto ||
          (prod as Record<string, unknown>).image ||
          (prod as Record<string, unknown>).img ||
          null;

        const productRecord = prod as Record<string, unknown>;
        const id = Number(
          productRecord.id ?? productRecord.id_producto ?? 0,
        );
        const name = String(
          productRecord.name ?? productRecord.nombre ?? "Producto sin nombre",
        ).trim();
        const price = Number(
          productRecord.price ?? productRecord.precio ?? 0,
        );
        const description = String(
          productRecord.description ?? productRecord.descripcion ?? "",
        );
        const categoryId = Number(
          productRecord.categoryId ??
            productRecord.categoria_id ??
            productRecord.id_categoria ??
            0,
        );
        const tipoVenta =
          productRecord.tipo_venta === "peso" ? "peso" : "unidad";
        const unidadMedida =
          typeof productRecord.unidad_medida === "string"
            ? productRecord.unidad_medida
            : undefined;
        const cantidadMinima = Number(
          productRecord.cantidad_minima != null
            ? productRecord.cantidad_minima
            : 1,
        );
        const incremento = Number(
          productRecord.incremento != null ? productRecord.incremento : 1,
        );

        return {
          id,
          name,
          price,
          description,

          // 🖼️ Imagen consistente
          imagen_url: uploadUrl(String(rawImage ?? "")),

          // 📦 Categoría
          categoryId,

          // 🔥 🔥 🔥 NUEVO SISTEMA (CLAVE)
          tipo_venta: tipoVenta,

          unidad_medida: unidadMedida,

          cantidad_minima: cantidadMinima,

          incremento,
        };
      })
    : [];
}

// 🚀 Hook con React Query
export function useCategoryProducts(categoryId?: number) {
  const query = useQuery<Product[]>({
    queryKey: ["products", categoryId],
    queryFn: () => fetchCategoryProducts(categoryId!),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    products: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

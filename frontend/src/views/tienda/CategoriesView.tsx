import { useNavigate } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";
import { uploadUrl } from "../../api";
import { buildFotoVariant, hasGeneratedVariants } from "../../utils/media";
import WhatsAppBubble from "../../components/WhatsAppBubble";
import EmptyState from "../../components/EmptyState";
import Skeleton from "../../components/Skeleton";

export default function CategoriesView() {
  const { categories, loading, error } = useCategories();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white">
      {/* HERO */}
      <div className="max-w-4xl mx-auto px-4 text-center pt-8 sm:pt-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-pink-700 tracking-tight leading-tight">
          Explorá nuestras categorías
        </h1>

        <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-pink-400 to-pink-600 mx-auto mt-4 rounded-full opacity-80" />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-10 px-4 sm:px-6" aria-label="Cargando categorías">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="surface-card overflow-hidden p-3">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="mt-3 h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="text-center mt-14 text-red-400">
          Ocurrió un error al cargar categorías
        </div>
      )}

      {/* GRID */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pb-16">
          {categories.length === 0 && <EmptyState title="No hay categorías disponibles" description="Volvé a intentar más tarde o contactanos para recibir ayuda." />}
          {categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {categories.map(({ id_categoria, nombre, descripcion, foto }) => (
              <div
                key={id_categoria}
                onClick={() => navigate(`/tienda/categoria/${id_categoria}`)}
                className="
                  group cursor-pointer rounded-2xl overflow-hidden
                  bg-white/90 backdrop-blur-lg
                  border border-pink-100
                  shadow-sm hover:shadow-xl
                  transition-all duration-300
                  hover:border-pink-300
                  sm:hover:-translate-y-1
                "
              >
                {/* IMAGE */}
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <picture>
                    {hasGeneratedVariants(foto) && <source srcSet={buildFotoVariant(foto, "avif")} type="image/avif" />}
                    {hasGeneratedVariants(foto) && <source srcSet={buildFotoVariant(foto, "webp")} type="image/webp" />}
                    <img
                      src={foto ? uploadUrl(foto) : "/default-category.jpg"}
                      alt={nombre}
                      loading="lazy"
                      width="640"
                      height="480"
                    className="
                      w-full h-full object-cover
                      transition duration-500
                      group-hover:scale-105 group-hover:brightness-90
                    "
                    />
                  </picture>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-md">
                      {nombre}
                    </h3>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {descripcion}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tienda/categoria/${id_categoria}`);
                    }}
                    className="
    text-xs sm:text-sm font-semibold
    text-white
    flex items-center gap-1
    px-2 py-1 rounded-md
    transition-all duration-200

    hover:bg-white hover:text-pink-700
    group-hover:gap-2
  "
                  >
                    Ver productos
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}
      <WhatsAppBubble />
    </div>
  );
}

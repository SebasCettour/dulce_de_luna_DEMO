interface SkeletonProps {
  className?: string;
  label?: string;
}

export default function Skeleton({ className = "", label = "Cargando" }: SkeletonProps) {
  return <div className={`skeleton ${className}`} role="status" aria-label={label} />;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" aria-label="Cargando productos">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="surface-card overflow-hidden p-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
      ))}
    </div>
  );
}
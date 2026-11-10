import { Suspense, type ComponentType, type ComponentProps } from "react";
import { lazyWithChunkReload } from "../utils/lazyWithChunkReload";

export function lazyModal<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  const LazyComponent = lazyWithChunkReload(factory);
  return function LazyModal(props: ComponentProps<T>) {
    return (
      <Suspense fallback={null}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

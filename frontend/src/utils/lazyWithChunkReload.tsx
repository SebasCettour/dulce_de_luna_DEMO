import { lazy } from "react";

const CHUNK_LOAD_FAILED_REGEX = /Failed to fetch dynamically imported module|Loading chunk [^\s]+ failed/i;
const RELOAD_FLAG_KEY = "vite_chunk_load_error_reloaded";

function isChunkLoadError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const message = (error as { message?: string }).message;
  return typeof message === "string" && CHUNK_LOAD_FAILED_REGEX.test(message);
}

function reloadOnce() {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  if (sessionStorage.getItem(RELOAD_FLAG_KEY)) return;
  sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
  window.location.reload();
}

export function lazyWithChunkReload<T extends { default: React.ComponentType<any> }>(
  factory: () => Promise<T>,
) {
  return lazy(() =>
    factory().catch((error) => {
      if (isChunkLoadError(error)) {
        reloadOnce();
      }
      return Promise.reject(error);
    }),
  );
}

import { Component, ReactNode } from "react";

const RELOAD_FLAG_KEY = "vite_chunk_load_error_reloaded";
const CHUNK_LOAD_FAILED_REGEX = /Failed to fetch dynamically imported module|Loading chunk [^\s]+ failed/i;

function isChunkLoadError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const message = (error as { message?: string }).message;
  return typeof message === "string" && CHUNK_LOAD_FAILED_REGEX.test(message);
}

interface ChunkLoadErrorBoundaryProps {
  children: ReactNode;
}

interface ChunkLoadErrorBoundaryState {
  hasError: boolean;
  isChunkLoadError: boolean;
}

class ChunkLoadErrorBoundary extends Component<
  ChunkLoadErrorBoundaryProps,
  ChunkLoadErrorBoundaryState
> {
  state: ChunkLoadErrorBoundaryState = {
    hasError: false,
    isChunkLoadError: false,
  };

  componentDidCatch(error: unknown) {
    const isChunkError = isChunkLoadError(error);

    if (isChunkError && typeof window !== "undefined" && window.sessionStorage) {
      if (!sessionStorage.getItem(RELOAD_FLAG_KEY)) {
        sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
        window.location.reload();
        return;
      }
    }

    this.setState({ hasError: true, isChunkLoadError: isChunkError });
  }

  handleReload = () => {
    if (typeof window === "undefined" || !window.sessionStorage) return;
    sessionStorage.removeItem(RELOAD_FLAG_KEY);
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-lg w-full rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-semibold text-slate-900 mb-4">
            {this.state.isChunkLoadError
              ? "Error de carga del módulo"
              : "Ocurrió un error"}
          </h1>
          <p className="text-slate-600 mb-6">
            {this.state.isChunkLoadError
              ? "Intentamos recargar una vez para recuperar la versión más reciente. Si persiste, recarga la página manualmente."
              : "Por favor intenta nuevamente o recarga la página."}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex items-center justify-center rounded-2xl bg-pink-700 px-6 py-3 text-sm font-semibold text-white hover:bg-pink-800 transition"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
}

export default ChunkLoadErrorBoundary;

import { demoFetch, PLACEHOLDER } from "./demo/store";

export function apiUrl(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function uploadUrl(path?: string | null) {
  return path === PLACEHOLDER ? path : PLACEHOLDER;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await demoFetch(apiUrl(path), {
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let detail = "No se pudo completar la solicitud";

    try {
      const payload = await response.json();
      if (payload && typeof payload === "object") {
        const message =
          (payload as Record<string, unknown>).error ||
          (payload as Record<string, unknown>).message;
        if (typeof message === "string" && message.trim()) {
          detail = message;
        }
      }
    } catch {
      // Ignore JSON parse errors and fall back to generic message
    }

    if (response.status === 401) {
      detail = detail === "No se pudo completar la solicitud" ? "Sesión expirada." : detail;
    }

    if (response.status === 403) {
      detail = detail === "No se pudo completar la solicitud" ? "No tienes permiso para realizar esta acción." : detail;
    }

    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

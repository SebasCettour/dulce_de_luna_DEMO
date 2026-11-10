import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../../context/AuthContext";
import { apiFetch } from "../../api";
import VentasTable, {
  EstadoEnvio,
  EstadoPago,
  EstadosPatch,
  Venta,
} from "./VentasTable";

const PAGE_SIZE = 8;

const LABEL_PAGO: Record<EstadoPago, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
};

const LABEL_ENVIO: Record<EstadoEnvio, string> = {
  pendiente: "Pendiente",
  enviado: "Enviado",
  entregado: "Entregado",
};

function mensajeEstadosGuardados(patch: EstadosPatch): string {
  const partes: string[] = [];
  if (patch.estado_pago) {
    partes.push(`Pago: ${LABEL_PAGO[patch.estado_pago]}`);
  }
  if (patch.estado_envio) {
    partes.push(`Envío: ${LABEL_ENVIO[patch.estado_envio]}`);
  }
  return partes.length ? partes.join(" · ") : "Cambios guardados";
}

function truncateNombre(nombre: string, max = 28) {
  const t = nombre.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function normalizarVenta(raw: Record<string, unknown>): Venta {
  const estadoLegacy = typeof raw.estado === "string" ? raw.estado : undefined;
  let estado_pago: EstadoPago = "pendiente";
  let estado_envio: EstadoEnvio = "pendiente";

  if (typeof raw.estado_pago === "string" && raw.estado_pago) {
    estado_pago = raw.estado_pago as EstadoPago;
  }
  if (typeof raw.estado_envio === "string" && raw.estado_envio) {
    estado_envio = raw.estado_envio as EstadoEnvio;
  }

  const sinCamposNuevos =
    (raw.estado_pago === undefined || raw.estado_pago === null) &&
    (raw.estado_envio === undefined || raw.estado_envio === null);

  if (sinCamposNuevos && estadoLegacy) {
    if (estadoLegacy === "pagado") estado_pago = "pagado";
    if (estadoLegacy === "enviado" || estadoLegacy === "entregado") {
      estado_envio = estadoLegacy;
    }
  }

  let productos: Venta["productos"] = [];
  try {
    productos =
      typeof raw.productos === "string"
        ? JSON.parse(raw.productos as string)
        : (raw.productos as Venta["productos"]) || [];
  } catch {
    productos = [];
  }

  return {
    id: String(raw.id ?? ""),
    cliente: (raw.cliente as string) || "-",
    total: Number(raw.total) || 0,
    estado_pago,
    estado_envio,
    fecha: String(raw.fecha ?? ""),
    pago: String(raw.pago ?? ""),
    entrega: String(raw.entrega ?? ""),
    direccion: (raw.direccion as string) || "",
    notas: (raw.notas as string) || "",
    productos,
  };
}

const Ventas = () => {
  const { getAuthHeaders } = useAuth();

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [estadoPagoFilter, setEstadoPagoFilter] = useState("todos");
  const [estadoEnvioFilter, setEstadoEnvioFilter] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const fetchVentas = async (options?: { notify?: boolean }) => {
    const notify = options?.notify === true;
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<Record<string, unknown>[]>("/ventas", {
        headers: getAuthHeaders(),
      });

      const parsed: Venta[] = data.map(normalizarVenta);

      parsed.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );

      setVentas(parsed);
      if (notify) {
        toast.success(
          parsed.length === 1
            ? "Lista actualizada · 1 pedido"
            : `Lista actualizada · ${parsed.length} pedidos`,
        );
      }
    } catch (error) {
      console.error(error);
      const msg = "No se pudieron cargar las ventas";
      setError(msg);
      if (notify) toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeEstados = async (id: string, patch: EstadosPatch) => {
    const venta = ventas.find((v) => v.id === id);
    const nombreCliente =
      truncateNombre(venta?.cliente && venta.cliente !== "-" ? venta.cliente : `Pedido #${id}`);

    await toast.promise(
      (async () => {
        await apiFetch(`/ventas/${id}/estados`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(patch),
        });

        setVentas((prev) =>
          prev.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        );
      })(),
      {
        loading: "Guardando cambios…",
        success: () => `${nombreCliente} · ${mensajeEstadosGuardados(patch)}`,
        error: (err: unknown) =>
          err instanceof Error ? err.message : "No se pudieron guardar los cambios",
      },
    );
  };

  const filtered = useMemo(() => {
    return ventas.filter((v) => {
      const matchSearch = v.cliente
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchPago =
        estadoPagoFilter === "todos" ||
        v.estado_pago === estadoPagoFilter;
      const matchEnvio =
        estadoEnvioFilter === "todos" ||
        v.estado_envio === estadoEnvioFilter;

      const ventaDate = new Date(v.fecha).toISOString().split("T")[0];
      const matchDateFrom = !dateFrom || ventaDate >= dateFrom;
      const matchDateTo = !dateTo || ventaDate <= dateTo;

      return (
        matchSearch && matchPago && matchEnvio && matchDateFrom && matchDateTo
      );
    });
  }, [ventas, search, estadoPagoFilter, estadoEnvioFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, estadoPagoFilter, estadoEnvioFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600 font-semibold">{error}</p>

        <button
          type="button"
          onClick={() => fetchVentas({ notify: true })}
          className="btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#825C22]">
            Ventas realizadas
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Seguimiento de pedidos y estados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchVentas({ notify: true })}
          className="rounded-xl bg-gradient-to-r from-pink-700 to-rose-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-500/20 transition hover:from-pink-800 hover:to-rose-800 hover:shadow-lg hover:shadow-pink-500/25"
        >
          Actualizar lista
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 rounded-2xl border border-[#825C22]/10 bg-[#FFFAF6] p-4 shadow-[0_2px_16px_-2px_rgba(130,92,34,0.08)]">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#825C22]/14 bg-white px-3 py-2.5 text-sm text-[#452d0f] shadow-inner outline-none transition placeholder:text-stone-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-300/35"
        />

        <select
          value={estadoPagoFilter}
          onChange={(e) => setEstadoPagoFilter(e.target.value)}
          className="w-full rounded-xl border border-[#825C22]/14 bg-white px-3 py-2.5 text-sm font-medium text-[#452d0f] shadow-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-300/35"
        >
          <option value="todos">Pago · todos</option>
          <option value="pendiente">Pago · pendiente</option>
          <option value="pagado">Pago · cobrado</option>
        </select>

        <select
          value={estadoEnvioFilter}
          onChange={(e) => setEstadoEnvioFilter(e.target.value)}
          className="w-full rounded-xl border border-[#825C22]/14 bg-white px-3 py-2.5 text-sm font-medium text-[#452d0f] shadow-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-300/35"
        >
          <option value="todos">Envío · todos</option>
          <option value="pendiente">Envío · pendiente</option>
          <option value="enviado">Envío · en tránsito</option>
          <option value="entregado">Envío · entregado</option>
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-full rounded-xl border border-[#825C22]/14 bg-white px-3 py-2.5 text-sm text-[#452d0f] shadow-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-300/35"
          aria-label="Fecha desde"
        />

        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-full rounded-xl border border-[#825C22]/14 bg-white px-3 py-2.5 text-sm text-[#452d0f] shadow-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-300/35"
          aria-label="Fecha hasta"
        />

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setEstadoPagoFilter("todos");
            setEstadoEnvioFilter("todos");
            setDateFrom("");
            setDateTo("");
          }}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          Limpiar filtros
        </button>
      </div>

      <p className="text-sm font-medium text-stone-600">
        {filtered.length}{" "}
        {filtered.length === 1 ? "resultado" : "resultados"}
      </p>

      <VentasTable ventas={paginated} onChangeEstados={handleChangeEstados} />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border border-[#825C22]/18 bg-white px-4 py-2 text-sm font-semibold text-[#825C22] shadow-sm transition hover:bg-[#FFF8F0] disabled:pointer-events-none disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="min-w-[8rem] text-center text-sm font-medium text-stone-600">
            Página {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-[#825C22]/18 bg-white px-4 py-2 text-sm font-semibold text-[#825C22] shadow-sm transition hover:bg-[#FFF8F0] disabled:pointer-events-none disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default Ventas;

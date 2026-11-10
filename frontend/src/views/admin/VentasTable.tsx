import React, { useState } from "react";
import { ChevronDown, Save, Truck, Wallet } from "lucide-react";

export type EstadoPago = "pendiente" | "pagado";
export type EstadoEnvio = "pendiente" | "enviado" | "entregado";

export interface Venta {
  id: string;
  cliente: string;
  productos: { nombre: string; cantidad: number; precio: number }[];
  total: number | string;
  estado_pago: EstadoPago;
  estado_envio: EstadoEnvio;
  fecha: string;
  pago: string;
  entrega: string;
  direccion?: string;
  notas?: string;
}

export type EstadosPatch = {
  estado_pago?: EstadoPago;
  estado_envio?: EstadoEnvio;
};

interface VentasTableProps {
  ventas: Venta[];
  onChangeEstados?: (id: string, patch: EstadosPatch) => void;
}

const ESTADOS_PAGO: {
  value: EstadoPago;
  label: string;
  badge: string;
}[] = [
  {
    value: "pendiente",
    label: "Pendiente",
    badge:
      "bg-amber-50 text-amber-900 ring-1 ring-amber-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
  },
  {
    value: "pagado",
    label: "Pagado",
    badge:
      "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
  },
];

const ESTADOS_ENVIO: {
  value: EstadoEnvio;
  label: string;
  badge: string;
}[] = [
  {
    value: "pendiente",
    label: "Pendiente",
    badge:
      "bg-stone-100 text-stone-800 ring-1 ring-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
  },
  {
    value: "enviado",
    label: "Enviado",
    badge:
      "bg-orange-50 text-orange-900 ring-1 ring-orange-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
  },
  {
    value: "entregado",
    label: "Entregado",
    badge:
      "bg-emerald-50/90 text-emerald-900 ring-1 ring-emerald-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
  },
];

const selectBase =
  "w-full appearance-none rounded-md border border-[#825C22]/20 bg-white py-1 pl-2 pr-8 text-[11px] font-medium text-[#452d0f] transition hover:border-[#825C22]/30 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-300/50";

function SelectWrap({
  children,
}: {
  children: React.ReactElement<React.SelectHTMLAttributes<HTMLSelectElement>>;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      {children}
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#825C22]/45"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}

function EstadosEditor({
  venta,
  pagoSel,
  envioSel,
  dirty,
  onPago,
  onEnvio,
  onSave,
}: {
  venta: Venta;
  pagoSel: EstadoPago;
  envioSel: EstadoEnvio;
  dirty: boolean;
  onPago: (v: EstadoPago) => void;
  onEnvio: (v: EstadoEnvio) => void;
  onSave: () => void;
}) {
  return (
    <div
      title={`Pedido · ${venta.cliente}`}
      className={`rounded-lg border p-2 transition-colors ${
        dirty
          ? "border-pink-300/50 bg-pink-50/50"
          : "border-[#825C22]/10 bg-transparent"
      }`}
    >
      {dirty && (
        <p className="mb-1.5 text-[10px] font-medium text-pink-700">
          Sin guardar
        </p>
      )}
      <div className="grid grid-cols-[1.125rem_1fr] items-center gap-x-1.5 gap-y-1.5">
        <Wallet
          className="h-3.5 w-3.5 shrink-0 justify-self-center text-[#825C22]/50"
          strokeWidth={2}
          aria-hidden
        />
        <SelectWrap>
          <select
            value={pagoSel}
            onChange={(e) => onPago(e.target.value as EstadoPago)}
            className={selectBase}
            aria-label={`Estado del pago, pedido ${venta.cliente}`}
          >
            {ESTADOS_PAGO.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </SelectWrap>

        <Truck
          className="h-3.5 w-3.5 shrink-0 justify-self-center text-[#825C22]/50"
          strokeWidth={2}
          aria-hidden
        />
        <SelectWrap>
          <select
            value={envioSel}
            onChange={(e) => onEnvio(e.target.value as EstadoEnvio)}
            className={selectBase}
            aria-label={`Estado del envío, pedido ${venta.cliente}`}
          >
            {ESTADOS_ENVIO.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </SelectWrap>

        <div className="col-span-2 pt-0.5">
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty}
            className="group inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-pink-700 px-2 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-pink-800 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-pink-700"
          >
            <Save className="h-3 w-3" strokeWidth={2.5} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

const formatFecha = (fecha: string) => {
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return fecha;

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getPagoBadge = (v: EstadoPago) =>
  ESTADOS_PAGO.find((e) => e.value === v) || ESTADOS_PAGO[0];

const getEnvioBadge = (v: EstadoEnvio) =>
  ESTADOS_ENVIO.find((e) => e.value === v) || ESTADOS_ENVIO[0];

/** Lista siempre visible; si hay muchos ítems, scroll vertical. */
function ListaProductosVenta({
  productos,
  formatCantidad,
  classNameList = "space-y-1.5 text-[11px]",
  maxHeightClass = "max-h-40",
}: {
  productos: Venta["productos"];
  formatCantidad: (n: number) => string;
  classNameList?: string;
  /** Altura antes de mostrar scroll (ej. max-h-40 ≈ 10rem). */
  maxHeightClass?: string;
}) {
  if (productos.length === 0) {
    return (
      <p className="text-[11px] italic text-stone-400">Sin ítems cargados</p>
    );
  }

  return (
    <div
      className={`${maxHeightClass} overflow-y-auto overflow-x-hidden pr-0.5 [-webkit-overflow-scrolling:touch]`}
    >
      <ul className={`${classNameList} text-[#452d0f]`}>
        {productos.map((prod, idx) => (
          <li
            key={idx}
            className="flex justify-between gap-3 py-0.5 leading-snug"
          >
            <span className="min-w-0 break-words">{prod.nombre}</span>
            <span className="shrink-0 tabular-nums text-stone-500">
              {formatCantidad(prod.cantidad)} · $
              {(prod.precio * prod.cantidad).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const VentasTable: React.FC<VentasTableProps> = ({
  ventas,
  onChangeEstados,
}) => {
  const [pendingPago, setPendingPago] = useState<Record<string, EstadoPago>>(
    {},
  );
  const [pendingEnvio, setPendingEnvio] = useState<Record<string, EstadoEnvio>>(
    {},
  );

  const tieneCambiosPendientes = (venta: Venta) => {
    const pp = pendingPago[venta.id] ?? venta.estado_pago;
    const pe = pendingEnvio[venta.id] ?? venta.estado_envio;
    return pp !== venta.estado_pago || pe !== venta.estado_envio;
  };

  const aplicarCambio = (venta: Venta) => {
    if (!onChangeEstados || !tieneCambiosPendientes(venta)) return;

    const siguientePago = pendingPago[venta.id] ?? venta.estado_pago;
    const siguienteEnvio = pendingEnvio[venta.id] ?? venta.estado_envio;
    const patch: EstadosPatch = {};
    if (siguientePago !== venta.estado_pago) {
      patch.estado_pago = siguientePago;
    }
    if (siguienteEnvio !== venta.estado_envio) {
      patch.estado_envio = siguienteEnvio;
    }
    if (Object.keys(patch).length === 0) return;

    onChangeEstados(venta.id, patch);

    setPendingPago((prev) => {
      const c = { ...prev };
      delete c[venta.id];
      return c;
    });
    setPendingEnvio((prev) => {
      const c = { ...prev };
      delete c[venta.id];
      return c;
    });
  };

  const formatCantidad = (cantidad: number) => {
    if (cantidad % 1 === 0) {
      return `${cantidad} unidad${cantidad !== 1 ? "es" : ""}`;
    }
    return `${(cantidad * 1000).toFixed(0)}g`;
  };

  if (ventas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#825C22]/22 bg-[#FFFAF6] px-8 py-16 text-center shadow-sm">
        <p className="text-sm font-medium text-[#825C22]/70">
          No hay ventas para mostrar
        </p>
        <p className="mt-1 text-xs text-stone-500">
          Ajustá los filtros o actualizá la lista.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#825C22]/12 bg-white shadow-[0_4px_24px_-4px_rgba(130,92,34,0.12)]">
      <div className="border-b border-[#825C22]/10 bg-gradient-to-r from-[#FFFAF4] to-[#F7F0E4] px-5 py-3.5">
        <h2 className="text-sm font-semibold tracking-tight text-[#825C22]">
          Listado de pedidos
        </h2>
      </div>

      <div className="p-4 md:hidden space-y-4">
        {ventas.map((venta) => {
          const totalNumber = Number(venta.total);
          const pagoSel = pendingPago[venta.id] ?? venta.estado_pago;
          const envioSel = pendingEnvio[venta.id] ?? venta.estado_envio;
          const bPago = getPagoBadge(pagoSel);
          const bEnvio = getEnvioBadge(envioSel);
          const dirty = tieneCambiosPendientes(venta);

          return (
            <article
              key={venta.id}
              className="overflow-hidden rounded-2xl border border-stone-200/80 bg-gradient-to-b from-white to-[#FFFCF8] shadow-md shadow-stone-200/40"
            >
              <div className="border-b border-stone-100 bg-white/60 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#452d0f]">
                      {venta.cliente}
                    </p>
                    <p className="mt-0.5 text-[11px] text-stone-500">
                      {formatFecha(venta.fecha)}
                    </p>
                  </div>
                  <p className="text-right text-lg font-bold tabular-nums text-[#825C22]">
                    ${isNaN(totalNumber) ? "0.00" : totalNumber.toFixed(2)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold ${bPago.badge}`}
                  >
                    {bPago.label}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold ${bEnvio.badge}`}
                  >
                    {bEnvio.label}
                  </span>
                </div>
              </div>

              <div className="space-y-3 px-4 py-3 text-xs text-stone-600">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#825C22]/65">
                    Productos ({venta.productos.length})
                  </p>
                  <ListaProductosVenta
                    productos={venta.productos}
                    formatCantidad={formatCantidad}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400">Medio de pago</span>
                    <p className="font-medium text-stone-700">{venta.pago}</p>
                  </div>
                  <div>
                    <span className="text-stone-400">Entrega</span>
                    <p className="font-medium text-stone-700">
                      {venta.entrega}
                    </p>
                  </div>
                </div>
              </div>

              {onChangeEstados && (
                <div className="border-t border-stone-100 bg-[#faf8f5]/70 px-3 py-2.5">
                  <EstadosEditor
                    venta={venta}
                    pagoSel={pagoSel}
                    envioSel={envioSel}
                    dirty={dirty}
                    onPago={(v) =>
                      setPendingPago((p) => ({ ...p, [venta.id]: v }))
                    }
                    onEnvio={(v) =>
                      setPendingEnvio((p) => ({ ...p, [venta.id]: v }))
                    }
                    onSave={() => aplicarCambio(venta)}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto px-3 pb-3 pt-2">
        <table className="min-w-[860px] w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#825C22]/65">
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                Cliente
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                Productos
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                Total
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                Pago
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                Envío
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                Fecha
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                Medio
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                Entrega
              </th>
              {onChangeEstados && (
                <th className="whitespace-nowrap px-2 py-3 font-semibold w-[168px] min-w-[156px]">
                  Gestionar
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#825C22]/8">
            {ventas.map((venta, rowIdx) => {
              const totalNumber = Number(venta.total);
              const pagoSel = pendingPago[venta.id] ?? venta.estado_pago;
              const envioSel = pendingEnvio[venta.id] ?? venta.estado_envio;
              const bp = getPagoBadge(pagoSel);
              const be = getEnvioBadge(envioSel);
              const dirty = tieneCambiosPendientes(venta);
              const stripe =
                rowIdx % 2 === 0 ? "bg-[#FFFBF7]" : "bg-[#FFF8F2]/92";
              const nProd = venta.productos.length;

              return (
                <React.Fragment key={venta.id}>
                  <tr className={`${stripe} transition hover:bg-[#FDF5EA]/98`}>
                    <td className="px-4 py-3 align-top font-medium text-[#452d0f]">
                      {venta.cliente}
                    </td>
                    <td className="max-w-[min(240px,28vw)] min-w-[180px] px-4 py-3 align-top">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#825C22]/60">
                        {nProd} {nProd === 1 ? "ítem" : "ítems"}
                      </p>
                      <ListaProductosVenta
                        productos={venta.productos}
                        formatCantidad={formatCantidad}
                        classNameList="space-y-1.5 text-xs"
                        maxHeightClass="max-h-44"
                      />
                    </td>
                    <td className="px-4 py-3 align-top text-right tabular-nums">
                      <span className="font-bold text-[#825C22]">
                        $
                        {isNaN(totalNumber)
                          ? "0.00"
                          : totalNumber.toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <span
                        className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-[11px] font-semibold ${bp.badge}`}
                      >
                        {bp.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <span
                        className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-[11px] font-semibold ${be.badge}`}
                      >
                        {be.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-stone-600">
                      {formatFecha(venta.fecha)}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-stone-700 capitalize">
                      {venta.pago}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-stone-700 capitalize">
                      {venta.entrega}
                    </td>
                    {onChangeEstados && (
                      <td className="w-[168px] min-w-[156px] max-w-[180px] px-2 py-2 align-middle">
                        <EstadosEditor
                          venta={venta}
                          pagoSel={pagoSel}
                          envioSel={envioSel}
                          dirty={dirty}
                          onPago={(v) =>
                            setPendingPago((p) => ({ ...p, [venta.id]: v }))
                          }
                          onEnvio={(v) =>
                            setPendingEnvio((p) => ({ ...p, [venta.id]: v }))
                          }
                          onSave={() => aplicarCambio(venta)}
                        />
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VentasTable;

import { Venta } from "../views/admin/VentasTable";

const VENTAS_KEY = "ventas";

// 🧠 Leer ventas de forma segura
function readVentas(): Venta[] {
  try {
    const raw = localStorage.getItem(VENTAS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 💾 Guardar ventas
export function guardarVenta(venta: Venta) {
  try {
    const ventas = readVentas();
    ventas.push(venta);

    localStorage.setItem(VENTAS_KEY, JSON.stringify(ventas));
  } catch {
    console.error("Error guardando venta en localStorage");
  }
}

// 📦 Obtener ventas
export function obtenerVentas(): Venta[] {
  return readVentas();
}

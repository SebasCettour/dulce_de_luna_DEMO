export interface DemoCategory {
  id_categoria: number;
  nombre: string;
  descripcion: string;
  foto: string;
  activo: boolean;
}

export interface DemoProduct {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  foto: string;
  categoria_ids: number[];
  activo: boolean;
  tipo_venta: "unidad" | "peso";
  unidad_medida: string | null;
  cantidad_minima: number | null;
  incremento: number | null;
}

export interface DemoUser {
  id: number;
  nombre: string;
  email: string;
  role: "admin" | "cliente";
  activo: boolean;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  codigo_postal?: string;
}

interface DemoSale {
  id: number;
  cliente: string;
  total: number;
  productos: unknown[];
  estado_pago: string;
  estado_envio: string;
  fecha: string;
  pago: string;
  entrega: string;
  direccion: string | null;
  notas: string;
}

interface DemoData {
  categories: DemoCategory[];
  products: DemoProduct[];
  users: DemoUser[];
  sales: DemoSale[];
  banner: string[];
}

export const DEMO_PREFIX = "diet-demo-v1:";
const DATA_KEY = `${DEMO_PREFIX}data`;
export const PLACEHOLDER = "/demo-product.svg";

const categoryNames = ["Frutos secos", "Semillas", "Harinas", "Cereales", "Aceites", "Vegano", "Orgánico", "Sin TACC"];
const productSeeds: Array<[string, number, number[]]> = [
  ["Almendras naturales", 14500, [1, 6]], ["Nueces mariposa", 13200, [1, 6]],
  ["Castañas de cajú", 17100, [1, 6]], ["Maní tostado", 6300, [1, 6]],
  ["Avellanas", 18200, [1, 6]], ["Semillas de chía", 7100, [2, 6, 8]],
  ["Semillas de lino", 4800, [2, 6]], ["Semillas de girasol", 5200, [2, 6]],
  ["Semillas de zapallo", 8900, [2, 6]], ["Sésamo integral", 6500, [2, 6]],
  ["Harina de almendras", 12200, [3, 6, 8]], ["Harina de garbanzo", 5600, [3, 6, 8]],
  ["Harina de arroz", 3900, [3, 6, 8]], ["Harina integral", 3200, [3, 6]],
  ["Avena arrollada", 4100, [4, 6]], ["Arroz integral", 3500, [4, 6, 7]],
  ["Quinoa", 9800, [4, 6, 8]], ["Granola con frutos secos", 7600, [4, 5]],
  ["Copos de maíz", 4800, [4, 5]], ["Mix de frutos secos", 11900, [1, 5, 6]],
  ["Chips de banana", 6800, [5, 6]], ["Coco rallado", 7200, [5, 6]],
  ["Pasas de uva", 6400, [5, 6]], ["Garbanzos tostados", 5900, [5, 6]],
];

function seed(): DemoData {
  return {
    categories: categoryNames.map((nombre, index) => ({
      id_categoria: index + 1, nombre, descripcion: `Selección demo: ${nombre.toLowerCase()}.`,
      foto: PLACEHOLDER, activo: true,
    })),
    products: productSeeds.map(([nombre, precio, categoria_ids], index) => ({
      id_producto: index + 1, nombre, descripcion: `${nombre} de ejemplo para la tienda demo.`,
      precio, stock: 25 + index, foto: PLACEHOLDER, categoria_ids, activo: true,
      tipo_venta: "unidad", unidad_medida: null, cantidad_minima: 1, incremento: 1,
    })),
    users: [
      { id: 1, nombre: "Cliente Demo", email: "cliente@example.com", role: "cliente", activo: true },
      { id: 2, nombre: "Administración Demo", email: "admin@example.com", role: "admin", activo: true },
    ],
    sales: [],
    banner: ["Explorá nuestra tienda de ejemplo", "Todos los productos y precios son ficticios"],
  };
}

export function readDemo(): DemoData {
  const raw = localStorage.getItem(DATA_KEY);
  if (!raw) {
    const data = seed();
    writeDemo(data);
    return data;
  }
  try {
    return JSON.parse(raw) as DemoData;
  } catch {
    throw new Error("Los datos locales de la demo están dañados. Restablecelos para continuar.");
  }
}

export function writeDemo(data: DemoData): void {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function resetDemo(): void {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(DEMO_PREFIX)) localStorage.removeItem(key);
  }
}

function parseBody(body: BodyInit | null | undefined): Record<string, unknown> {
  if (body instanceof FormData) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of body.entries()) {
      if (typeof value === "string") result[key] = value;
    }
    return result;
  }
  if (typeof body === "string") return JSON.parse(body) as Record<string, unknown>;
  return {};
}

function nextId(items: Array<{ id: number }>): number {
  return Math.max(0, ...items.map((item) => item.id)) + 1;
}

function publicProduct(product: DemoProduct) {
  return {
    ...product, id: product.id_producto, name: product.nombre, description: product.descripcion,
    price: product.precio, imagen_url: product.foto, id_categoria: product.categoria_ids[0],
  };
}

export async function demoFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = new URL(path, "https://example.com");
  const route = url.pathname;
  const method = (init.method ?? "GET").toUpperCase();
  const data = readDemo();
  const body = parseBody(init.body);
  const reply = (value: unknown, status = 200) =>
    new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
  const fail = (message: string, status = 400) => reply({ message, error: message }, status);
  const productMatch = route.match(/^\/products\/(\d+)$/);
  const categoryMatch = route.match(/^\/categories\/(\d+)$/);
  const userMatch = route.match(/^\/users\/(\d+)(?:\/(reset-password|toggle-active))?$/);
  const saleMatch = route.match(/^\/ventas\/(\d+)\/estados$/);

  if (route === "/products" && method === "GET") {
    const categoryId = Number(url.searchParams.get("categoryId"));
    return reply(data.products.filter((p) =>
      (url.searchParams.get("includeInactive") === "true" || p.activo) &&
      (!categoryId || p.categoria_ids.includes(categoryId)),
    ).map(publicProduct));
  }
  if (productMatch && method === "GET") {
    const product = data.products.find((p) => p.id_producto === Number(productMatch[1]) && p.activo);
    return product ? reply(publicProduct(product)) : fail("Producto no encontrado", 404);
  }
  if (productMatch && method === "DELETE") {
    const index = data.products.findIndex((p) => p.id_producto === Number(productMatch[1]));
    if (index < 0) return fail("Producto no encontrado", 404);
    data.products.splice(index, 1);
    writeDemo(data);
    return reply({ success: true });
  }
  if ((route === "/products" && method === "POST") || (productMatch && method === "PUT")) {
    const existing = productMatch ? data.products.find((p) => p.id_producto === Number(productMatch[1])) : undefined;
    if (productMatch && !existing) return fail("Producto no encontrado", 404);
    const categories = typeof body.categoria_ids === "string" ? JSON.parse(body.categoria_ids) : body.categoria_ids;
    if (!Array.isArray(categories) || !categories.length || !String(body.nombre ?? "").trim()) return fail("Completá el nombre y las categorías");
    const product: DemoProduct = {
      id_producto: existing?.id_producto ?? nextId(data.products.map((p) => ({ id: p.id_producto }))),
      nombre: String(body.nombre), descripcion: String(body.descripcion ?? ""),
      precio: Number(body.precio), stock: Number(body.stock), foto: existing?.foto ?? PLACEHOLDER,
      categoria_ids: categories.map(Number), activo: body.activo === true || body.activo === "true",
      tipo_venta: body.tipo_venta === "peso" ? "peso" : "unidad",
      unidad_medida: body.unidad_medida ? String(body.unidad_medida) : null,
      cantidad_minima: Number(body.cantidad_minima ?? 1), incremento: Number(body.incremento ?? 1),
    };
    if (existing) Object.assign(existing, product); else data.products.push(product);
    writeDemo(data);
    return reply(publicProduct(product));
  }
  if (route === "/categories" && method === "GET" || route === "/categories/admin" && method === "GET") {
    return reply(route.endsWith("/admin") ? data.categories : data.categories.filter((c) => c.activo));
  }
  if (categoryMatch && method === "DELETE") {
    const id = Number(categoryMatch[1]);
    const index = data.categories.findIndex((c) => c.id_categoria === id);
    if (index < 0) return fail("Categoría no encontrada", 404);
    data.categories.splice(index, 1);
    data.products.forEach((product) => {
      product.categoria_ids = product.categoria_ids.filter((categoryId) => categoryId !== id);
    });
    writeDemo(data);
    return reply({ success: true });
  }
  if ((route === "/categories" && method === "POST") || (categoryMatch && method === "PUT")) {
    const existing = categoryMatch ? data.categories.find((c) => c.id_categoria === Number(categoryMatch[1])) : undefined;
    if (categoryMatch && !existing) return fail("Categoría no encontrada", 404);
    if (existing) {
      if (body.nombre !== undefined) existing.nombre = String(body.nombre);
      if (body.activo !== undefined) existing.activo = body.activo === true || body.activo === "true";
    } else {
      data.categories.push({ id_categoria: nextId(data.categories.map((c) => ({ id: c.id_categoria }))),
        nombre: String(body.nombre ?? ""), descripcion: "", foto: PLACEHOLDER, activo: true });
    }
    writeDemo(data);
    return reply(existing ?? data.categories[data.categories.length - 1]);
  }
  if (route === "/users" && method === "GET") return reply(data.users);
  if (userMatch) {
    const user = data.users.find((u) => u.id === Number(userMatch[1]));
    if (!user) return fail("Usuario no encontrado", 404);
    if (method === "GET") return reply(user);
    if (userMatch[2] === "toggle-active") user.activo = !user.activo;
    else if (!userMatch[2]) Object.assign(user, body);
    writeDemo(data);
    return reply(user);
  }
  if (route === "/banner" && method === "GET") return reply({ messages: data.banner });
  if (route === "/banner" && method === "PUT" && Array.isArray(body.messages)) {
    data.banner = body.messages.map(String);
    writeDemo(data);
    return reply({ messages: data.banner });
  }
  if (route === "/ventas" && method === "GET") return reply(data.sales);
  if (route === "/ventas" && method === "POST") {
    if (!Array.isArray(body.productos)) return fail("Los productos de la venta son obligatorios");
    const sale: DemoSale = {
      id: nextId(data.sales), cliente: String(body.cliente ?? "Cliente Demo"),
      total: Number(body.total), productos: body.productos,
      estado_pago: "pendiente", estado_envio: "pendiente", fecha: new Date().toISOString(),
      pago: "simulado", entrega: "simulada", direccion: null, notas: "",
    };
    data.sales.push(sale);
    writeDemo(data);
    return reply(sale);
  }
  if (saleMatch && method === "PATCH") {
    const sale = data.sales.find((s) => s.id === Number(saleMatch[1]));
    if (!sale) return fail("Venta no encontrada", 404);
    Object.assign(sale, body);
    writeDemo(data);
    return reply(sale);
  }
  return fail(`Operación demo no disponible: ${method} ${route}`, 404);
}

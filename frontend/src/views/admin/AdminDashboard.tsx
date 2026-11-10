import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
import useAuth from "../../context/AuthContext";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔥 Redirige a productos como vista principal
  useEffect(() => {
    if (location.pathname === "/admin") {
      navigate("/admin/productos");
    }
  }, [location.pathname, navigate]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `py-2 px-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${
      isActive
        ? "text-pink-800 font-semibold bg-pink-100"
        : "text-slate-700 hover:bg-gray-50 hover:text-slate-900"
    }`;

  const sectionName = location.pathname.includes("usuarios")
    ? "Usuarios"
    : location.pathname.includes("categorias")
      ? "Categorías"
    : location.pathname.includes("ventas")
      ? "Ventas"
      : location.pathname.includes("banner")
        ? "Banner"
        : "Productos";

  return (
    <div className="min-h-screen bg-pink-100/60 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div style={{ top: "var(--demo-banner-height)" }} className="md:hidden fixed left-0 right-0 z-50 bg-white border-b flex items-center justify-between px-4 py-3 shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-pink-700 text-white text-xl leading-none shadow-sm hover:bg-pink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-700 focus-visible:ring-offset-2"
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <h2 className="text-lg font-bold text-pink-700">Admin Panel</h2>
        <div className="w-6" /> {/* spacer para centrar el título */}
      </div>

      {/* SIDEBAR */}
      <aside
        aria-label="Navegación de administración"
        style={{ paddingTop: "max(1.5rem, var(--demo-banner-height))" }}
        className={`w-72 max-w-[80vw] bg-white text-slate-600 p-6 space-y-6 border-r fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:max-w-none md:w-72 md:z-30 overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-pink-700">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-pink-700 text-white hover:bg-pink-800 transition focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-1 text-base" aria-label="Secciones de administración">
          <NavLink
            to="/admin/productos"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            Productos
          </NavLink>

          <NavLink
            to="/admin/categorias"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            Categorías
          </NavLink>

          <NavLink
            to="/admin/usuarios"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            Usuarios
          </NavLink>

          <NavLink
            to="/admin/ventas"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            Ventas
          </NavLink>

          {/* 🔥 Banner como sección */}
          <NavLink
            to="/admin/banner"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            Banner
          </NavLink>

          <button
            onClick={() => {
              navigate("/tienda");
              setSidebarOpen(false);
            }}
            className="btn-primary mt-6 w-full justify-start text-sm md:text-base"
          >
            Ver tienda
          </button>

          <button
            onClick={() => {
              logout();
              navigate("/login");
              setSidebarOpen(false);
            }}
            className="text-left bg-gray-800 text-white px-3 py-2 rounded-lg text-sm md:text-base"
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN */}
      <main className="flex-1 w-full p-4 pt-20 md:p-8 md:pt-8 space-y-6 overflow-x-hidden">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
          <ol className="flex items-center gap-2">
            <li>Administración</li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-pink-700" aria-current="page">{sectionName}</li>
          </ol>
        </nav>
        {/* 🔥 Siempre renderiza la sección activa */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;

import { createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import CheckoutView from "./views/tienda/Checkout";
import BannerPage from "./components/Banner";
import ErrorPage from "./components/ErrorPage";
import Ventas from "./views/admin/Ventas";
import { lazyWithChunkReload } from "./utils/lazyWithChunkReload";

const Layout = lazyWithChunkReload(() => import("./Layouts"));
const CategoriesView = lazyWithChunkReload(() => import("./views/tienda/CategoriesView"));
const CategoryPage = lazyWithChunkReload(() => import("./views/tienda/ProductsByCategory"));
const ProductDetail = lazyWithChunkReload(() => import("./views/tienda/ProductDetail"));
const LoginView = lazyWithChunkReload(() => import("./views/login/LoginView"));
const ResetPassword = lazyWithChunkReload(() => import("./views/tienda/ResetPassword"));

const AdminDashboard = lazyWithChunkReload(() => import("./views/admin/AdminDashboard"));
const GestionUsuarios = lazyWithChunkReload(() => import("./views/admin/GestionUsuarios"));
const CategoriasAdmin = lazyWithChunkReload(() => import("./views/admin/CategoriasAdmin"));
const ProductosCategoriasTable = lazyWithChunkReload(
  () => import("./views/admin/ProductosCategoriasTable"),
);

// ===================== LOADER =====================
function RouteLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="h-10 w-10 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
    </div>
  );
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteLoader />}>{element}</Suspense>;
}

// ===================== ROUTER =====================
export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(<LoginView />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: withSuspense(<LoginView />),
  },

  // 🔐 RESET PASSWORD (NUEVO)
  {
    path: "/reset-password",
    element: withSuspense(<ResetPassword />),
  },

  // ===================== ADMIN =====================
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        {withSuspense(<AdminDashboard />)}
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: "usuarios",
        element: withSuspense(<GestionUsuarios />),
      },
      {
        path: "productos",
        element: withSuspense(<ProductosCategoriasTable />),
      },
      {
        path: "categorias",
        element: withSuspense(<CategoriasAdmin />),
      },
      {
        path: "ventas",
        element: <Ventas />,
      },
      {
        path: "banner",
        element: withSuspense(<BannerPage />),
      },
    ],
  },

  // ===================== TIENDA =====================
  {
    path: "/tienda",
    element: withSuspense(
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>,
    ),
    children: [
      {
        index: true,
        element: withSuspense(<CategoriesView />),
      },
      {
        path: "categoria/:id",
        element: withSuspense(<CategoryPage />),
      },
    ],
  },

  // ===================== PRODUCTO =====================
  {
    path: "/producto/:id",
    element: withSuspense(
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>,
    ),
    children: [
      {
        index: true,
        element: withSuspense(<ProductDetail />),
      },
    ],
  },

  // ===================== CHECKOUT =====================
  {
    path: "/checkout",
    element: withSuspense(
      <ProtectedRoute>
        <CheckoutView />
      </ProtectedRoute>,
    ),
  },
]);

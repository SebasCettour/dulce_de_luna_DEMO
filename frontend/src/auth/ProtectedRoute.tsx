// src/auth/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string; // 👈 rol requerido opcional
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user?.role?.toLowerCase();

  // 👇 validación de rol
  if (requiredRole && role !== requiredRole.toLowerCase()) {
    // si no tiene el rol requerido, lo mandamos según su rol real
    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (role === "cliente") {
      return <Navigate to="/tienda" replace />;
    } else {
      // fallback: si el rol no es reconocido, lo mandamos al login
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

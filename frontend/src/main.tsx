import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { router } from "./router";
import { Toaster } from "react-hot-toast";
import ChunkLoadErrorBoundary from "./components/ChunkLoadErrorBoundary";
import DemoBanner from "./components/DemoBanner";
import "./App.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <DemoBanner />
          <Toaster position="top-right" />

          <ChunkLoadErrorBoundary>
            <RouterProvider router={router} />
          </ChunkLoadErrorBoundary>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

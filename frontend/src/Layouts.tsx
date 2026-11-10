import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageMeta from "./components/PageMeta";

export default function Layout() {
  const location = useLocation();

  // Detecta en qué pantallas usar header minimal
  const isMinimal =
    location.pathname.startsWith("/producto") ||
    location.pathname.startsWith("/checkout");

  return (
    <div className="flex flex-col min-h-screen">
      <PageMeta />
      {/* HEADER */}
      <Header variant={isMinimal ? "minimal" : "full"} />

      {/* MAIN */}
      <main
        className={`flex-1 px-4 md:px-6 ${
          isMinimal ? "pt-16 sm:pt-20" : ""
        }`}
      >
        <Outlet />
      </main>

      {/* FOOTER (opcional ocultarlo en minimal si querés) */}
      {!isMinimal && <Footer />}
    </div>
  );
}
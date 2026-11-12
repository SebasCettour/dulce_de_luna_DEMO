import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Buscador from "./Buscador";
import { useAllProducts } from "../hooks/useAllProducts";
import { useBannerMessages } from "../hooks/useBannerMessages";
import useAuth from "../context/AuthContext";
import Marquee from "react-fast-marquee";
import { useAccessibleDialog } from "../hooks/useAccessibleDialog";
import { lazyModal } from "./LazyModal";

const CartModal = lazyModal(() => import("./CartModal"));
const LoginModal = lazyModal(() => import("./UserModal"));
const ComoComprar = lazyModal(() => import("./ComoComprar"));

interface HeaderProps {
  className?: string;
  variant?: "full" | "minimal";
}

const BANNER_H = 40; // h-10

export default function Header({
  className = "",
  variant = "full",
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const menuDialogRef = useAccessibleDialog<HTMLDivElement>(menuOpen, () =>
    setMenuOpen(false),
  );

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const { products, loading } = useAllProducts();
  const { cart } = useCart();
  const { messages } = useBannerMessages();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isMinimal = variant === "minimal";

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const current = window.scrollY;
          const delta = current - lastScrollY.current;

          if (Math.abs(delta) > 8 && !isMinimal) {
            setVisible(!(delta > 0 && current > 120));
          }

          setIsScrolled(current > 80);
          lastScrollY.current = current;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMinimal]);

  const totalItems = cart.reduce(
    (acc, item) => acc + (item.tipo_venta === "peso" ? 1 : item.quantity),
    0,
  );

  const logoBlockClass = isScrolled ? "h-28 sm:h-[150px]" : "h-52 sm:h-[230px]";
  const navbarOffsetClass = isScrolled
    ? "top-28 sm:top-[150px]"
    : "top-52 sm:top-[230px]";

  return (
    <>
      {/* ─── BANNER ─── fijo arriba del todo */}
      {!isMinimal && (
        <div className="relative top-0 left-0 w-full z-[60] h-10 flex items-center bg-green-700 text-white text-[13px] sm:text-sm">
          <Marquee speed={40} gradient={false}>
            {messages.length > 0 ? (
              messages.map((msg, i) => (
                <span key={i} className="mx-6">
                  {msg}
                </span>
              ))
            ) : (
              <span className="mx-6">Cargando ofertas...</span>
            )}
          </Marquee>
        </div>
      )}

      {/* ─── LOGO HEADER ─── debajo del banner */}
      {!isMinimal && (
        <header
          className={`
            fixed left-0 w-full z-40
            bg-pink-green-100/95  border-b-2 border-brown-200 shadow-sm
            transition-all duration-300 ease-out
            ${visible ? "translate-y-0" : "-translate-y-full"}
            ${className}
          `}
          style={{ top: `calc(${BANNER_H}px + var(--demo-banner-height))` }}
        >
          <div
            className={`relative flex flex-col items-center justify-center px-3 sm:px-4 transition-all duration-300 ${logoBlockClass}`}
          >
            {/* Iconos: esquina derecha */}
            <div className="absolute right-3 top-2 sm:top-3 flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Abrir carrito"
                className="relative h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-pink-100/80 text-pink-700 border border-transparent transition-all duration-200 ease-out hover:bg-pink-100 hover:border-pink-400 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 active:scale-95 active:translate-y-0 shadow-sm"
              >
                <span className="text-2xl sm:text-3xl transition-transform duration-200 group-hover:scale-110">
                  🛒
                </span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-700 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold ring-2 ring-white animate-in zoom-in duration-200">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menú de usuario"
                className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-pink-700 text-white hover:bg-pink-800 active:scale-95 shadow-sm text-xl sm:text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-700 focus-visible:ring-offset-2"
              >
                ☰
              </button>
            </div>

            {/* Logo */}
            <img
              src="/logo.png"
              alt="Tienda natural demo"
              className={`object-contain transition-all duration-300 ${
                isScrolled
                  ? "h-24 max-w-[190px] sm:h-32 sm:max-w-[240px]"
                  : "h-36 max-w-[280px] mt-8 sm:mt-0 sm:h-44 sm:max-w-[320px]"
              }`}
            />

            {/* Slogan */}
            <p
              className={`text-xs sm:text-sm text-pink-800 tracking-wide whitespace-nowrap mt-1 transition-all duration-300 ${
                isScrolled
                  ? "opacity-0 h-0 overflow-hidden mt-0"
                  : "opacity-100"
              }`}
            >
              ✦ Dietética · Repostería · Almacén ✦
            </p>

            {/* Contacto */}
            <div
              className={`flex flex-wrap justify-center gap-x-3 sm:gap-x-4 gap-y-1 mt-1 sm:mt-2 transition-all duration-300 ${
                isScrolled
                  ? "opacity-0 h-0 overflow-hidden mt-0"
                  : "opacity-100"
              }`}
            >
              <span className="text-xs text-pink-800 flex items-center gap-1">
                Contacto deshabilitado en la demo
              </span>
              <span className="hidden sm:flex text-xs text-pink-800 items-center gap-1">
                Horarios de ejemplo
              </span>
            </div>
          </div>
        </header>
      )}

      {/* ─── NAVBAR / BUSCADOR ─── debajo del logo */}
      {!isMinimal && (
        <div
          className={`relative left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-pink-100 transition-all duration-300 ${
            visible ? "translate-y-0" : "-translate-y-full"
          } ${navbarOffsetClass}`}
        >
          <div className="max-w-7xl mx-auto px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Buscador products={products} isLoading={loading} />
              </div>

              {/* Botón ayuda — solo desktop */}
              <button
                onClick={() => setHelpOpen(true)}
                aria-label="Cómo comprar"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-800 hover:bg-pink-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-700 focus-visible:ring-offset-2"
              >
                ❓
              </button>

              {/* Panel admin — solo desktop */}
              {user?.role?.toLowerCase() === "admin" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="hidden sm:flex h-9 px-3 items-center justify-center rounded-full bg-pink-700 text-white text-sm hover:bg-pink-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2"
                >
                  Panel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── SPACER ─── */}
      {!isMinimal && <div className={logoBlockClass} aria-hidden="true" />}

      {/* ─── MENU SIDEBAR ─── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex justify-end"
          onClick={() => setMenuOpen(false)}
        >
          <div
            ref={menuDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-menu-title"
            className="w-72 h-full bg-white/95 backdrop-blur-xl shadow-2xl p-5 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del menú */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-lg">
                  {user?.nombre?.charAt(0)?.toUpperCase() || "👤"}
                </div>
                <div>
                  <p
                    id="user-menu-title"
                    className="text-sm font-semibold text-pink-700"
                  >
                    {user?.nombre || "Invitado"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user ? "Mi cuenta" : "No iniciaste sesión"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full border border-transparent bg-pink-700 text-white hover:bg-white hover:border-red-500 hover:text-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-300"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            <div className="h-px bg-pink-100 mb-4" />

            {/* Opciones */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setHelpOpen(true);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pink-50 hover:text-pink-800 text-left text-sm text-gray-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
              >
                ❓ <span>Cómo comprar</span>
              </button>

              {!user ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setLoginOpen(true);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pink-50 text-left text-sm text-gray-700 transition"
                >
                  👤 <span>Iniciar sesión</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setLoginOpen(true);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pink-50 hover:text-pink-800 text-left text-sm text-gray-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                  >
                    ⚙️ <span>Mi perfil</span>
                  </button>

                  {user?.role?.toLowerCase() === "admin" && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/admin");
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pink-700 text-white hover:bg-pink-800 text-left text-sm transition"
                    >
                      🛠 <span>Panel admin</span>
                    </button>
                  )}

                  <div className="h-px bg-pink-100 my-2" />

                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate("/");
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-red-50 hover:text-red-700 text-sm transition"
                  >
                    🚪 <span>Cerrar sesión</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <ComoComprar isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import useAuth from "../context/AuthContext";

import EditProfileModal from "./EditProfileModal";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserModal({ isOpen, onClose }: UserModalProps) {
  const { logout, user } = useAuth();

  const [showEditProfile, setShowEditProfile] = useState(false);

  const [view] = useState<"menu" | "editProfile">("menu");

  useEffect(() => {
    if (!isOpen || view !== "editProfile" || !user) return;
  }, [isOpen, view, user]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Renderizamos en portal para evitar que quede debajo del header
  return ReactDOM.createPortal(
    <>
      {/* MODAL PRINCIPAL */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
        <div className="surface-card w-full max-w-md p-6 relative">
          {/* cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-pink-700 text-white hover:bg-white hover:border-red-500 hover:text-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Cerrar"
          >
            ✖
          </button>

          {/* MENU */}
          {view === "menu" && (
            <>
              <h2 className="text-xl font-semibold text-pink-700 mb-5 text-center">
                Mi Cuenta
              </h2>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="w-full bg-blue-700 text-white py-2.5 rounded-lg hover:bg-blue-800 transition"
                >
                  Editar Datos
                </button>

                <p className="text-sm text-center">La sesión demo no usa contraseña.</p>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-700 text-white py-2.5 rounded-lg hover:bg-red-800 transition"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />

    </>,
    document.body,
  );
}

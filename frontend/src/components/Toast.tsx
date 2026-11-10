import React from "react";

interface ToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
  type?: "success" | "error" | "info";
}

const Toast: React.FC<ToastProps> = ({ show, message, onClose, type = "success" }) => {
  if (!show) return null;
  let color = "bg-white border-pink-200 text-pink-700";
  if (type === "error") color = "bg-white border-red-200 text-red-700";
  if (type === "info") color = "bg-white border-blue-200 text-blue-700";
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
      <div className={`border px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in-down text-sm max-w-md ${color}`}>
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-xs px-3 py-1 bg-pink-700 text-white rounded-full hover:bg-pink-800 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default Toast;

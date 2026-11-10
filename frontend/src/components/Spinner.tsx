import React from "react";

const Spinner: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 40 }) => (
  <div
    className={`flex items-center justify-center ${className}`}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span
      className="block border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin"
      style={{ width: size, height: size, borderTopColor: '#db2777' }}
    />
    <span className="sr-only">Cargando...</span>
  </div>
);

export default Spinner;

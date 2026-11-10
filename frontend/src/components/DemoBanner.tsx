import { resetDemo } from "../demo/store";

export default function DemoBanner() {
  const reset = () => {
    if (!window.confirm("¿Restablecer todos los datos de esta demo en este navegador?")) return;
    try {
      resetDemo();
      window.location.reload();
    } catch (error) {
      console.error("No se pudieron restablecer los datos de la demo", error);
      alert("No se pudieron restablecer los datos de la demo.");
    }
  };

  return (
    <div className="demo-banner">
      <strong>Versión demo: los datos son ficticios</strong>
      <button onClick={reset}>Restablecer datos de demo</button>
    </div>
  );
}

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`mt-12 bg-pink-900 p-6 text-center text-pink-50 ${className}`}>
      <p className="font-bold">Tienda natural demo</p>
      <p>Proyecto ficticio de portafolio. No hay contacto ni ventas reales.</p>
      <p>contacto@example.com · Dirección de ejemplo</p>
    </footer>
  );
}

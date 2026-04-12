import { WA_NUMBER } from "../data/motors";

export default function Navbar() {
  return (
    <nav>
      <a href="/" className="logo">
        <span className="logo-dot"></span><span style={{ color: '#ffffff' }}>Euro</span><span style={{ color: 'var(--accent)' }}>Daguer</span>
      </a>
      <div className="nav-right">
        <a href="/#catalogo" className="nav-link">
          Catálogo
        </a>
        <a href="/#ubicacion" className="nav-link">
          Ubicación
        </a>
        <a href="/" className="nav-link">
          Nosotros
        </a>
        <a
          href={`https://wa.me/${WA_NUMBER}`}
          className="nav-cta"
          target="_blank"
          rel="noreferrer"
        >
          Contacto
        </a>
      </div>
    </nav>
  );
}

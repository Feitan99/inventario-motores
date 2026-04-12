type SidebarProps = {
  query: string;
  setQuery: (q: string) => void;
  tipoFiltro: string;
  setTipoFiltro: (t: string) => void;
  estadoFiltro: string;
  setEstadoFiltro: (e: string) => void;
  marcaFiltro: string;
  setMarcaFiltro: (m: string) => void;
  marcasValidas: string[];
  clearFilters: () => void;
};

export default function Sidebar({
  query,
  setQuery,
  tipoFiltro,
  setTipoFiltro,
  estadoFiltro,
  setEstadoFiltro,
  marcaFiltro,
  setMarcaFiltro,
  marcasValidas,
  clearFilters,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Filtros</div>

      <div className="search-wrap">
        <svg
          className="search-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="search-input"
          type="text"
          placeholder="Buscar marca, modelo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <span className="filter-label">Tipo</span>
        <div className="chips">
          {["todos", "Gasolina", "Diesel"].map((t) => (
            <span
              key={t}
              className={`chip ${tipoFiltro === t ? "on" : ""}`}
              onClick={() => setTipoFiltro(t)}
            >
              {t === "todos" ? "Todos" : t}
            </span>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">Estado</span>
        <div className="chips">
          {["todos", "Disponible", "Reservado"].map((e) => (
            <span
              key={e}
              className={`chip ${estadoFiltro === e ? "on" : ""}`}
              onClick={() => setEstadoFiltro(e)}
            >
              {e === "todos" ? "Todos" : e}
            </span>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">Marca</span>
        <div className="chips">
          <span
            className={`chip ${marcaFiltro === "todos" ? "on" : ""}`}
            onClick={() => setMarcaFiltro("todos")}
          >
            Todas
          </span>
          {marcasValidas.map((m) => (
            <span
              key={m}
              className={`chip ${marcaFiltro === m ? "on" : ""}`}
              onClick={() => setMarcaFiltro(m)}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <button className="reset-btn" onClick={clearFilters}>
        Limpiar filtros
      </button>
    </aside>
  );
}

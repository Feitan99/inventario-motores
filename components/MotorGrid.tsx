import { Motor } from "../data/motors";
import MotorCard from "./MotorCard";

type MotorGridProps = {
  filteredMotors: Motor[];
  sortOrder: string;
  setSortOrder: (s: string) => void;
  onOpenModal: (m: Motor) => void;
};

export default function MotorGrid({
  filteredMotors,
  sortOrder,
  setSortOrder,
  onOpenModal,
}: MotorGridProps) {
  return (
    <section>
      <div className="toolbar">
        <span className="result-info">
          Mostrando <strong>{filteredMotors.length}</strong> motores
        </span>
        <select
          className="sort-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="default">Ordenar por defecto</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="anio-desc">Año: más reciente</option>
          <option value="anio-asc">Año: más antiguo</option>
        </select>
      </div>
      <div className="grid">
        {filteredMotors.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">⊘</div>
            <p>No se encontraron motores con esos filtros.</p>
          </div>
        ) : (
          filteredMotors.map((m, i) => (
            <MotorCard
              key={m.id}
              motor={m}
              index={i}
              onOpenModal={onOpenModal}
            />
          ))
        )}
      </div>
    </section>
  );
}

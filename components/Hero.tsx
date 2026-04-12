import { useMemo } from "react";
import { Motor } from "../data/motors";

type HeroProps = {
  motores: Motor[];
};

export default function Hero({ motores }: HeroProps) {
  const totalDisponibles = useMemo(
    () => motores.filter((m) => m.estado === "Disponible").length,
    [motores]
  );
  
  const marcasValidas = useMemo(
    () => Array.from(new Set(motores.map((m) => m.marca))).length,
    [motores]
  );

  return (
    <section className="hero">
      <div className="hero-watermark">MOTORES</div>
      <div className="hero-inner">
        <div className="hero-eyebrow">
          <span></span>Inventario actualizado
        </div>
        <h1>
          Motores de <em>calidad</em>
          <br />
          para tu vehículo
        </h1>
        <p className="hero-sub">
          Amplio stock de motores para autos y camionetas. Todos verificados,
          con garantía de procedencia.
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-val">
              {totalDisponibles}<em>+</em>
            </div>
            <div className="stat-lbl">Motores en stock</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">
              {marcasValidas}<em>+</em>
            </div>
            <div className="stat-lbl">Marcas disponibles</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">
              100<em>%</em>
            </div>
            <div className="stat-lbl">Verificados</div>
          </div>
        </div>
      </div>
    </section>
  );
}

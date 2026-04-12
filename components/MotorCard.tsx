import Image from "next/image";
import { Motor, WA_NUMBER } from "../data/motors";

function fmt(n: number) {
  return "$\u00a0" + n.toLocaleString("es-CL");
}

type MotorCardProps = {
  motor: Motor;
  index: number;
  onOpenModal: (m: Motor) => void;
};

export default function MotorCard({ motor, index, onOpenModal }: MotorCardProps) {
  const isSold = motor.estado === "Vendido";
  const badgeCls = `badge-${motor.estado.toLowerCase()}`;
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hola! Me interesa el motor ${motor.marca} ${motor.modelo} (${motor.anio}). ¿Está disponible?`
  )}`;
  const validFotos = motor.fotos ? motor.fotos.filter(f => f && f.trim() !== "") : [];

  return (
    <div
      className={`motor-card ${isSold ? "sold" : ""}`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="card-img">
        {validFotos.length > 0 ? (
          <>
            <Image
              src={validFotos[0]}
              alt=""
              fill
              style={{ objectFit: "cover", filter: "blur(20px)", opacity: 0.5, transform: "scale(1.1)" }}
              sizes="(max-width: 768px) 10vw, 100px"
            />
            <Image
              src={validFotos[0]}
              alt={`${motor.marca} ${motor.modelo}`}
              fill
              style={{ objectFit: "contain", zIndex: 1 }}
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </>
        ) : (
          <div className="card-img-placeholder">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span>Sin foto</span>
          </div>
        )}
        <span className={`card-badge ${badgeCls}`}>{motor.estado}</span>
        <span className="card-tipo">{motor.tipo}</span>
      </div>
      <div className="card-body">
        <div className="card-make">{motor.marca}</div>
        <div className="card-model">{motor.modelo}</div>
        <div className="card-meta">
          <span className="meta-pill">{motor.anio}</span>
          <span className="meta-pill">{motor.ubicacion}</span>
          <span className="meta-pill">N° {motor.nro_serie}</span>
        </div>
        <div className="card-price">
          {fmt(motor.precio)}
          <span className="price-label">precio venta</span>
        </div>
      </div>
      <div className="card-footer">
        <a className="btn-wa" href={waUrl} target="_blank" rel="noreferrer">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.103 1.51 5.833L.055 23.145a.75.75 0 0 0 .917.882l5.516-1.444A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.5c-1.99 0-3.85-.54-5.44-1.478l-.388-.232-4.03 1.056 1.078-3.932-.253-.4A10.45 10.45 0 0 1 1.5 12C1.5 6.21 6.21 1.5 12 1.5S22.5 6.21 22.5 12 17.79 22.5 12 22.5z" />
          </svg>
          WhatsApp
        </a>
        <button className="btn-detail" onClick={() => onOpenModal(motor)}>
          Ver más
        </button>
      </div>
    </div>
  );
}

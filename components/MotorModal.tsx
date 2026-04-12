import Image from "next/image";
import { Motor, WA_NUMBER } from "../data/motors";
import { useEffect, useState } from "react";

function fmt(n: number) {
  return "$\u00a0" + n.toLocaleString("es-CL");
}

type MotorModalProps = {
  motor: Motor | null;
  onClose: () => void;
};

export default function MotorModal({ motor, onClose }: MotorModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Handle Escape key inside the component
  useEffect(() => {
    if (motor) setCurrentIdx(0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (motor) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [motor, onClose]);

  if (!motor) return null;

  const validFotos = motor.fotos ? motor.fotos.filter(f => f && f.trim() !== "") : [];
  const safeIdx = currentIdx < validFotos.length ? currentIdx : 0;

  return (
    <div
      className="modal-overlay"
      style={{ display: "flex" }}
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
          onClose();
        }
      }}
    >
      <div className="modal">
        <div className="modal-img" style={{ position: "relative" }}>
          {validFotos.length > 0 ? (
            <>
              <Image
                src={validFotos[safeIdx]}
                alt={`${motor.marca} ${motor.modelo}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 640px) 100vw, 640px"
              />
              {validFotos.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentIdx(prev => prev > 0 ? prev - 1 : validFotos.length - 1); }}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    &#10094;
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentIdx(prev => prev < validFotos.length - 1 ? prev + 1 : 0); }}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    &#10095;
                  </button>
                  <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 10 }}>
                    {validFotos.map((_, i) => (
                      <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === safeIdx ? 'var(--accent)' : 'rgba(255,255,255,0.5)', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: ".5rem",
                opacity: ".2",
              }}
            >
              <svg
                width="48"
                height="48"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
        <div className="modal-body">
          <div className="modal-header">
            <div>
              <div className="modal-make">{motor.marca}</div>
              <div className="modal-model">{motor.modelo}</div>
            </div>
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="modal-grid">
            <div className="modal-field">
              <label>Tipo</label>
              <span>{motor.tipo}</span>
            </div>
            <div className="modal-field">
              <label>Año</label>
              <span>{motor.anio}</span>
            </div>
            <div className="modal-field">
              <label>N° Serie</label>
              <span>{motor.nro_serie}</span>
            </div>
            <div className="modal-field">
              <label>Estado</label>
              <span>{motor.estado}</span>
            </div>
            <div className="modal-field">
              <label>Ubicación</label>
              <span>{motor.ubicacion}</span>
            </div>
            <div className="modal-field">
              <label>Precio venta</label>
              <span>{fmt(motor.precio)}</span>
            </div>
          </div>
          {motor.observaciones && (
            <div className="modal-obs">
              <label>Observaciones</label>
              <p>{motor.observaciones}</p>
            </div>
          )}
          <div className="modal-footer">
            <a
              className="btn-wa"
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                `Hola! Me interesa el motor ${motor.marca} ${motor.modelo} (${motor.anio}). ¿Está disponible?`
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ marginRight: "0.4rem" }}
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.103 1.51 5.833L.055 23.145a.75.75 0 0 0 .917.882l5.516-1.444A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.5c-1.99 0-3.85-.54-5.44-1.478l-.388-.232-4.03 1.056 1.078-3.932-.253-.4A10.45 10.45 0 0 1 1.5 12C1.5 6.21 6.21 1.5 12 1.5S22.5 6.21 22.5 12 17.79 22.5 12 22.5z" />
              </svg>
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

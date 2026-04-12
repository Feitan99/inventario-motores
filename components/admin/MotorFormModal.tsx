"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Marca, Modelo, MotorRow } from "@/app/admin/page";

type ExistingPhoto = {
  id: string;
  storage_path: string;
  url: string;
};

type Props = {
  motor: MotorRow | null;
  marcas: Marca[];
  modelos: Modelo[];
  onClose: () => void;
  onSaved: () => void;
};

const TIPOS = ["Gasolina", "Diesel", "Eléctrico", "Híbrido"];
const ESTADOS = [
  { value: "disponible", label: "Disponible" },
  { value: "reservado", label: "Reservado" },
  { value: "vendido", label: "Vendido" },
];

export default function MotorFormModal({ motor, marcas, modelos, onClose, onSaved }: Props) {
  const isEdit = !!motor;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [marcaId, setMarcaId] = useState(motor ? String(motor.marca_id) : "");
  const [nuevaMarca, setNuevaMarca] = useState("");
  const [modeloId, setModeloId] = useState(motor ? String(motor.modelo_id) : "");
  const [nuevoModelo, setNuevoModelo] = useState("");
  const [tipo, setTipo] = useState(motor?.tipo_combustible || "Gasolina");
  const [anio, setAnio] = useState(motor ? String(motor.anio) : String(new Date().getFullYear()));
  const [nroSerie, setNroSerie] = useState(motor?.numero_serie || "");
  const [estado, setEstado] = useState(motor?.estado || "disponible");
  const [ubicacion, setUbicacion] = useState(motor?.ubicacion || "");
  const [costo, setCosto] = useState(motor ? String(motor.costo_compra) : "");
  const [precio, setPrecio] = useState(motor ? String(motor.precio_venta) : "");
  const [obs, setObs] = useState(motor?.observaciones || "");

  // Photos
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<{ id: string; path: string }[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Resolve existing photos on mount
  useEffect(() => {
    if (motor?.motor_fotos) {
      setExistingPhotos(
        motor.motor_fotos.map((f) => {
          let url = f.storage_path;
          if (!f.storage_path.startsWith("http")) {
            const {
              data: { publicUrl },
            } = supabase.storage.from("fotos-motores").getPublicUrl(f.storage_path);
            url = publicUrl;
          }
          return { id: f.id, storage_path: f.storage_path, url };
        })
      );
    }
  }, [motor]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const marcaIsNew = marcaId === "__nueva__";
  const modeloIsNew = modeloId === "__nuevo__";
  const modelosFiltrados = !marcaIsNew && marcaId
    ? modelos.filter((m) => String(m.marca_id) === marcaId)
    : [];

  function handleMarcaChange(val: string) {
    setMarcaId(val);
    setModeloId("");
    setNuevoModelo("");
    setNuevaMarca("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewFiles((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  }

  function removeNewFile(idx: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  function markPhotoForDeletion(photo: ExistingPhoto) {
    setPhotosToDelete((prev) => [...prev, { id: photo.id, path: photo.storage_path }]);
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // 1. Resolve marca
      let resolvedMarcaId: string;
      if (marcaIsNew) {
        if (!nuevaMarca.trim()) throw new Error("Ingresá el nombre de la marca");
        const { data, error } = await supabase
          .from("marcas")
          .insert({ nombre: nuevaMarca.trim() })
          .select("id")
          .single();
        if (error) throw error;
        resolvedMarcaId = data.id;
      } else {
        if (!marcaId) throw new Error("Seleccioná una marca");
        resolvedMarcaId = marcaId;
      }

      // 2. Resolve modelo
      let resolvedModeloId: string;
      if (marcaIsNew || modeloIsNew) {
        if (!nuevoModelo.trim()) throw new Error("Ingresá el nombre del modelo");
        const { data, error } = await supabase
          .from("modelos")
          .insert({ nombre: nuevoModelo.trim(), marca_id: resolvedMarcaId })
          .select("id")
          .single();
        if (error) throw error;
        resolvedModeloId = data.id;
      } else {
        if (!modeloId) throw new Error("Seleccioná un modelo");
        resolvedModeloId = modeloId;
      }

      const motorData = {
        numero_serie: nroSerie.trim(),
        tipo_combustible: tipo,
        anio: parseInt(anio),
        estado,
        ubicacion: ubicacion.trim(),
        costo_compra: parseFloat(costo) || 0,
        precio_venta: parseFloat(precio) || 0,
        observaciones: obs.trim(),
        marca_id: resolvedMarcaId,
        modelo_id: resolvedModeloId,
      };

      let motorId: string;

      if (isEdit) {
        // Update
        const { error } = await supabase
          .from("motores")
          .update(motorData)
          .eq("id", motor!.id);
        if (error) throw error;
        motorId = motor!.id;

        // Delete removed photos
        if (photosToDelete.length > 0) {
          const storagePaths = photosToDelete
            .map((p) => p.path)
            .filter((p) => !p.startsWith("http"));
          if (storagePaths.length > 0) {
            await supabase.storage.from("fotos-motores").remove(storagePaths);
          }
          await supabase
            .from("motor_fotos")
            .delete()
            .in(
              "id",
              photosToDelete.map((p) => p.id)
            );
        }
      } else {
        // Insert
        const { data, error } = await supabase
          .from("motores")
          .insert(motorData)
          .select("id")
          .single();
        if (error) throw error;
        motorId = data.id;
      }

      // Upload new photos
      for (const file of newFiles) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${motorId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("fotos-motores")
          .upload(path, file);
        if (upErr) throw upErr;
        await supabase.from("motor_fotos").insert({ motor_id: motorId, storage_path: path });
      }

      onSaved();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        zIndex: 200,
        overflowY: "auto",
        padding: "2rem 1rem 4rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          width: "100%",
          maxWidth: 700,
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem 1.5rem 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-barlow-condensed)",
              fontSize: "1.4rem",
            }}
          >
            {isEdit ? "Editar motor" : "Agregar motor"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text2)",
              cursor: "pointer",
              fontSize: "1.25rem",
              padding: "0.25rem 0.5rem",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Marca + Modelo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Marca</label>
              <select
                value={marcaId}
                onChange={(e) => handleMarcaChange(e.target.value)}
                required
                style={selectStyle}
              >
                <option value="">Seleccionar...</option>
                {marcas.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.nombre}
                  </option>
                ))}
                <option value="__nueva__">+ Nueva marca</option>
              </select>
              {marcaIsNew && (
                <input
                  type="text"
                  placeholder="Nombre de la nueva marca"
                  value={nuevaMarca}
                  onChange={(e) => setNuevaMarca(e.target.value)}
                  style={{ ...inputStyle, marginTop: "0.5rem" }}
                  autoFocus
                />
              )}
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Modelo</label>
              {marcaIsNew ? (
                <input
                  type="text"
                  placeholder="Nombre del modelo"
                  value={nuevoModelo}
                  onChange={(e) => setNuevoModelo(e.target.value)}
                  style={inputStyle}
                />
              ) : (
                <>
                  <select
                    value={modeloId}
                    onChange={(e) => setModeloId(e.target.value)}
                    required
                    disabled={!marcaId}
                    style={{
                      ...selectStyle,
                      opacity: !marcaId ? 0.5 : 1,
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {modelosFiltrados.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {m.nombre}
                      </option>
                    ))}
                    <option value="__nuevo__">+ Nuevo modelo</option>
                  </select>
                  {modeloIsNew && (
                    <input
                      type="text"
                      placeholder="Nombre del nuevo modelo"
                      value={nuevoModelo}
                      onChange={(e) => setNuevoModelo(e.target.value)}
                      style={{ ...inputStyle, marginTop: "0.5rem" }}
                      autoFocus
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tipo + Año + N° Serie */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Tipo combustible</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                style={selectStyle}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                min={1980}
                max={2030}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>N° de serie</label>
              <input
                type="text"
                value={nroSerie}
                onChange={(e) => setNroSerie(e.target.value)}
                placeholder="EJ1234567"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Estado + Ubicación */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                style={selectStyle}
              >
                {ESTADOS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Ubicación</label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Bodega A, estante 3..."
                style={inputStyle}
              />
            </div>
          </div>

          {/* Costo + Precio */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Costo de compra (CLP)</label>
              <input
                type="number"
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                min={0}
                placeholder="0"
                style={inputStyle}
              />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Precio de venta (CLP)</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                min={0}
                placeholder="0"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Observaciones */}
          <div style={fieldGroup}>
            <label style={labelStyle}>Observaciones</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={3}
              placeholder="Estado del motor, detalles técnicos, notas de compra..."
              style={{ ...inputStyle, resize: "vertical", minHeight: 80, lineHeight: 1.5 }}
            />
          </div>

          {/* Fotos */}
          <div style={fieldGroup}>
            <label style={labelStyle}>Fotos</label>

            {/* Existing photos */}
            {existingPhotos.length > 0 && (
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.6rem" }}
              >
                {existingPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      position: "relative",
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt="foto existente"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => markPhotoForDeletion(photo)}
                      title="Eliminar foto"
                      style={photoDeleteBtn}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New photo previews */}
            {newPreviews.length > 0 && (
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.6rem" }}
              >
                {newPreviews.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid var(--accent)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt="nueva foto"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      style={photoDeleteBtn}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "0.65rem 1rem",
                background: "transparent",
                border: "1px dashed var(--border2)",
                borderRadius: 8,
                color: "var(--text2)",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontFamily: "var(--font-barlow)",
                textAlign: "center",
              }}
            >
              + Agregar fotos
            </button>
          </div>

          {/* Error */}
          {error && (
            <p
              style={{
                margin: 0,
                color: "#ef4444",
                fontSize: "0.875rem",
                padding: "0.5rem 0.75rem",
                background: "#ef444411",
                borderRadius: 6,
              }}
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              paddingTop: "0.5rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "0.65rem 1.25rem",
                background: "transparent",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "var(--font-barlow)",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "0.65rem 1.5rem",
                background: saving ? "var(--border)" : "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontFamily: "var(--font-barlow)",
                fontSize: "0.95rem",
              }}
            >
              {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear motor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const fieldGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "var(--text2)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle: React.CSSProperties = {
  padding: "0.65rem 0.85rem",
  background: "var(--bg3)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  fontSize: "0.9rem",
  outline: "none",
  fontFamily: "var(--font-barlow)",
  width: "100%",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "auto",
};

const photoDeleteBtn: React.CSSProperties = {
  position: "absolute",
  top: 3,
  right: 3,
  background: "rgba(0,0,0,0.72)",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: 20,
  height: 20,
  cursor: "pointer",
  fontSize: "0.65rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  lineHeight: 1,
};

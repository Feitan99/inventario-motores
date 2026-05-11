"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Marca, Modelo, MotorRow } from "@/app/admin/page";

type Props = {
  marcas: Marca[];
  modelos: Modelo[];
  motores: MotorRow[];
  onRefresh: () => void;
};

type EditingState = { type: "marca" | "modelo"; id: string; nombre: string } | null;
type DeletingState = { type: "marca" | "modelo"; id: string; nombre: string; count: number } | null;

export default function MarcasManager({ marcas, modelos, motores, onRefresh }: Props) {
  const [editing, setEditing] = useState<EditingState>(null);
  const [deleting, setDeleting] = useState<DeletingState>(null);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  const culatasPorMarca = (marcaId: string) =>
    motores.filter((m) => m.marca_id === marcaId).length;

  const culatasPorModelo = (modeloId: string) =>
    motores.filter((m) => m.modelo_id === modeloId).length;

  const modelosDeMarca = (marcaId: string) =>
    modelos.filter((m) => m.marca_id === marcaId);

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    setError("");
    const nombre = editing.nombre.trim();
    if (!nombre) { setError("El nombre no puede estar vacío."); setSaving(false); return; }

    const table = editing.type === "marca" ? "marcas" : "modelos";
    const { error: err } = await supabase.from(table).update({ nombre }).eq("id", editing.id);
    if (err) { setError("Error al guardar: " + err.message); setSaving(false); return; }

    setEditing(null);
    setSaving(false);
    onRefresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    setError("");

    const table = deleting.type === "marca" ? "marcas" : "modelos";
    const { error: err } = await supabase.from(table).delete().eq("id", deleting.id);
    if (err) { setError("Error al eliminar: " + err.message); setDeleteLoading(false); return; }

    setDeleting(null);
    setDeleteLoading(false);
    onRefresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Marcas */}
      <div>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontFamily: "var(--font-barlow-condensed)", letterSpacing: "0.02em" }}>
          Marcas <span style={{ color: "var(--text2)", fontWeight: 400, fontSize: "0.9rem" }}>({marcas.length})</span>
        </h2>
        <div style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                {["Nombre", "Culatas", "Acciones"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marcas.map((marca, i) => {
                const count = culatasPorMarca(marca.id);
                const isEditing = editing?.type === "marca" && editing.id === marca.id;
                return (
                  <tr key={marca.id} style={{ borderBottom: i < marcas.length - 1 ? "1px solid var(--border)" : "none", background: i % 2 === 0 ? "var(--card)" : "var(--bg2)" }}>
                    <td style={tdStyle}>
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editing.nombre}
                          onChange={(e) => setEditing({ ...editing, nombre: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(null); }}
                          style={inlineInputStyle}
                        />
                      ) : (
                        marca.nombre
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: "var(--text2)" }}>{count}</td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      {isEditing ? (
                        <>
                          <button onClick={handleSave} disabled={saving} style={{ ...actionBtn, color: "var(--green)" }}>
                            {saving ? "Guardando..." : "Guardar"}
                          </button>
                          <button onClick={() => setEditing(null)} style={{ ...actionBtn, marginLeft: 6 }}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditing({ type: "marca", id: marca.id, nombre: marca.nombre })}
                            style={actionBtn}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setDeleting({ type: "marca", id: marca.id, nombre: marca.nombre, count })}
                            style={{ ...actionBtn, marginLeft: 6, color: "#ef4444", border: "1px solid #ef444440" }}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {marcas.length === 0 && (
                <tr><td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "var(--text2)" }}>Sin marcas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modelos */}
      <div>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontFamily: "var(--font-barlow-condensed)", letterSpacing: "0.02em" }}>
          Modelos <span style={{ color: "var(--text2)", fontWeight: 400, fontSize: "0.9rem" }}>({modelos.length})</span>
        </h2>
        <div style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                {["Marca", "Modelo", "Culatas", "Acciones"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const allModelos = marcas.flatMap((marca) =>
                  modelosDeMarca(marca.id).map((modelo) => ({ marca, modelo }))
                );
                return allModelos.map(({ marca, modelo }, globalIdx) => {
                  const count = culatasPorModelo(modelo.id);
                  const isEditing = editing?.type === "modelo" && editing.id === modelo.id;
                  const isLast = globalIdx === allModelos.length - 1;
                  return (
                    <tr key={modelo.id} style={{ borderBottom: !isLast ? "1px solid var(--border)" : "none", background: globalIdx % 2 === 0 ? "var(--card)" : "var(--bg2)" }}>
                      <td style={{ ...tdStyle, color: "var(--text2)" }}>{marca.nombre}</td>
                      <td style={tdStyle}>
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editing.nombre}
                            onChange={(e) => setEditing({ ...editing, nombre: e.target.value })}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(null); }}
                            style={inlineInputStyle}
                          />
                        ) : (
                          modelo.nombre
                        )}
                      </td>
                      <td style={{ ...tdStyle, color: "var(--text2)" }}>{count}</td>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        {isEditing ? (
                          <>
                            <button onClick={handleSave} disabled={saving} style={{ ...actionBtn, color: "var(--green)" }}>
                              {saving ? "Guardando..." : "Guardar"}
                            </button>
                            <button onClick={() => setEditing(null)} style={{ ...actionBtn, marginLeft: 6 }}>Cancelar</button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditing({ type: "modelo", id: modelo.id, nombre: modelo.nombre })}
                              style={actionBtn}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setDeleting({ type: "modelo", id: modelo.id, nombre: modelo.nombre, count })}
                              style={{ ...actionBtn, marginLeft: 6, color: "#ef4444", border: "1px solid #ef444440" }}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
              {modelos.length === 0 && (
                <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--text2)" }}>Sin modelos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error inline */}
      {error && (
        <p style={{ margin: 0, color: "#ef4444", fontSize: "0.875rem", padding: "0.5rem 0.75rem", background: "#ef444411", borderRadius: 6 }}>
          {error}
        </p>
      )}

      {/* Modal confirmación eliminar */}
      {deleting && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "1rem" }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "2rem", maxWidth: 400, width: "100%" }}>
            {deleting.count > 0 ? (
              <>
                <h3 style={{ margin: "0 0 0.75rem", fontFamily: "var(--font-barlow-condensed)", fontSize: "1.3rem" }}>
                  No se puede eliminar
                </h3>
                <p style={{ margin: "0 0 1.5rem", color: "var(--text2)", fontSize: "0.875rem" }}>
                  <strong style={{ color: "var(--text)" }}>{deleting.nombre}</strong> tiene{" "}
                  <strong style={{ color: "var(--accent)" }}>{deleting.count} culata{deleting.count !== 1 ? "s" : ""}</strong> asociada{deleting.count !== 1 ? "s" : ""}.
                  Reasigná o eliminá esas culatas primero.
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => setDeleting(null)} style={btnGhostStyle}>Cerrar</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ margin: "0 0 0.5rem", fontFamily: "var(--font-barlow-condensed)", fontSize: "1.3rem" }}>
                  ¿Eliminar {deleting.type === "marca" ? "esta marca" : "este modelo"}?
                </h3>
                <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>{deleting.nombre}</p>
                <p style={{ margin: "0 0 1.5rem", color: "var(--text2)", fontSize: "0.875rem" }}>
                  Esta acción es irreversible.
                </p>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <button onClick={() => setDeleting(null)} disabled={deleteLoading} style={btnGhostStyle}>Cancelar</button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    style={{ padding: "0.6rem 1.25rem", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: deleteLoading ? "not-allowed" : "pointer", fontWeight: 600, fontFamily: "var(--font-barlow)", opacity: deleteLoading ? 0.7 : 1 }}
                  >
                    {deleteLoading ? "Eliminando..." : "Sí, eliminar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  fontWeight: 600,
  color: "var(--text2)",
  whiteSpace: "nowrap",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const tdStyle: React.CSSProperties = {
  padding: "0.7rem 1rem",
  color: "var(--text)",
};

const actionBtn: React.CSSProperties = {
  padding: "0.3rem 0.75rem",
  background: "transparent",
  color: "var(--text2)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: "0.8rem",
  fontFamily: "var(--font-barlow)",
};

const inlineInputStyle: React.CSSProperties = {
  padding: "0.3rem 0.6rem",
  background: "var(--bg3)",
  border: "1px solid var(--accent)",
  borderRadius: 6,
  color: "var(--text)",
  fontSize: "0.875rem",
  fontFamily: "var(--font-barlow)",
  outline: "none",
  width: "100%",
  maxWidth: 220,
};

const btnGhostStyle: React.CSSProperties = {
  padding: "0.6rem 1.1rem",
  background: "transparent",
  color: "var(--text2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: "0.875rem",
  fontFamily: "var(--font-barlow)",
};

"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import MotorFormModal from "@/components/admin/MotorFormModal";

export type MotorRow = {
  id: string;
  numero_serie: string;
  tipo_combustible: string;
  anio: number;
  estado: string;
  ubicacion: string;
  costo_compra: number;
  precio_venta: number;
  observaciones: string;
  marca_id: string;
  modelo_id: string;
  marcas: { nombre: string } | null;
  modelos: { nombre: string } | null;
  motor_fotos: { id: string; storage_path: string }[];
};

export type Marca = { id: string; nombre: string };
export type Modelo = { id: string; nombre: string; marca_id: string };

const ESTADO_COLOR: Record<string, string> = {
  disponible: "var(--green)",
  reservado: "var(--blue)",
  vendido: "var(--amber)",
};

function fmt(n: number) {
  return "$ " + n.toLocaleString("es-CL");
}

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [motores, setMotores] = useState<MotorRow[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMotor, setEditingMotor] = useState<MotorRow | null>(null);
  const [deletingMotor, setDeletingMotor] = useState<MotorRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: motoresData }, { data: marcasData }, { data: modelosData }] =
      await Promise.all([
        supabase
          .from("motores")
          .select(
            `id, numero_serie, tipo_combustible, anio, estado, ubicacion,
             costo_compra, precio_venta, observaciones, marca_id, modelo_id,
             marcas(nombre), modelos(nombre), motor_fotos(id, storage_path)`
          )
          .order("anio", { ascending: false }),
        supabase.from("marcas").select("id, nombre").order("nombre"),
        supabase.from("modelos").select("id, nombre, marca_id").order("nombre"),
      ]);
    setMotores((motoresData as unknown as MotorRow[]) || []);
    setMarcas((marcasData as Marca[]) || []);
    setModelos((modelosData as Modelo[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/admin/login");
        return;
      }
      setAuthed(true);
      await fetchData();
    }
    init();
  }, [router, fetchData]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  async function handleDelete() {
    if (!deletingMotor) return;
    setDeleteLoading(true);

    // Remove storage files
    const paths = deletingMotor.motor_fotos
      .map((f) => f.storage_path)
      .filter((p) => !p.startsWith("http"));
    if (paths.length > 0) {
      await supabase.storage.from("fotos-motores").remove(paths);
    }

    await supabase.from("motor_fotos").delete().eq("motor_id", deletingMotor.id);
    await supabase.from("motores").delete().eq("id", deletingMotor.id);

    setDeletingMotor(null);
    setDeleteLoading(false);
    fetchData();
  }

  function openCreate() {
    setEditingMotor(null);
    setFormOpen(true);
  }

  function openEdit(motor: MotorRow) {
    setEditingMotor(motor);
    setFormOpen(true);
  }

  if (!authed) return null;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        background: "var(--bg)",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.7rem",
              fontFamily: "var(--font-barlow-condensed)",
            }}
          >
            Panel de Administración
          </h1>
          <p style={{ margin: "0.25rem 0 0", color: "var(--text2)", fontSize: "0.9rem" }}>
            {loading ? "Cargando..." : `${motores.length} motor${motores.length !== 1 ? "es" : ""} en inventario`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={openCreate} style={btnPrimaryStyle}>
            + Agregar motor
          </button>
          <button onClick={handleLogout} style={btnGhostStyle}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text2)", padding: "4rem" }}>
          Cargando inventario...
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            borderRadius: 10,
            border: "1px solid var(--border)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                {[
                  "Marca",
                  "Modelo",
                  "Tipo",
                  "Año",
                  "N° Serie",
                  "Ubicación",
                  "Estado",
                  "Precio venta",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--text2)",
                      whiteSpace: "nowrap",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {motores.map((m, i) => (
                <tr
                  key={m.id}
                  style={{
                    borderBottom:
                      i < motores.length - 1 ? "1px solid var(--border)" : "none",
                    background: i % 2 === 0 ? "var(--card)" : "var(--bg2)",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={tdStyle}>{m.marcas?.nombre || "—"}</td>
                  <td style={tdStyle}>{m.modelos?.nombre || "—"}</td>
                  <td style={tdStyle}>{m.tipo_combustible}</td>
                  <td style={tdStyle}>{m.anio}</td>
                  <td
                    style={{
                      ...tdStyle,
                      fontFamily: "monospace",
                      fontSize: "0.78rem",
                      color: "var(--text2)",
                    }}
                  >
                    {m.numero_serie || "—"}
                  </td>
                  <td style={{ ...tdStyle, color: "var(--text2)" }}>{m.ubicacion || "—"}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "0.2rem 0.65rem",
                        borderRadius: 20,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        background: `${ESTADO_COLOR[m.estado] || "var(--text3)"}22`,
                        color: ESTADO_COLOR[m.estado] || "var(--text2)",
                      }}
                    >
                      {m.estado.charAt(0).toUpperCase() + m.estado.slice(1)}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt(m.precio_venta)}</td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => openEdit(m)}
                      style={{ ...actionBtnStyle, marginRight: 6 }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeletingMotor(m)}
                      style={{
                        ...actionBtnStyle,
                        color: "#ef4444",
                        borderColor: "#ef444440",
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {motores.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: "4rem",
                      textAlign: "center",
                      color: "var(--text2)",
                    }}
                  >
                    No hay motores. Usá el botón{" "}
                    <strong style={{ color: "var(--accent)" }}>+ Agregar motor</strong> para
                    comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm modal */}
      {deletingMotor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "2rem",
              maxWidth: 400,
              width: "100%",
            }}
          >
            <h3
              style={{
                margin: "0 0 0.5rem",
                fontFamily: "var(--font-barlow-condensed)",
                fontSize: "1.3rem",
              }}
            >
              ¿Eliminar este motor?
            </h3>
            <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>
              {deletingMotor.marcas?.nombre} {deletingMotor.modelos?.nombre} ({deletingMotor.anio})
            </p>
            <p
              style={{
                margin: "0 0 1.5rem",
                color: "var(--text2)",
                fontSize: "0.875rem",
              }}
            >
              Esta acción es irreversible. Se eliminarán el motor y todas sus fotos.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeletingMotor(null)}
                disabled={deleteLoading}
                style={btnGhostStyle}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  padding: "0.6rem 1.25rem",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontFamily: "var(--font-barlow)",
                  opacity: deleteLoading ? 0.7 : 1,
                }}
              >
                {deleteLoading ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <MotorFormModal
          motor={editingMotor}
          marcas={marcas}
          modelos={modelos}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: "0.7rem 1rem",
  color: "var(--text)",
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: "0.6rem 1.2rem",
  background: "var(--accent)",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.9rem",
  fontFamily: "var(--font-barlow)",
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

const actionBtnStyle: React.CSSProperties = {
  padding: "0.3rem 0.75rem",
  background: "transparent",
  color: "var(--text2)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: "0.8rem",
  fontFamily: "var(--font-barlow)",
};

"use client";

import { useState, useMemo, useEffect } from "react";
import { Motor } from "../data/motors";
import { supabase } from "../lib/supabase";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MotorGrid from "../components/MotorGrid";
import MotorModal from "../components/MotorModal";
import Location from "../components/Location";

export default function Catalog() {
  const [motores, setMotores] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [query, setQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [marcaFiltro, setMarcaFiltro] = useState("todos");
  const [sortOrder, setSortOrder] = useState("default");
  
  const [modalMotor, setModalMotor] = useState<Motor | null>(null);

  const loadMotores = async () => {
    setLoading(true);
    setFetchError(false);
    const { data, error } = await supabase
      .from('motores')
      .select(`
        id,
        numero_serie,
        tipo_combustible,
        anio,
        estado,
        ubicacion,
        costo_compra,
        precio_venta,
        observaciones,
        marcas ( nombre ),
        modelos ( nombre ),
        motor_fotos ( storage_path )
      `);

    if (error) {
      console.error("Error cargando motores:", error);
      setFetchError(true);
    } else if (data) {
        const mappedData: Motor[] = data.map((m: any) => ({
          id: m.id,
          nro_serie: m.numero_serie,
          marca: m.marcas?.nombre || 'Desconocida',
          modelo: m.modelos?.nombre || 'Desconocido',
          tipo: m.tipo_combustible,
          anio: m.anio,
          estado: m.estado === 'disponible' ? 'Disponible' : m.estado === 'reservado' ? 'Reservado' : 'Vendido',
          ubicacion: m.ubicacion || 'Sin ubicación',
          costo: m.costo_compra,
          precio: m.precio_venta,
          observaciones: m.observaciones || '',
          fotos: m.motor_fotos ? m.motor_fotos.map((f: any) => {
            if (f.storage_path && f.storage_path.startsWith('http')) {
              return f.storage_path;
            }
            const { data: { publicUrl } } = supabase.storage.from('fotos-motores').getPublicUrl(f.storage_path);
            return publicUrl;
          }) : []
        }));
        setMotores(mappedData);
      }
    setLoading(false);
  };

  useEffect(() => {
    loadMotores();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const marcasValidas = useMemo(() => {
    return Array.from(new Set(motores.map((m) => m.marca))).sort();
  }, [motores]);

  const clearFilters = () => {
    setQuery("");
    setTipoFiltro("todos");
    setEstadoFiltro("todos");
    setMarcaFiltro("todos");
    setSortOrder("default");
  };

  const filteredMotors = useMemo(() => {
    const list = motores.filter((m) => {
      if (tipoFiltro !== "todos" && m.tipo !== tipoFiltro) return false;
      if (estadoFiltro !== "todos" && m.estado !== estadoFiltro) return false;
      if (marcaFiltro !== "todos" && m.marca !== marcaFiltro) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!`${m.marca} ${m.modelo} ${m.tipo}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (sortOrder === "precio-asc") list.sort((a, b) => a.precio - b.precio);
    if (sortOrder === "precio-desc") list.sort((a, b) => b.precio - a.precio);
    if (sortOrder === "anio-desc") list.sort((a, b) => b.anio - a.anio);
    if (sortOrder === "anio-asc") list.sort((a, b) => a.anio - b.anio);

    return list;
  }, [motores, tipoFiltro, estadoFiltro, marcaFiltro, query, sortOrder]);

  return (
    <>
      <Hero motores={motores} />
      <div className="mainLayout" id="catalogo">
        <Sidebar 
          query={query} setQuery={setQuery}
          tipoFiltro={tipoFiltro} setTipoFiltro={setTipoFiltro}
          estadoFiltro={estadoFiltro} setEstadoFiltro={setEstadoFiltro}
          marcaFiltro={marcaFiltro} setMarcaFiltro={setMarcaFiltro}
          marcasValidas={marcasValidas}
          clearFilters={clearFilters}
        />
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>
            Cargando inventario de motores...
          </div>
        ) : fetchError ? (
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              No se pudo cargar el inventario. Revisá tu conexión.
            </p>
            <button
              onClick={loadMotores}
              style={{
                padding: '0.5rem 1.25rem',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                fontFamily: 'var(--font-barlow)',
              }}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <MotorGrid 
            filteredMotors={filteredMotors}
            sortOrder={sortOrder} setSortOrder={setSortOrder}
            onOpenModal={setModalMotor}
          />
        )}
      </div>
      
      <Location />

      <MotorModal motor={modalMotor} onClose={() => setModalMotor(null)} />
    </>
  );
}

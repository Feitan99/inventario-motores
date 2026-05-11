import { sql } from "./client";
import type { MarcaRow, ModeloRow } from "./types";

// — Marcas —

export async function getMarcas(): Promise<MarcaRow[]> {
  const rows = await sql`SELECT id, nombre FROM marcas ORDER BY nombre`;
  return rows as MarcaRow[];
}

export async function createMarca(nombre: string): Promise<MarcaRow> {
  const rows = await sql`
    INSERT INTO marcas (nombre) VALUES (${nombre}) RETURNING *
  `;
  return rows[0] as MarcaRow;
}

export async function updateMarca(id: string, nombre: string): Promise<MarcaRow | null> {
  const rows = await sql`
    UPDATE marcas SET nombre = ${nombre} WHERE id = ${id} RETURNING *
  `;
  return (rows[0] as MarcaRow) ?? null;
}

export async function deleteMarca(id: string): Promise<void> {
  await sql`DELETE FROM marcas WHERE id = ${id}`;
}

export async function countCulatasPorMarca(marcaId: string): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) AS total FROM motores WHERE marca_id = ${marcaId}
  `;
  return Number((rows[0] as { total: string }).total);
}

// — Modelos —

export async function getModelos(): Promise<ModeloRow[]> {
  const rows = await sql`SELECT id, nombre, marca_id FROM modelos ORDER BY nombre`;
  return rows as ModeloRow[];
}

export async function getModelosByMarca(marcaId: string): Promise<ModeloRow[]> {
  const rows = await sql`
    SELECT id, nombre, marca_id FROM modelos WHERE marca_id = ${marcaId} ORDER BY nombre
  `;
  return rows as ModeloRow[];
}

export async function createModelo(nombre: string, marcaId: string): Promise<ModeloRow> {
  const rows = await sql`
    INSERT INTO modelos (nombre, marca_id) VALUES (${nombre}, ${marcaId}) RETURNING *
  `;
  return rows[0] as ModeloRow;
}

export async function updateModelo(id: string, nombre: string): Promise<ModeloRow | null> {
  const rows = await sql`
    UPDATE modelos SET nombre = ${nombre} WHERE id = ${id} RETURNING *
  `;
  return (rows[0] as ModeloRow) ?? null;
}

export async function deleteModelo(id: string): Promise<void> {
  await sql`DELETE FROM modelos WHERE id = ${id}`;
}

export async function countCulatasPorModelo(modeloId: string): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) AS total FROM motores WHERE modelo_id = ${modeloId}
  `;
  return Number((rows[0] as { total: string }).total);
}

import { sql } from "./client";
import type {
  MotorConRelaciones,
  MotorRow,
  CreateMotorInput,
  UpdateMotorInput,
} from "./types";

export async function getMotores(): Promise<MotorConRelaciones[]> {
  const rows = await sql`
    SELECT
      m.id,
      m.numero_serie,
      m.tipo_combustible,
      m.anio,
      m.estado,
      m.ubicacion,
      m.costo_compra,
      m.precio_venta,
      m.observaciones,
      m.numero_cilindros,
      m.numero_valvulas,
      m.rectificada,
      m.marca_id,
      m.modelo_id,
      ma.nombre  AS marca,
      mo.nombre  AS modelo,
      COALESCE(
        json_agg(mf.storage_path ORDER BY mf.id)
        FILTER (WHERE mf.storage_path IS NOT NULL),
        '[]'
      ) AS fotos
    FROM motores m
    LEFT JOIN marcas      ma ON ma.id = m.marca_id
    LEFT JOIN modelos     mo ON mo.id = m.modelo_id
    LEFT JOIN motor_fotos mf ON mf.motor_id = m.id
    GROUP BY m.id, ma.nombre, mo.nombre
    ORDER BY m.anio DESC
  `;
  return rows as MotorConRelaciones[];
}

export async function getMotorById(id: string): Promise<MotorConRelaciones | null> {
  const rows = await sql`
    SELECT
      m.id,
      m.numero_serie,
      m.tipo_combustible,
      m.anio,
      m.estado,
      m.ubicacion,
      m.costo_compra,
      m.precio_venta,
      m.observaciones,
      m.numero_cilindros,
      m.numero_valvulas,
      m.rectificada,
      m.marca_id,
      m.modelo_id,
      ma.nombre  AS marca,
      mo.nombre  AS modelo,
      COALESCE(
        json_agg(mf.storage_path ORDER BY mf.id)
        FILTER (WHERE mf.storage_path IS NOT NULL),
        '[]'
      ) AS fotos
    FROM motores m
    LEFT JOIN marcas      ma ON ma.id = m.marca_id
    LEFT JOIN modelos     mo ON mo.id = m.modelo_id
    LEFT JOIN motor_fotos mf ON mf.motor_id = m.id
    WHERE m.id = ${id}
    GROUP BY m.id, ma.nombre, mo.nombre
  `;
  return (rows[0] as MotorConRelaciones) ?? null;
}

export async function createMotor(data: CreateMotorInput): Promise<MotorRow> {
  const rows = await sql`
    INSERT INTO motores (
      numero_serie, tipo_combustible, anio, estado, ubicacion,
      costo_compra, precio_venta, observaciones,
      numero_cilindros, numero_valvulas, rectificada,
      marca_id, modelo_id
    ) VALUES (
      ${data.numero_serie}, ${data.tipo_combustible}, ${data.anio},
      ${data.estado}, ${data.ubicacion}, ${data.costo_compra},
      ${data.precio_venta}, ${data.observaciones},
      ${data.numero_cilindros}, ${data.numero_valvulas}, ${data.rectificada},
      ${data.marca_id}, ${data.modelo_id}
    )
    RETURNING *
  `;
  return rows[0] as MotorRow;
}

export async function updateMotor(id: string, data: UpdateMotorInput): Promise<MotorRow | null> {
  const rows = await sql`
    UPDATE motores SET
      numero_serie      = COALESCE(${data.numero_serie ?? null},      numero_serie),
      tipo_combustible  = COALESCE(${data.tipo_combustible ?? null},   tipo_combustible),
      anio              = COALESCE(${data.anio ?? null},               anio),
      estado            = COALESCE(${data.estado ?? null},             estado),
      ubicacion         = COALESCE(${data.ubicacion ?? null},          ubicacion),
      costo_compra      = COALESCE(${data.costo_compra ?? null},       costo_compra),
      precio_venta      = COALESCE(${data.precio_venta ?? null},       precio_venta),
      observaciones     = COALESCE(${data.observaciones ?? null},      observaciones),
      numero_cilindros  = COALESCE(${data.numero_cilindros ?? null},   numero_cilindros),
      numero_valvulas   = COALESCE(${data.numero_valvulas ?? null},    numero_valvulas),
      rectificada       = COALESCE(${data.rectificada ?? null},        rectificada),
      marca_id          = COALESCE(${data.marca_id ?? null},           marca_id),
      modelo_id         = COALESCE(${data.modelo_id ?? null},          modelo_id)
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as MotorRow) ?? null;
}

export async function deleteMotor(id: string): Promise<void> {
  await sql`DELETE FROM motor_fotos WHERE motor_id = ${id}`;
  await sql`DELETE FROM motores WHERE id = ${id}`;
}

// — Fotos —

export async function addFoto(motorId: string, storagePath: string): Promise<void> {
  await sql`
    INSERT INTO motor_fotos (motor_id, storage_path)
    VALUES (${motorId}, ${storagePath})
  `;
}

export async function deleteFoto(fotoId: string): Promise<string | null> {
  const rows = await sql`
    DELETE FROM motor_fotos
    WHERE id = ${fotoId}
    RETURNING storage_path
  `;
  return (rows[0] as { storage_path: string } | undefined)?.storage_path ?? null;
}

export async function getFotosByMotor(motorId: string) {
  return sql`
    SELECT id, storage_path
    FROM motor_fotos
    WHERE motor_id = ${motorId}
    ORDER BY id
  `;
}

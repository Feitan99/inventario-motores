import { sql } from "./client";
import bcrypt from "bcryptjs";
import type { UsuarioRow } from "./types";

export async function getUserByEmail(email: string): Promise<UsuarioRow | null> {
  const rows = await sql`
    SELECT id, email, password_hash FROM usuarios WHERE email = ${email}
  `;
  return (rows[0] as UsuarioRow) ?? null;
}

export async function verifyPassword(email: string, password: string): Promise<UsuarioRow | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password_hash);
  return valid ? user : null;
}

// Útil para crear el primer usuario admin desde un script
export async function createUsuario(email: string, password: string): Promise<UsuarioRow> {
  const password_hash = await bcrypt.hash(password, 12);
  const rows = await sql`
    INSERT INTO usuarios (email, password_hash)
    VALUES (${email}, ${password_hash})
    RETURNING id, email, password_hash
  `;
  return rows[0] as UsuarioRow;
}

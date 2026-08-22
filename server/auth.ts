import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const TOKEN_TTL = "7d";

export interface AdminRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export function hasAdmin(): boolean {
  const row = db.prepare("SELECT COUNT(*) as c FROM admins").get() as { c: number };
  return row.c > 0;
}

export function createAdmin(username: string, password: string): void {
  const hash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run(username, hash);
}

export function verifyAdmin(username: string, password: string): AdminRow | null {
  const row = db.prepare("SELECT * FROM admins WHERE username = ?").get(username) as AdminRow | undefined;
  if (!row) return null;
  if (!bcrypt.compareSync(password, row.password_hash)) return null;
  return row;
}

export function signToken(admin: AdminRow): string {
  return jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): { id: number; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string };
  } catch {
    return null;
  }
}

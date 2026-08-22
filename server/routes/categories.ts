import { Router, Request, Response } from "express";
import db from "../db.js";
import { requireAuth, AuthedRequest } from "../middleware.js";

const router = Router();

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

/** GET /api/categories — публичный список */
router.get("/", (_req: Request, res: Response) => {
  const rows = db.prepare("SELECT * FROM categories ORDER BY sort_order, name").all() as CategoryRow[];
  res.json(rows);
});

/** POST /api/categories — добавить (админ) */
router.post("/", requireAuth, (req: AuthedRequest, res: Response) => {
  const { name } = req.body as { name?: string };
  if (!name || !name.trim()) {
    res.status(400).json({ error: "Название категории обязательно" });
    return;
  }
  const slug = slugify(name);
  try {
    const maxOrder = db.prepare("SELECT MAX(sort_order) as m FROM categories").get() as { m: number | null };
    const info = db
      .prepare("INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)")
      .run(name.trim(), slug, (maxOrder.m ?? 0) + 1);
    const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(info.lastInsertRowid) as CategoryRow;
    res.json(row);
  } catch {
    res.status(409).json({ error: "Категория с таким названием уже существует" });
  }
});

/** DELETE /api/categories/:id — удалить (админ) */
router.delete("/:id", requireAuth, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  res.json({ ok: true });
});

/** PATCH /api/categories/:id — переименовать (админ) */
router.patch("/:id", requireAuth, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name } = req.body as { name?: string };
  if (!name || !name.trim()) {
    res.status(400).json({ error: "Название обязательно" });
    return;
  }
  const slug = slugify(name);
  try {
    db.prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?").run(name.trim(), slug, id);
    const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as CategoryRow;
    res.json(row);
  } catch {
    res.status(409).json({ error: "Категория с таким названием уже существует" });
  }
});

export default router;

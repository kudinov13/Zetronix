import { Router, Request, Response } from "express";
import db from "../db.js";
import { requireAuth, AuthedRequest } from "../middleware.js";

const router = Router();

interface LeadRow {
  id: number;
  name: string;
  contact: string;
  template_slug: string | null;
  comment: string;
  status: string;
  created_at: string;
}

function mapRow(r: LeadRow) {
  return {
    id: r.id,
    name: r.name,
    contact: r.contact,
    templateSlug: r.template_slug,
    comment: r.comment,
    status: r.status,
    createdAt: r.created_at,
  };
}

/** GET /api/leads — список заявок (админ) */
router.get("/", requireAuth, (_req: Request, res: Response) => {
  const rows = db
    .prepare("SELECT * FROM leads ORDER BY created_at DESC")
    .all() as LeadRow[];
  res.json(rows.map(mapRow));
});

/** POST /api/leads — создать заявку (публичный) */
router.post("/", (req: Request, res: Response) => {
  const { name, contact, templateSlug, comment } = req.body as {
    name?: string;
    contact?: string;
    templateSlug?: string;
    comment?: string;
  };

  if (!name || !contact) {
    res.status(400).json({ error: "Имя и контакт обязательны" });
    return;
  }

  const info = db
    .prepare(
      "INSERT INTO leads (name, contact, template_slug, comment) VALUES (?, ?, ?, ?)",
    )
    .run(name, contact, templateSlug ?? null, comment ?? "");

  res.json({ id: info.lastInsertRowid, ok: true });
});

/** PUT /api/leads/:id — обновить статус (админ) */
router.put("/:id", requireAuth, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status?: string };

  const existing = db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as LeadRow | undefined;
  if (!existing) {
    res.status(404).json({ error: "Заявка не найдена" });
    return;
  }

  db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status ?? existing.status, id);
  res.json({ ok: true });
});

/** DELETE /api/leads/:id — удалить (админ) */
router.delete("/:id", requireAuth, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  db.prepare("DELETE FROM leads WHERE id = ?").run(id);
  res.json({ ok: true });
});

export default router;

import { Router, Request, Response } from "express";
import { HttpsProxyAgent } from "https-proxy-agent";
import db from "../db.js";
import { requireAuth, AuthedRequest } from "../middleware.js";

const router = Router();

const TG_BOT_TOKEN = "8687742873:AAGU97-qvPs4CWTEXcBhL5nGFTHJXEYjfT8";
const TG_CHAT_ID = "5486997702";
const TG_PROXY = "http://user425172:apocw5@93.127.155.28:7165";
const tgAgent = new HttpsProxyAgent(TG_PROXY);

async function sendTelegramNotification(lead: {
  id: number;
  name: string;
  contact: string;
  templateSlug: string | null;
  comment: string;
}) {
  const templateLine = lead.templateSlug
    ? `\n📦 Шаблон: ${lead.templateSlug}`
    : "";
  const commentLine = lead.comment ? `\n💬 ${lead.comment}` : "";

  const text =
    `🆕 Новая заявка #${lead.id}\n` +
    `👤 Имя: ${lead.name}\n` +
    `📞 Контакт: ${lead.contact}` +
    templateLine +
    commentLine;

  try {
    await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
      // @ts-expect-error -- Node 18+ supports agent via dispatcher
      agent: tgAgent,
    });
  } catch (err) {
    console.error("[leads] Telegram notification failed:", err);
  }
}

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

  const leadId = info.lastInsertRowid as number;

  sendTelegramNotification({
    id: leadId,
    name,
    contact,
    templateSlug: templateSlug ?? null,
    comment: comment ?? "",
  });

  res.json({ id: leadId, ok: true });
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

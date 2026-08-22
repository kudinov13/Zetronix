import { Router, Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import db from "../db.js";
import { requireAuth, AuthedRequest } from "../middleware.js";

const router = Router();

const CERTS_DIR = path.resolve(process.cwd(), "public", "media", "certificates");
if (!fs.existsSync(CERTS_DIR)) fs.mkdirSync(CERTS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, CERTS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webp";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

interface CertRow {
  id: number;
  title: string;
  description: string;
  image: string;
  sort_order: number;
  created_at: string;
}

function mapRow(r: CertRow) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    image: r.image,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  };
}

/** GET /api/certificates — публичный список */
router.get("/", (_req: Request, res: Response) => {
  const rows = db
    .prepare("SELECT * FROM certificates ORDER BY sort_order ASC, created_at DESC")
    .all() as CertRow[];
  res.json(rows.map(mapRow));
});

/** POST /api/certificates — создать (админ) */
router.post("/", requireAuth, (req: AuthedRequest, res: Response) => {
  const { title, description, image, sortOrder } = req.body as {
    title?: string;
    description?: string;
    image?: string;
    sortOrder?: number;
  };

  if (!title || !image) {
    res.status(400).json({ error: "Название и изображение обязательны" });
    return;
  }

  const info = db
    .prepare(
      "INSERT INTO certificates (title, description, image, sort_order) VALUES (?, ?, ?, ?)",
    )
    .run(title, description ?? "", image, sortOrder ?? 0);
  res.json({ id: info.lastInsertRowid, ok: true });
});

/** PUT /api/certificates/:id — обновить (админ) */
router.put("/:id", requireAuth, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const { title, description, image, sortOrder } = req.body as {
    title?: string;
    description?: string;
    image?: string;
    sortOrder?: number;
  };

  const existing = db.prepare("SELECT * FROM certificates WHERE id = ?").get(id) as CertRow | undefined;
  if (!existing) {
    res.status(404).json({ error: "Сертификат не найден" });
    return;
  }

  db.prepare(
    "UPDATE certificates SET title = ?, description = ?, image = ?, sort_order = ? WHERE id = ?",
  ).run(
    title ?? existing.title,
    description ?? existing.description,
    image ?? existing.image,
    sortOrder ?? existing.sort_order,
    id,
  );
  res.json({ ok: true });
});

/** DELETE /api/certificates/:id — удалить (админ) */
router.delete("/:id", requireAuth, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT * FROM certificates WHERE id = ?").get(id) as CertRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Сертификат не найден" });
    return;
  }

  const imgPath = path.join(process.cwd(), "public", row.image);
  if (fs.existsSync(imgPath)) {
    try { fs.unlinkSync(imgPath); } catch { /* ignore */ }
  }

  db.prepare("DELETE FROM certificates WHERE id = ?").run(id);
  res.json({ ok: true });
});

/** POST /api/certificates/upload — загрузка изображения (админ) */
router.post("/upload", requireAuth, upload.single("image"), (req: AuthedRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "Файл не загружен" });
    return;
  }
  res.json({ path: `/media/certificates/${req.file.filename}` });
});

export default router;

import { Router, Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import db from "../db.js";
import { requireAuth, AuthedRequest } from "../middleware.js";

const router = Router();

const PREVIEWS_DIR = path.resolve(process.cwd(), "public", "media", "cases");
const VIDEOS_DIR = path.resolve(process.cwd(), "public", "media", "cases", "videos");

for (const dir of [PREVIEWS_DIR, VIDEOS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const previewStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PREVIEWS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webp";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEOS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const uploadPreview = multer({ storage: previewStorage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadVideo = multer({ storage: videoStorage, limits: { fileSize: 500 * 1024 * 1024 } });

interface CaseRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  problem: string;
  solution: string;
  savings: string;
  price: string;
  preview_image: string;
  video_url: string | null;
  tags: string;
  sort_order: number;
  created_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function mapRow(r: CaseRow) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    description: r.description,
    problem: r.problem,
    solution: r.solution,
    savings: r.savings,
    price: r.price,
    previewImage: r.preview_image,
    videoUrl: r.video_url,
    tags: JSON.parse(r.tags) as string[],
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  };
}

/** GET /api/cases — публичный список */
router.get("/", (_req: Request, res: Response) => {
  const rows = db
    .prepare("SELECT * FROM cases ORDER BY sort_order ASC, created_at DESC")
    .all() as CaseRow[];
  res.json(rows.map(mapRow));
});

/** GET /api/cases/:slug — публичный один кейс */
router.get("/:slug", (req: Request, res: Response) => {
  const row = db.prepare("SELECT * FROM cases WHERE slug = ?").get(req.params.slug) as CaseRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Кейс не найден" });
    return;
  }
  res.json(mapRow(row));
});

/** POST /api/cases — создать (админ) */
router.post("/", requireAuth, (req: AuthedRequest, res: Response) => {
  const { slug, title, excerpt, description, problem, solution, savings, price, previewImage, videoUrl, tags, sortOrder } = req.body as {
    slug?: string;
    title?: string;
    excerpt?: string;
    description?: string;
    problem?: string;
    solution?: string;
    savings?: string;
    price?: string;
    previewImage?: string;
    videoUrl?: string;
    tags?: string[];
    sortOrder?: number;
  };

  if (!slug || !title || !previewImage) {
    res.status(400).json({ error: "Slug, название и превью обязательны" });
    return;
  }

  try {
    const info = db
      .prepare(
        "INSERT INTO cases (slug, title, excerpt, description, problem, solution, savings, price, preview_image, video_url, tags, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        slug,
        title,
        excerpt ?? "",
        description ?? "",
        problem ?? "",
        solution ?? "",
        savings ?? "",
        price ?? "",
        previewImage,
        videoUrl ?? null,
        JSON.stringify(tags ?? []),
        sortOrder ?? 0,
      );
    res.json({ id: info.lastInsertRowid, ok: true });
  } catch {
    res.status(409).json({ error: "Кейс с таким slug уже существует" });
  }
});

/** PUT /api/cases/:id — обновить (админ) */
router.put("/:id", requireAuth, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const { title, excerpt, description, problem, solution, savings, price, previewImage, videoUrl, tags, sortOrder, slug } = req.body as {
    title?: string;
    excerpt?: string;
    description?: string;
    problem?: string;
    solution?: string;
    savings?: string;
    price?: string;
    previewImage?: string;
    videoUrl?: string;
    tags?: string[];
    sortOrder?: number;
    slug?: string;
  };

  const existing = db.prepare("SELECT * FROM cases WHERE id = ?").get(id) as CaseRow | undefined;
  if (!existing) {
    res.status(404).json({ error: "Кейс не найден" });
    return;
  }

  try {
    db.prepare(
      "UPDATE cases SET slug = ?, title = ?, excerpt = ?, description = ?, problem = ?, solution = ?, savings = ?, price = ?, preview_image = ?, video_url = ?, tags = ?, sort_order = ? WHERE id = ?",
    ).run(
      slug ?? existing.slug,
      title ?? existing.title,
      excerpt ?? existing.excerpt,
      description ?? existing.description,
      problem ?? existing.problem,
      solution ?? existing.solution,
      savings ?? existing.savings,
      price ?? existing.price,
      previewImage ?? existing.preview_image,
      videoUrl !== undefined ? videoUrl : existing.video_url,
      JSON.stringify(tags ?? JSON.parse(existing.tags)),
      sortOrder ?? existing.sort_order,
      id,
    );
    res.json({ ok: true });
  } catch {
    res.status(409).json({ error: "Кейс с таким slug уже существует" });
  }
});

/** DELETE /api/cases/:id — удалить (админ) */
router.delete("/:id", requireAuth, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT * FROM cases WHERE id = ?").get(id) as CaseRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Кейс не найден" });
    return;
  }

  // Remove preview image
  const previewPath = path.join(process.cwd(), "public", row.preview_image);
  if (fs.existsSync(previewPath)) {
    try { fs.unlinkSync(previewPath); } catch { /* ignore */ }
  }

  // Remove video file if it's a local upload
  if (row.video_url && row.video_url.startsWith("/media/cases/videos/")) {
    const videoPath = path.join(process.cwd(), "public", row.video_url);
    if (fs.existsSync(videoPath)) {
      try { fs.unlinkSync(videoPath); } catch { /* ignore */ }
    }
  }

  db.prepare("DELETE FROM cases WHERE id = ?").run(id);
  res.json({ ok: true });
});

/** POST /api/cases/upload-preview — загрузка превью (админ) */
router.post("/upload-preview", requireAuth, uploadPreview.single("preview"), (req: AuthedRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "Файл не загружен" });
    return;
  }
  res.json({ path: `/media/cases/${req.file.filename}` });
});

/** POST /api/cases/upload-video — загрузка видео (админ) */
router.post("/upload-video", requireAuth, uploadVideo.single("video"), (req: AuthedRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "Видео не загружено" });
    return;
  }
  res.json({ path: `/media/cases/videos/${req.file.filename}` });
});

export default router;

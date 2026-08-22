import { Router, Request, Response } from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import path from "node:path";
import fs from "node:fs";
import db from "../db.js";
import { requireAuth, AuthedRequest } from "../middleware.js";

const router = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const TEMPLATES_DIR = path.resolve(process.cwd(), "public", "templates");
const PREVIEWS_DIR = path.resolve(process.cwd(), "public", "media", "templates");

for (const dir of [UPLOADS_DIR, TEMPLATES_DIR, PREVIEWS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const previewStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PREVIEWS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webp";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const archiveStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}-${file.originalname}`);
  },
});

const uploadPreview = multer({ storage: previewStorage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadArchive = multer({ storage: archiveStorage, limits: { fileSize: 200 * 1024 * 1024 } });

interface TemplateRow {
  id: number;
  slug: string;
  title: string;
  category_id: number | null;
  tags: string;
  preview_image: string;
  archive_name: string | null;
  extracted_path: string | null;
  created_at: string;
}

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function findEntryFile(dir: string): string | null {
  const candidates = ["index.html", "index.htm"];
  for (const c of candidates) {
    const p = path.join(dir, c);
    if (fs.existsSync(p)) return p;
  }
  // Search one level deep
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        for (const c of candidates) {
          const p = path.join(dir, entry.name, c);
          if (fs.existsSync(p)) return p;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/** GET /api/templates — публичный список (с категорией) */
router.get("/", (_req: Request, res: Response) => {
  const rows = db
    .prepare(`
      SELECT t.*, c.name as category_name, c.slug as category_slug
      FROM templates t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.created_at DESC
    `)
    .all() as (TemplateRow & { category_name: string | null; category_slug: string | null })[];

  res.json(
    rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category_name,
      categoryId: r.category_id,
      tags: JSON.parse(r.tags) as string[],
      previewImage: r.preview_image,
      demoUrl: r.extracted_path ? `/templates/${r.extracted_path}` : null,
    })),
  );
});

/** GET /api/templates/:slug — публичный один шаблон */
router.get("/:slug", (req: Request, res: Response) => {
  const row = db.prepare("SELECT * FROM templates WHERE slug = ?").get(req.params.slug) as TemplateRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Шаблон не найден" });
    return;
  }
  const cat = row.category_id
    ? (db.prepare("SELECT * FROM categories WHERE id = ?").get(row.category_id) as CategoryRow | undefined)
    : undefined;
  res.json({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: cat?.name ?? null,
    categoryId: row.category_id,
    tags: JSON.parse(row.tags) as string[],
    previewImage: row.preview_image,
    demoUrl: row.extracted_path ? `/templates/${row.extracted_path}` : null,
  });
});

/** POST /api/templates — создать (админ): JSON-метаданные */
router.post("/", requireAuth, (req: AuthedRequest, res: Response) => {
  const { slug, title, categoryId, tags, previewImage, archiveName, extractedPath } = req.body as {
    slug?: string;
    title?: string;
    categoryId?: number;
    tags?: string[];
    previewImage?: string;
    archiveName?: string;
    extractedPath?: string;
  };

  if (!slug || !title || !previewImage) {
    res.status(400).json({ error: "Slug, название и превью обязательны" });
    return;
  }

  try {
    console.log("[templates] Creating template:", { slug, title, categoryId, previewImage, archiveName, extractedPath });
    const info = db
      .prepare(
        "INSERT INTO templates (slug, title, category_id, tags, preview_image, archive_name, extracted_path) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        slug,
        title,
        categoryId ?? null,
        JSON.stringify(tags ?? []),
        previewImage,
        archiveName ?? null,
        extractedPath ?? null,
      );
    console.log("[templates] Created with id:", info.lastInsertRowid);
    res.json({ id: info.lastInsertRowid, ok: true });
  } catch (err) {
    console.error("[templates] Create error:", err);
    res.status(409).json({ error: "Шаблон с таким slug уже существует" });
  }
});

/** POST /api/templates/upload-preview — загрузка превью (админ) */
router.post("/upload-preview", requireAuth, uploadPreview.single("preview"), (req: AuthedRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "Файл не загружен" });
    return;
  }
  res.json({ path: `/media/templates/${req.file.filename}` });
});

/** POST /api/templates/upload-archive — загрузка zip и распаковка (админ) */
router.post("/upload-archive", requireAuth, uploadArchive.single("archive"), (req: AuthedRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "Архив не загружен" });
    return;
  }

  const slug = req.body.slug as string | undefined;
  if (!slug) {
    fs.unlinkSync(req.file.path);
    res.status(400).json({ error: "Slug шаблона обязателен" });
    return;
  }

  const destDir = path.join(TEMPLATES_DIR, slug);
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  try {
    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(destDir, true);

    // Find entry file
    const entry = findEntryFile(destDir);
    if (!entry) {
      fs.rmSync(destDir, { recursive: true, force: true });
      res.status(400).json({ error: "В архиве нет index.html" });
      return;
    }

    // If entry is nested, the extracted_path includes the subfolder
    const relPath = path.relative(TEMPLATES_DIR, path.dirname(entry));
    const archiveName = path.basename(req.file.filename);

    console.log("[templates] Archive extracted:", { slug, archiveName, extractedPath: relPath.replace(/\\/g, "/"), entryFile: path.basename(entry) });

    res.json({
      archiveName,
      extractedPath: relPath.replace(/\\/g, "/"),
    });
  } catch (err) {
    console.error("[templates] Archive extraction error:", err);
    fs.rmSync(destDir, { recursive: true, force: true });
    res.status(500).json({ error: "Ошибка распаковки архива" });
  } finally {
    // Clean up the uploaded zip
    try {
      fs.unlinkSync(req.file.path);
    } catch {
      // ignore
    }
  }
});

/** PUT /api/templates/:id — обновить метаданные (админ) */
router.put("/:id", requireAuth, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const { title, categoryId, tags, previewImage } = req.body as {
    title?: string;
    categoryId?: number;
    tags?: string[];
    previewImage?: string;
  };

  const existing = db.prepare("SELECT * FROM templates WHERE id = ?").get(id) as TemplateRow | undefined;
  if (!existing) {
    res.status(404).json({ error: "Шаблон не найден" });
    return;
  }

  // Delete old preview if previewImage changed
  if (previewImage && previewImage !== existing.preview_image) {
    const oldPreviewPath = path.join(process.cwd(), "public", existing.preview_image);
    if (fs.existsSync(oldPreviewPath)) {
      try { fs.unlinkSync(oldPreviewPath); } catch { /* ignore */ }
    }
  }

  db.prepare(
    "UPDATE templates SET title = ?, category_id = ?, tags = ?, preview_image = ? WHERE id = ?",
  ).run(
    title ?? existing.title,
    categoryId !== undefined ? categoryId : existing.category_id,
    JSON.stringify(tags ?? JSON.parse(existing.tags)),
    previewImage ?? existing.preview_image,
    id,
  );
  res.json({ ok: true });
});

/** DELETE /api/templates/:id — удалить (админ) */
router.delete("/:id", requireAuth, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT * FROM templates WHERE id = ?").get(id) as TemplateRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Шаблон не найден" });
    return;
  }

  // Remove extracted files
  if (row.extracted_path) {
    const dir = path.join(TEMPLATES_DIR, row.slug);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }
  // Remove preview
  const previewPath = path.join(process.cwd(), "public", row.preview_image);
  if (fs.existsSync(previewPath)) {
    try {
      fs.unlinkSync(previewPath);
    } catch {
      // ignore
    }
  }

  db.prepare("DELETE FROM templates WHERE id = ?").run(id);
  res.json({ ok: true });
});

export default router;

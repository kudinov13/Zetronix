import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";
import type { TemplateDTO, Category } from "@/lib/types";
import { cn } from "@/lib/utils";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminTemplates() {
  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(async () => {
    const [t, c] = await Promise.all([api.listTemplates(), api.listCategories()]);
    setTemplates(t);
    setCategories(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Удалить шаблон «${title}»? Файлы будут удалены.`)) return;
    await api.deleteTemplate(id);
    refresh();
  };

  if (loading) return <p className="text-muted">Загрузка…</p>;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="h-section">Шаблоны</h1>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-[filter] duration-200 hover:brightness-110"
        >
          <Plus aria-hidden className="size-4" />
          Добавить
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-12 text-center">
          <p className="text-muted">Пока нет шаблонов. Добавьте первый.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                <img
                  src={t.previewImage}
                  alt={t.title}
                  className="size-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{t.title}</h3>
                  <span className="text-xs text-muted">{t.category ?? "—"}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    to={`/templates/${t.slug}`}
                    target="_blank"
                    className="flex-1 rounded-full border border-border px-4 py-2 text-center text-xs text-foreground transition-colors duration-200 hover:bg-surface-2"
                  >
                    Открыть
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id, t.title)}
                    aria-label={`Удалить ${t.title}`}
                    className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border text-muted transition-colors duration-200 hover:border-red-500/50 hover:text-red-500"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TemplateForm
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

/* ── Template creation form ── */

interface TemplateFormProps {
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

function TemplateForm({ categories, onClose, onSaved }: TemplateFormProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tagsInput, setTagsInput] = useState("");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [archiveFile, setArchiveFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value));
    }
  };

  const handlePreviewChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPreviewFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleArchiveChange = (e: ChangeEvent<HTMLInputElement>) => {
    setArchiveFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !slug || !previewFile || !archiveFile) {
      setError("Заполните все поля и выберите файлы");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload preview
      const previewRes = await api.uploadPreview(previewFile);

      // 2. Upload & extract archive
      const archiveRes = await api.uploadArchive(archiveFile, slug);

      // 3. Create template record
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await api.createTemplate({
        slug,
        title,
        categoryId: categoryId ? Number(categoryId) : null,
        tags,
        previewImage: previewRes.path,
        archiveName: archiveRes.archiveName,
        extractedPath: archiveRes.extractedPath,
      });

      onSaved();
    } catch (err) {
      console.error("Template creation error:", err);
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Новый шаблон</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="tf-title" className="text-sm font-medium">Название</label>
            <input
              id="tf-title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Например: Кофейня «Утро»"
              required
              className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tf-slug" className="text-sm font-medium">Slug (URL)</label>
            <input
              id="tf-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="kofeinya"
              required
              className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tf-cat" className="text-sm font-medium">Категория</label>
            <select
              id="tf-cat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
            >
              <option value="">Без категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tf-tags" className="text-sm font-medium">Теги (через запятую)</label>
            <input
              id="tf-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Меню, Онлайн-заказ, Карта"
              className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tf-preview" className="text-sm font-medium">Превью (скриншот)</label>
            <input
              id="tf-preview"
              type="file"
              accept="image/*"
              onChange={handlePreviewChange}
              required
              className="cursor-pointer text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-foreground"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Превью превью"
                className="mt-2 aspect-[4/3] w-full rounded-xl border border-border object-cover"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tf-archive" className="text-sm font-medium">Архив шаблона (.zip)</label>
            <input
              id="tf-archive"
              type="file"
              accept=".zip"
              onChange={handleArchiveChange}
              required
              className="cursor-pointer text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-foreground"
            />
            {archiveFile && (
              <p className="text-xs text-muted">
                Выбран: {archiveFile.name} ({(archiveFile.size / 1024 / 1024).toFixed(1)} МБ)
              </p>
            )}
            <p className="text-xs text-muted">
              В корне архива (или в подпапке) должен быть index.html
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-accent">{error}</p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className={cn(
              "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-[filter] duration-200 hover:brightness-110",
              uploading && "cursor-not-allowed opacity-60",
            )}
          >
            {uploading ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                Загрузка…
              </>
            ) : (
              <>
                <Upload aria-hidden className="size-4" />
                Загрузить шаблон
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

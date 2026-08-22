import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Upload, Loader2, X, Pencil, Video } from "lucide-react";
import { api } from "@/lib/api";
import type { CaseDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminCases() {
  const [cases, setCases] = useState<CaseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseDTO | null>(null);

  const refresh = useCallback(async () => {
    const c = await api.listCases();
    setCases(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Удалить кейс «${title}»? Файлы будут удалены.`)) return;
    await api.deleteCase(id);
    refresh();
  };

  if (loading) return <p className="text-muted">Загрузка…</p>;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="h-section">Кейсы</h1>
        <button
          type="button"
          onClick={() => { setEditingCase(null); setShowForm(true); }}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-[filter] duration-200 hover:brightness-110"
        >
          <Plus aria-hidden className="size-4" />
          Добавить
        </button>
      </div>

      {cases.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-12 text-center">
          <p className="text-muted">Пока нет кейсов. Добавьте первый.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                <img
                  src={c.previewImage}
                  alt={c.title}
                  className="size-full object-cover"
                />
                {c.videoUrl && (
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                    <Video aria-hidden className="size-3.5" />
                    Видео
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{c.title}</h3>
                  <span className="text-xs text-muted">#{c.sortOrder}</span>
                </div>
                {c.excerpt && (
                  <p className="mt-1 text-xs text-muted line-clamp-2">{c.excerpt}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    to={`/cases/${c.slug}`}
                    target="_blank"
                    className="flex-1 rounded-full border border-border px-4 py-2 text-center text-xs text-foreground transition-colors duration-200 hover:bg-surface-2"
                  >
                    Открыть
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setEditingCase(c); setShowForm(true); }}
                    aria-label={`Редактировать ${c.title}`}
                    className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border text-muted transition-colors duration-200 hover:text-foreground"
                  >
                    <Pencil aria-hidden className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.title)}
                    aria-label={`Удалить ${c.title}`}
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
        <CaseForm
          existing={editingCase}
          onClose={() => { setShowForm(false); setEditingCase(null); }}
          onSaved={() => {
            setShowForm(false);
            setEditingCase(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

interface CaseFormProps {
  existing: CaseDTO | null;
  onClose: () => void;
  onSaved: () => void;
}

function CaseForm({ existing, onClose, onSaved }: CaseFormProps) {
  const isEdit = !!existing;
  const [title, setTitle] = useState(existing?.title ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [excerpt, setExcerpt] = useState(existing?.excerpt ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [problem, setProblem] = useState(existing?.problem ?? "");
  const [solution, setSolution] = useState(existing?.solution ?? "");
  const [savings, setSavings] = useState(existing?.savings ?? "");
  const [price, setPrice] = useState(existing?.price ?? "");
  const [tags, setTags] = useState(existing?.tags.join(", ") ?? "");
  const [previewImage, setPreviewImage] = useState(existing?.previewImage ?? "");
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl ?? "");
  const [sortOrder, setSortOrder] = useState(existing?.sortOrder ?? 0);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!isEdit) setSlug(slugify(e.target.value));
  };

  const handlePreviewUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPreview(true);
    try {
      const res = await api.uploadCasePreview(file);
      setPreviewImage(res.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки превью");
    } finally {
      setUploadingPreview(false);
    }
  };

  const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const res = await api.uploadCaseVideo(file);
      setVideoUrl(res.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки видео");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !slug.trim() || !previewImage) {
      setError("Название, slug и превью обязательны");
      return;
    }

    const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

    setSaving(true);
    try {
      if (isEdit && existing) {
        await api.updateCase(existing.id, {
          slug: slug.trim(),
          title: title.trim(),
          excerpt: excerpt.trim(),
          description: description.trim(),
          problem: problem.trim(),
          solution: solution.trim(),
          savings: savings.trim(),
          price: price.trim(),
          previewImage,
          videoUrl: videoUrl || null,
          tags: tagsArray,
          sortOrder,
        });
      } else {
        await api.createCase({
          slug: slug.trim(),
          title: title.trim(),
          excerpt: excerpt.trim(),
          description: description.trim(),
          problem: problem.trim(),
          solution: solution.trim(),
          savings: savings.trim(),
          price: price.trim(),
          previewImage,
          videoUrl: videoUrl || null,
          tags: tagsArray,
          sortOrder,
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm md:p-8">
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Редактировать кейс" : "Новый кейс"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="case-title" className="text-sm font-medium">Название *</label>
            <input
              id="case-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              required
              className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="case-slug" className="text-sm font-medium">Slug (URL) *</label>
            <input
              id="case-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
              className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="case-excerpt" className="text-sm font-medium">Краткое описание</label>
            <textarea
              id="case-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="min-h-11 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              placeholder="Короткая аннотация для карточки"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="case-desc" className="text-sm font-medium">Краткое описание кейса</label>
            <textarea
              id="case-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              placeholder="Короткое описание для страницы кейса"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="case-problem" className="text-sm font-medium">Проблема</label>
            <textarea
              id="case-problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={6}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              placeholder="Какие проблемы были до внедрения решения..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="case-solution" className="text-sm font-medium">Решение</label>
            <textarea
              id="case-solution"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={6}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              placeholder="Как было решено проблему, что было внедрено..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="case-savings" className="text-sm font-medium">Экономия / Заработок</label>
            <textarea
              id="case-savings"
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
              rows={6}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              placeholder="Сколько времени или денег сэкономлено, какой результат..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="case-price" className="text-sm font-medium">Цена</label>
            <textarea
              id="case-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              rows={4}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              placeholder="Стоимость решения, варианты подписки..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="case-tags" className="text-sm font-medium">Теги (через запятую)</label>
            <input
              id="case-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
              placeholder="Автоматизация, Telegram-бот, CRM"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="case-order" className="text-sm font-medium">Порядок сортировки</label>
              <input
                id="case-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Превью изображение *</label>
            <div className="flex items-center gap-4">
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Превью"
                  width={80}
                  height={60}
                  className="size-20 rounded-lg border border-border object-cover"
                />
              )}
              <label
                htmlFor="case-preview"
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2",
                  uploadingPreview && "opacity-50",
                )}
              >
                {uploadingPreview ? (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                ) : (
                  <Upload aria-hidden className="size-4" />
                )}
                Загрузить превью
              </label>
              <input
                id="case-preview"
                type="file"
                accept="image/*"
                onChange={handlePreviewUpload}
                disabled={uploadingPreview}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Видео демонстрации</label>
            <div className="flex items-center gap-4">
              {videoUrl && (
                <span className="flex items-center gap-2 text-sm text-muted">
                  <Video aria-hidden className="size-4" />
                  Видео загружено
                </span>
              )}
              <label
                htmlFor="case-video"
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2",
                  uploadingVideo && "opacity-50",
                )}
              >
                {uploadingVideo ? (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                ) : (
                  <Video aria-hidden className="size-4" />
                )}
                Загрузить видео
              </label>
              <input
                id="case-video"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={uploadingVideo}
                className="hidden"
              />
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl("")}
                  className="text-xs text-muted underline hover:text-foreground"
                >
                  Убрать видео
                </button>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-accent">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving || uploadingPreview || uploadingVideo}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-[filter] duration-200 hover:brightness-110 disabled:opacity-50"
            >
              {saving && <Loader2 aria-hidden className="size-4 animate-spin" />}
              {isEdit ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

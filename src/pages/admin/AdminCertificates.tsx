import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Plus, Trash2, Upload, Loader2, X, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import type { CertificateDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AdminCertificates() {
  const [certs, setCerts] = useState<CertificateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificateDTO | null>(null);

  const refresh = useCallback(async () => {
    const c = await api.listCertificates();
    setCerts(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Удалить «${title}»?`)) return;
    await api.deleteCertificate(id);
    refresh();
  };

  if (loading) return <p className="text-muted">Загрузка…</p>;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="h-section">Дипломы и сертификаты</h1>
        <button
          type="button"
          onClick={() => { setEditingCert(null); setShowForm(true); }}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-[filter] duration-200 hover:brightness-110"
        >
          <Plus aria-hidden className="size-4" />
          Добавить
        </button>
      </div>

      {certs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-12 text-center">
          <p className="text-muted">Пока нет документов. Добавьте диплом или сертификат.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {certs.map((c) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-surface-2">
                <img
                  src={c.image}
                  alt={c.title}
                  className="size-full object-contain"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold">{c.title}</h3>
                {c.description && (
                  <p className="mt-1 text-xs text-muted line-clamp-2">{c.description}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setEditingCert(c); setShowForm(true); }}
                    aria-label={`Редактировать ${c.title}`}
                    className="flex-1 rounded-full border border-border px-4 py-2 text-center text-xs text-foreground transition-colors duration-200 hover:bg-surface-2"
                  >
                    <Pencil aria-hidden className="mr-1 inline size-3.5" />
                    Изменить
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
        <CertForm
          existing={editingCert}
          onClose={() => { setShowForm(false); setEditingCert(null); }}
          onSaved={() => {
            setShowForm(false);
            setEditingCert(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

interface CertFormProps {
  existing: CertificateDTO | null;
  onClose: () => void;
  onSaved: () => void;
}

function CertForm({ existing, onClose, onSaved }: CertFormProps) {
  const isEdit = !!existing;
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [image, setImage] = useState(existing?.image ?? "");
  const [sortOrder, setSortOrder] = useState(existing?.sortOrder ?? 0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadCertificateImage(file);
      setImage(res.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !image) {
      setError("Название и изображение обязательны");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && existing) {
        await api.updateCertificate(existing.id, {
          title: title.trim(),
          description: description.trim(),
          image,
          sortOrder,
        });
      } else {
        await api.createCertificate({
          title: title.trim(),
          description: description.trim(),
          image,
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
      <div className="my-8 w-full max-w-lg rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Редактировать" : "Новый документ"}
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
            <label htmlFor="cert-title" className="text-sm font-medium">Название *</label>
            <input
              id="cert-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Диплом, сертификат, удостоверение..."
              className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cert-desc" className="text-sm font-medium">Описание</label>
            <textarea
              id="cert-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Вуз, год, специальность..."
              className="min-h-11 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cert-order" className="text-sm font-medium">Порядок сортировки</label>
            <input
              id="cert-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Изображение документа *</label>
            <div className="flex items-center gap-4">
              {image && (
                <img
                  src={image}
                  alt="Превью документа"
                  width={60}
                  height={80}
                  className="h-24 rounded-lg border border-border object-contain"
                />
              )}
              <label
                htmlFor="cert-file"
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2",
                  uploading && "opacity-50",
                )}
              >
                {uploading ? (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                ) : (
                  <Upload aria-hidden className="size-4" />
                )}
                Загрузить
              </label>
              <input
                id="cert-file"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
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
              disabled={saving || uploading}
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

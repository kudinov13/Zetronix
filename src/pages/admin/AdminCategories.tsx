import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const refresh = useCallback(async () => {
    const c = await api.listCategories();
    setCategories(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.createCategory(newName.trim());
      setNewName("");
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Удалить категорию «${name}»? Шаблоны в ней останутся без категории.`)) return;
    await api.deleteCategory(id);
    refresh();
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      await api.updateCategory(id, editingName.trim());
      setEditingId(null);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  };

  if (loading) return <p className="text-muted">Загрузка…</p>;

  return (
    <div>
      <h1 className="h-section">Категории</h1>

      <form onSubmit={handleAdd} className="mt-8 flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Название категории"
          className="min-h-11 flex-1 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-[filter] duration-200 hover:brightness-110"
        >
          <Plus aria-hidden className="size-4" />
          Добавить
        </button>
      </form>

      <ul className="mt-6 flex flex-col gap-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
          >
            {editingId === cat.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                  className="min-h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(cat.id)}
                  aria-label="Сохранить"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full text-accent hover:bg-accent-soft"
                >
                  <Check aria-hidden className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  aria-label="Отмена"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-surface-2"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium">{cat.name}</span>
                <span className="text-xs text-muted">{cat.slug}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditingName(cat.name);
                  }}
                  aria-label={`Редактировать ${cat.name}`}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-foreground"
                >
                  <Pencil aria-hidden className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  aria-label={`Удалить ${cat.name}`}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors duration-200 hover:border-red-500/50 hover:text-red-500"
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

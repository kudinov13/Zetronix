import { useCallback, useEffect, useState } from "react";
import { Trash2, Inbox } from "lucide-react";
import { api } from "@/lib/api";
import type { LeadDTO } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  contacted: "Связались",
  done: "Готово",
  rejected: "Отклонено",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-accent/20 text-accent",
  contacted: "bg-blue-500/20 text-blue-400",
  done: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

export function AdminLeads() {
  const [leads, setLeads] = useState<LeadDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const l = await api.listLeads();
    setLeads(l);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleStatusChange = async (id: number, status: string) => {
    await api.updateLeadStatus(id, status);
    refresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить заявку?")) return;
    await api.deleteLead(id);
    refresh();
  };

  if (loading) return <p className="text-muted">Загрузка…</p>;

  const newCount = leads.filter((l) => l.status === "new").length;

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="h-section">Заявки</h1>
        {newCount > 0 && (
          <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent">
            {newCount} новых
          </span>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-12 text-center">
          <Inbox aria-hidden className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-muted">Пока нет заявок</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold">{lead.name}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status] ?? STATUS_COLORS.new}`}
                    >
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{lead.contact}</p>
                  {lead.templateSlug && (
                    <p className="mt-1 text-xs text-muted">
                      Шаблон: {lead.templateSlug}
                    </p>
                  )}
                  {lead.comment && (
                    <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                      {lead.comment}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted">
                    {lead.createdAt}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className="min-h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-accent"
                  >
                    <option value="new">Новая</option>
                    <option value="contacted">Связались</option>
                    <option value="done">Готово</option>
                    <option value="rejected">Отклонено</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(lead.id)}
                    aria-label="Удалить заявку"
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
    </div>
  );
}

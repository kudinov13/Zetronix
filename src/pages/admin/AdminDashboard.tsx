import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileStack, FolderTree, Plus, Briefcase, Award } from "lucide-react";
import { api } from "@/lib/api";
import type { TemplateDTO, Category, CaseDTO, CertificateDTO } from "@/lib/types";

export function AdminDashboard() {
  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cases, setCases] = useState<CaseDTO[]>([]);
  const [certificates, setCertificates] = useState<CertificateDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listTemplates(), api.listCategories(), api.listCases(), api.listCertificates()])
      .then(([t, c, cs, certs]) => {
        setTemplates(t);
        setCategories(c);
        setCases(cs);
        setCertificates(certs);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted">Загрузка…</p>;
  }

  const stats = [
    { label: "Шаблоны", value: templates.length, icon: FileStack, to: "/admin/templates" },
    { label: "Категории", value: categories.length, icon: FolderTree, to: "/admin/categories" },
    { label: "Кейсы", value: cases.length, icon: Briefcase, to: "/admin/cases" },
    { label: "Документы", value: certificates.length, icon: Award, to: "/admin/certificates" },
  ];

  return (
    <div>
      <h1 className="h-section">Обзор</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="group rounded-2xl border border-border bg-surface p-6 transition-colors duration-200 hover:border-foreground/20"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="font-display text-3xl font-semibold">{value}</span>
            </div>
            <p className="mt-4 text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">Быстрые действия</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/templates"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-[filter] duration-200 hover:brightness-110"
          >
            <Plus aria-hidden className="size-4" />
            Добавить шаблон
          </Link>
          <Link
            to="/admin/categories"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-2"
          >
            <Plus aria-hidden className="size-4" />
            Добавить категорию
          </Link>
          <Link
            to="/admin/cases"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-2"
          >
            <Plus aria-hidden className="size-4" />
            Добавить кейс
          </Link>
          <Link
            to="/admin/certificates"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-2"
          >
            <Plus aria-hidden className="size-4" />
            Добавить документ
          </Link>
        </div>
      </div>

      {templates.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Последние шаблоны</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {templates.slice(0, 5).map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={t.previewImage}
                    alt=""
                    width={48}
                    height={36}
                    className="size-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted">{t.category ?? "Без категории"}</p>
                  </div>
                </div>
                <Link
                  to={`/templates/${t.slug}`}
                  target="_blank"
                  className="text-sm text-accent hover:underline"
                >
                  Открыть
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

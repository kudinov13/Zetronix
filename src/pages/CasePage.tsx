import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import type { CaseDTO } from "@/lib/types";
import { useLeadForm } from "@/hooks/useLeadForm";
import { useSEO } from "@/hooks/useSEO";

export function CasePage() {
  const { slug } = useParams<{ slug: string }>();
  const { preselectTemplate } = useLeadForm();
  const [caseData, setCaseData] = useState<CaseDTO | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: caseData
      ? `${caseData.title} — кейс автоматизации, Zetronix`
      : "Кейс не найден — Zetronix",
    description: caseData?.excerpt || caseData?.description || "Кейс автоматизации бизнес-процессов от студии Zetronix.",
    canonical: slug ? `/cases/${slug}` : "/cases",
  });

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setNotFound(false);
    setCaseData(null);
    setLoading(true);
    api.getCase(slug).then(setCaseData).catch(() => setNotFound(true)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container-site flex min-h-[60dvh] items-center justify-center">
        <p className="text-muted">Загрузка…</p>
      </div>
    );
  }

  if (notFound || !caseData) {
    return (
      <div className="container-site flex min-h-[60dvh] flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted">Кейс не найден</p>
        <Link
          to="/cases"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Все кейсы
        </Link>
      </div>
    );
  }

  return (
    <article className="container-site py-24 md:py-32">
      <Link
        to="/cases"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Все кейсы
      </Link>

      <header className="mt-8 max-w-3xl">
        <h1 className="h-section">{caseData.title}</h1>
        {caseData.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {caseData.excerpt}
          </p>
        )}
        {caseData.tags.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Теги">
            {caseData.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </header>

      {caseData.previewImage && (
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface">
          <img
            src={caseData.previewImage}
            alt={`Превью кейса «${caseData.title}»`}
            className="w-full object-cover"
          />
        </div>
      )}

      {caseData.description && (
        <div className="mt-10 max-w-3xl">
          <h2 className="text-xl font-semibold">Описание</h2>
          <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {caseData.description}
          </div>
        </div>
      )}

      {caseData.problem && (
        <div className="mt-10 max-w-3xl">
          <h2 className="text-xl font-semibold">Проблема</h2>
          <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {caseData.problem}
          </div>
        </div>
      )}

      {caseData.solution && (
        <div className="mt-10 max-w-3xl">
          <h2 className="text-xl font-semibold">Решение</h2>
          <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {caseData.solution}
          </div>
        </div>
      )}

      {caseData.savings && (
        <div className="mt-10 max-w-3xl">
          <h2 className="text-xl font-semibold">Экономия</h2>
          <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {caseData.savings}
          </div>
        </div>
      )}

      {caseData.price && (
        <div className="mt-10 max-w-3xl">
          <h2 className="text-xl font-semibold">Цена</h2>
          <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {caseData.price}
          </div>
        </div>
      )}

      {caseData.videoUrl && (
        <div className="mt-10 max-w-4xl">
          <h2 className="text-xl font-semibold">Видеодемонстрация</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
            <video
              src={caseData.videoUrl}
              controls
              preload="metadata"
              className="w-full"
            >
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          </div>
        </div>
      )}

      <div className="mt-12 max-w-3xl rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-lg font-semibold">Хотите похожее решение для своего бизнеса?</p>
        <p className="mt-2 text-sm text-muted">
          Расскажите задачу — предложим оптимальный вариант автоматизации.
        </p>
        <Link
          to="/#lead"
          onClick={() => preselectTemplate(caseData.title)}
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-[filter] duration-200 hover:brightness-110"
        >
          Обсудить проект
        </Link>
      </div>
    </article>
  );
}

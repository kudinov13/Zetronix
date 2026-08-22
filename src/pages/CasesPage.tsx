import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";
import type { CaseDTO } from "@/lib/types";
import { Reveal } from "@/components/Reveal";
import { springLayout } from "@/lib/motion";

export function CasesPage() {
  const [cases, setCases] = useState<CaseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    api.listCases().then(setCases).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = "Кейсы автоматизации бизнеса — студия «Zetronix»";
    return () => {
      document.title = "Сайты и автоматизация для вашего бизнеса — студия «Zetronix»";
    };
  }, []);

  return (
    <section className="container-site scroll-mt-20 py-24 md:py-32">
      <Reveal>
        <h1 className="h-section max-w-2xl">
          Кейсы автоматизации бизнеса
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          Реальные проекты: какие проблемы решали, как внедряли и какой результат получили.
          Откройте кейс, чтобы узнать детали и посмотреть видео демонстрации.
        </p>
      </Reveal>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-border bg-surface p-12 text-center">
          <p className="text-muted">Пока нет кейсов. Скоро добавим.</p>
        </div>
      ) : (
        <motion.div
          layout={!reduce}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {cases.map((c) => (
              <motion.article
                key={c.slug}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={springLayout}
                className="group"
              >
                <Link
                  to={`/cases/${c.slug}`}
                  aria-label={`Открыть кейс «${c.title}»`}
                  className="block overflow-hidden rounded-2xl border border-border bg-surface transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_16px_48px_rgba(0,0,0,0.25)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                    <img
                      src={c.previewImage}
                      alt={`Превью кейса «${c.title}»`}
                      width={800}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                      <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground">
                        Открыть кейс
                        <ArrowUpRight aria-hidden className="size-4" />
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-semibold leading-snug">
                      {c.title}
                    </h3>
                    {c.excerpt && (
                      <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                        {c.excerpt}
                      </p>
                    )}
                    {c.tags.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Особенности">
                        {c.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full border border-border px-3 py-1 text-xs text-muted"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}

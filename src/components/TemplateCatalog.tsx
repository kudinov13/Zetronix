import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { api } from "@/lib/api";
import type { TemplateDTO, Category } from "@/lib/types";
import { TemplateCard } from "@/components/TemplateCard";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { springSoft } from "@/lib/motion";

export function TemplateCatalog() {
  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [active, setActive] = useState<string>("Все");
  const [loading, setLoading] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    Promise.all([api.listTemplates(), api.listCategories()])
      .then(([t, c]) => {
        setTemplates(t);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const filterOptions = useMemo(
    () => ["Все", ...categories.map((c) => c.name)],
    [categories],
  );

  const visible = useMemo(
    () =>
      active === "Все"
        ? templates
        : templates.filter((t) => t.category === active),
    [active, templates],
  );

  return (
    <section
      id="catalog"
      aria-labelledby="catalog-title"
      className="container-site scroll-mt-20 py-24 md:py-32"
    >
      <Reveal>
        <h2 id="catalog-title" className="h-section max-w-2xl">
          Шаблоны, которые можно потрогать
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          Каждый шаблон открывается вживую прямо здесь, в браузере. Нажмите на
          карточку и походите по сайту как обычный посетитель.
        </p>
      </Reveal>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : (
        <>
          {filterOptions.length > 1 && (
            <div
              role="group"
              aria-label="Фильтр по категориям"
              className="mt-10 flex flex-wrap gap-2"
            >
              <LayoutGroup id="catalog-filter">
                {filterOptions.map((category) => {
                  const isActive = category === active;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActive(category)}
                      aria-pressed={isActive}
                      className={cn(
                        "relative min-h-11 cursor-pointer rounded-full px-5 py-2.5 text-sm transition-colors duration-200",
                        isActive
                          ? "text-accent-foreground"
                          : "border border-border text-muted hover:border-foreground/25 hover:text-foreground",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="catalog-filter-pill"
                          transition={reduce ? { duration: 0.15 } : springSoft}
                          className="absolute inset-0 rounded-full bg-accent"
                        />
                      )}
                      <span className="relative z-10">{category}</span>
                    </button>
                  );
                })}
              </LayoutGroup>
            </div>
          )}

          {visible.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-border bg-surface p-12 text-center">
              <p className="text-muted">Пока нет шаблонов в этой категории.</p>
            </div>
          ) : (
            <motion.div
              layout={!reduce}
              className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {visible.map((template) => (
                  <TemplateCard key={template.slug} template={template} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}
    </section>
  );
}

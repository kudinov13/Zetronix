import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { TemplateDTO } from "@/lib/types";
import { springLayout } from "@/lib/motion";

interface TemplateCardProps {
  template: TemplateDTO;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={springLayout}
      className="group"
    >
      <Link
        to={`/templates/${template.slug}`}
        aria-label={`Открыть шаблон «${template.title}» в просмотрщике`}
        className="block overflow-hidden rounded-2xl border border-border bg-surface transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_16px_48px_rgba(0,0,0,0.25)] focus-visible:-translate-y-1"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
          <img
            src={template.previewImage}
            alt={`Превью шаблона «${template.title}»`}
            width={800}
            height={600}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-background/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground">
              Открыть шаблон
              <ArrowUpRight aria-hidden className="size-4" />
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-base font-semibold leading-snug">
              {template.title}
            </h3>
            <span className="shrink-0 text-sm text-muted">
              {template.category ?? "—"}
            </span>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Особенности">
            {template.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </motion.article>
  );
}

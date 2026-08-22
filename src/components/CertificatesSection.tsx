import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "@/lib/api";
import type { CertificateDTO } from "@/lib/types";
import { Reveal } from "@/components/Reveal";
import { staggerContainer, fadeUp, itemTransition } from "@/lib/motion";

export function CertificatesSection() {
  const [certs, setCerts] = useState<CertificateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<CertificateDTO | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    api.listCertificates().then(setCerts).finally(() => setLoading(false));
  }, []);

  if (!loading && certs.length === 0) return null;

  return (
    <section id="certificates" className="container-site scroll-mt-20 py-24 md:py-32">
      <Reveal>
        <h2 className="h-section max-w-2xl">
          Дипломы и сертификаты
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          Подтверждённая квалификация. Нажмите на документ, чтобы рассмотреть подробнее.
        </p>
      </Reveal>

      {loading ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer(reduce)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {certs.map((c) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => setActive(c)}
              variants={fadeUp(reduce)}
              transition={itemTransition(reduce)}
              className="group overflow-hidden rounded-2xl border border-border bg-surface text-left transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-surface-2">
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold leading-snug">{c.title}</p>
                {c.description && (
                  <p className="mt-1 text-xs text-muted line-clamp-2">{c.description}</p>
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Закрыть"
            className="absolute right-4 top-4 flex size-11 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="max-h-[90dvh] max-w-3xl overflow-auto rounded-2xl border border-border bg-surface p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={active.image}
              alt={active.title}
              className="mx-auto max-h-[80dvh] rounded-lg object-contain"
            />
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold">{active.title}</p>
              {active.description && (
                <p className="mt-1 text-sm text-muted">{active.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

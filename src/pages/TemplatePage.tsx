import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { api } from "@/lib/api";
import type { TemplateDTO } from "@/lib/types";
import { useLeadForm } from "@/hooks/useLeadForm";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Device = "phone" | "tablet" | "desktop";

const devices: Array<{ id: Device; label: string; icon: typeof Monitor }> = [
  { id: "phone", label: "Телефон", icon: Smartphone },
  { id: "tablet", label: "Планшет", icon: Tablet },
  { id: "desktop", label: "Компьютер", icon: Monitor },
];

const deviceWidth: Record<Device, string> = {
  phone: "375px",
  tablet: "768px",
  desktop: "100%",
};

export function TemplatePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { preselectTemplate } = useLeadForm();
  const reduce = useReducedMotion();
  const [template, setTemplate] = useState<TemplateDTO | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [device, setDevice] = useState<Device>("desktop");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setTemplate(null);
    setStatus("loading");
    api.getTemplate(slug).then(setTemplate).catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (template) {
      document.title = `${template.title} — просмотр шаблона, студия «Zetronix»`;
    }
    return () => {
      document.title = "Сайты и автоматизация для вашего бизнеса — студия «Zetronix»";
    };
  }, [template]);

  const goBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBack]);

  useEffect(() => {
    if (status !== "loading") return;
    const timeout = window.setTimeout(() => setStatus("error"), 15000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const handleWant = () => {
    if (template) preselectTemplate(template.slug);
    navigate("/");
    window.setTimeout(() => {
      document.getElementById("lead")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }, 120);
  };

  if (!template || notFound) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="h-section">Такого шаблона нет</h1>
        <p className="max-w-md text-muted">
          Возможно, ссылка устарела. Все актуальные шаблоны собраны в каталоге.
        </p>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground"
        >
          Назад к шаблонам
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.45, ease: EASE_OUT }}
      className="flex h-[100dvh] flex-col bg-background"
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-2 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={goBack}
          aria-label="Назад к шаблонам"
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 text-sm text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-foreground sm:px-4"
        >
          <ArrowLeft aria-hidden className="size-4" />
          <span className="hidden sm:inline">Назад к шаблонам</span>
        </button>

        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">
          {template.title}
        </h1>

        <div
          role="group"
          aria-label="Размер экрана"
          className="flex items-center rounded-full border border-border p-1"
        >
          {devices.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDevice(id)}
              aria-pressed={device === id}
              aria-label={label}
              title={label}
              className={cn(
                "flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-200",
                device === id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Icon aria-hidden className="size-4" />
            </button>
          ))}
        </div>

        {template.demoUrl && (
        <a
          href={template.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Открыть шаблон в новой вкладке"
          title="Открыть в новой вкладке"
          className="hidden size-11 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-foreground md:flex"
        >
          <ExternalLink aria-hidden className="size-4" />
        </a>
        )}

        <button
          type="button"
          onClick={handleWant}
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.98] sm:px-5"
        >
          Хочу такой сайт
        </button>
      </div>

      <div className="relative flex flex-1 justify-center overflow-hidden bg-surface-2/60 py-0 md:py-6">
        <div
          className={cn(
            "relative h-full w-full transition-[max-width] duration-300 ease-out",
            device !== "desktop" &&
              "overflow-hidden rounded-t-[28px] border-x border-t border-border shadow-[0_24px_80px_rgba(0,0,0,0.4)]",
          )}
          style={{ maxWidth: deviceWidth[device] }}
        >
          {device !== "desktop" && (
            <div
              aria-hidden
              className="flex h-7 items-center justify-center border-b border-border bg-surface"
            >
              <span className="h-1.5 w-16 rounded-full bg-border" />
            </div>
          )}

          <div className="relative h-[calc(100%-1.75rem)] w-full data-[device=desktop]:h-full" data-device={device}>
            <AnimatePresence>
              {status === "loading" && (
                <motion.div
                  key="skeleton"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-10 bg-surface"
                  aria-hidden
                >
                  <div className="h-full w-full animate-pulse p-6">
                    <div className="h-10 w-2/5 rounded-xl bg-surface-2" />
                    <div className="mt-4 h-5 w-3/5 rounded-lg bg-surface-2" />
                    <div className="mt-8 grid grid-cols-3 gap-4">
                      <div className="h-32 rounded-xl bg-surface-2" />
                      <div className="h-32 rounded-xl bg-surface-2" />
                      <div className="h-32 rounded-xl bg-surface-2" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {status === "error" ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="max-w-sm text-muted">
                  Шаблон долго не отвечает. Попробуйте открыть его в новой
                  вкладке или вернитесь к каталогу.
                </p>
                <a
                  href={template.demoUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-foreground transition-colors duration-200 hover:bg-surface"
                >
                  Открыть в новой вкладке
                  <ExternalLink aria-hidden className="size-4" />
                </a>
              </div>
            ) : (
              <iframe
                src={template.demoUrl ?? ""}
                title={`Живой шаблон «${template.title}»`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setStatus("ready")}
                className={cn(
                  "h-full w-full border-0 bg-surface transition-opacity duration-500",
                  status === "ready" ? "opacity-100" : "opacity-0",
                )}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

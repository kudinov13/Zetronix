import { motion, useReducedMotion } from "framer-motion";
import { VideoBackground } from "@/components/VideoBackground";
import { Magnetic } from "@/components/Magnetic";
import { EASE_OUT } from "@/lib/motion";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

const trustItems = [
  "10+ проектов запущено",
  "срок от 1 дня",
  "гарантия по договору",
];

export function Hero() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.12 } },
  };
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.3 : 0.7, ease: EASE_OUT },
    },
  };

  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[100dvh] items-center"
    >
      <VideoBackground />

      <motion.div
        className="container-site relative z-10 pb-24 pt-24"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          id="hero-title"
          variants={item}
          className="h-display max-w-4xl"
        >
          Сайты и автоматизация{" "}
          <span className="text-accent">для вашего бизнеса</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl"
        >
          Делаем готовые сайты за 1 день и внедряем автоматизацию бизнес-процессов:
          Telegram-боты, CRM, мобильные и десктопные приложения. Выберите шаблон
          или закажите решение под вашу задачу.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
          <Magnetic>
            <button
              type="button"
              onClick={() => scrollTo("catalog")}
              className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-accent px-8 py-3.5 text-base font-medium text-accent-foreground transition-[filter] duration-200 hover:brightness-110"
            >
              Посмотреть шаблоны
            </button>
          </Magnetic>
          <Magnetic>
            <button
              type="button"
              onClick={() => scrollTo("cases")}
              className="inline-flex min-h-12 cursor-pointer items-center rounded-full border border-border px-8 py-3.5 text-base font-medium text-foreground transition-colors duration-200 hover:border-foreground/30 hover:bg-surface"
            >
              Кейсы автоматизации
            </button>
          </Magnetic>
          <Magnetic>
            <button
              type="button"
              onClick={() => scrollTo("lead")}
              className="inline-flex min-h-12 cursor-pointer items-center rounded-full border border-border px-8 py-3.5 text-base font-medium text-foreground transition-colors duration-200 hover:border-foreground/30 hover:bg-surface"
            >
              Обсудить проект
            </button>
          </Magnetic>
        </motion.div>

        <motion.ul
          variants={item}
          className="mt-10 flex flex-wrap items-center gap-x-0 gap-y-2 text-sm text-muted"
        >
          {trustItems.map((text, i) => (
            <li key={text} className="flex items-center">
              {i > 0 && (
                <span aria-hidden className="mx-4 h-4 w-px bg-border" />
              )}
              {text}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-9 w-6 items-start justify-center rounded-full border border-border pt-1.5">
          <span className="scroll-hint-dot block size-1.5 rounded-full bg-muted" />
        </div>
      </div>
    </section>
  );
}

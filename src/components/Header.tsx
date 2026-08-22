import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "catalog", label: "Шаблоны" },
  { id: "how", label: "Как это работает" },
  { id: "cases", label: "Кейсы", route: "/cases" },
  { id: "team", label: "Команда" },
  { id: "pricing", label: "Цены" },
  { id: "faq", label: "Вопросы" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  const handleNav = (item: { id: string; route?: string }) => {
    setMenuOpen(false);
    if (item.route) {
      navigate(item.route);
      return;
    }
    if (pathname === "/") {
      scrollToSection(item.id);
    } else {
      navigate("/");
      window.setTimeout(() => scrollToSection(item.id), 80);
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled || menuOpen
            ? "border-b border-border bg-background/85 backdrop-blur-md"
            : "border-b border-transparent",
        )}
      >
        <div className="container-site flex h-16 items-center justify-between gap-4 md:h-18">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            aria-label="Zetronix, на главную"
          >
            <img
              src="/favicon.jpg"
              alt="Zetronix"
              className="size-8 rounded-lg object-cover"
            />
            <span className="font-display text-sm font-semibold tracking-tight">
              Zetronix
            </span>
          </Link>

          <nav aria-label="Основная навигация" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNav(item)}
                    className="cursor-pointer py-2 text-sm text-muted transition-colors duration-200 hover:text-foreground"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNav({ id: "lead" })}
              className="hidden min-h-11 cursor-pointer items-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.98] sm:inline-flex"
            >
              Обсудить проект
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={menuOpen}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-surface lg:hidden"
            >
              {menuOpen ? (
                <X aria-hidden className="size-5" />
              ) : (
                <Menu aria-hidden className="size-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Мобильное меню"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-30 w-72 border-l border-border bg-background pt-20 lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-4">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNav(item)}
                    className="min-h-11 w-full cursor-pointer rounded-xl px-4 py-3 text-left text-base text-foreground transition-colors duration-200 hover:bg-surface"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="mt-3 px-4">
                <button
                  type="button"
                  onClick={() => handleNav({ id: "lead" })}
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground"
                >
                  Обсудить проект
                </button>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

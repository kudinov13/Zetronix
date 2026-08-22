import { Link } from "react-router-dom";
import { Mail, Send, Phone } from "lucide-react";

const contacts = [
  {
    icon: Send,
    label: "Telegram",
    value: "@lhdevop",
    href: "https://t.me/lhdevop",
  },
  {
    icon: Mail,
    label: "Почта",
    value: "privet@zetronix.ru",
    href: "mailto:privet@zetronix.ru",
  },
  {
    icon: Phone,
    label: "Телефон",
    value: "8 (909) 505-34-44",
    href: "tel:+79095053444",
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border" aria-label="Подвал сайта">
      <div className="container-site py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold">Студия «Zetronix»</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Делаем сайты и автоматизируем бизнес-процессы. Быстро,
              понятно и по честной цене.
            </p>
          </div>

          <nav aria-label="Контакты">
            <p className="text-sm font-semibold">Связаться с нами</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-3 text-sm text-muted transition-colors duration-200 hover:text-foreground"
                  >
                    <Icon aria-hidden className="size-4 text-accent" />
                    <span className="sr-only">{label}: </span>
                    {value}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-sm font-semibold">Реквизиты</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Самозанятый Кудинов Михаил Дмитриевич
              <br />
              Является плательщиком налога на профессиональный доход
              <br />
              ИНН 220453448409
            </p>
            <Link
              to="/privacy"
              className="mt-4 inline-flex min-h-11 items-center text-sm text-muted underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-foreground"
            >
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>

      <div aria-hidden className="container-site select-none pb-6">
        <p className="bg-gradient-to-b from-foreground/15 to-transparent bg-clip-text text-center font-display text-[18vw] font-bold leading-[0.85] tracking-tight text-transparent lg:text-[11rem]">
          Zetronix
        </p>
      </div>

      <div className="border-t border-border">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Студия «Zetronix»</p>
          <p>По всем вопросам: 8 (909) 505-34-44</p>
          <Link
            to="/admin/login"
            aria-label="Админ-панель"
            className="flex size-6 items-center justify-center rounded-full transition-colors duration-200 hover:bg-accent/20"
          >
            <span className="size-2 rounded-full bg-muted/50 transition-colors duration-200 hover:bg-accent" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

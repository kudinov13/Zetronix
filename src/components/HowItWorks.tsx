import { motion, useReducedMotion } from "framer-motion";
import { Globe, MousePointerClick, SlidersHorizontal } from "lucide-react";
import { fadeUp, itemTransition, staggerContainer } from "@/lib/motion";

const steps = [
  {
    icon: MousePointerClick,
    title: "Выбираете и трогаете",
    text: "Открываете шаблон из каталога и смотрите его вживую: как работает меню, формы, кнопки.",
  },
  {
    icon: SlidersHorizontal,
    title: "Мы адаптируем под вас",
    text: "Меняем тексты, фотографии и цвета под ваш бизнес. Показываем результат и вносим правки.",
  },
  {
    icon: Globe,
    title: "Запускаем на вашем домене",
    text: "Подключаем адрес, настраиваем заявки в Telegram и передаём вам ключи от сайта.",
  },
];

export function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="container-site py-24 md:py-32"
    >
      <h2 id="how-title" className="h-section max-w-2xl">
        Как это работает
      </h2>

      <motion.ol
        className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8"
        variants={staggerContainer(reduce)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <span
          aria-hidden
          className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block"
        />
        {steps.map((step) => (
          <motion.li
            key={step.title}
            variants={fadeUp(reduce)}
            transition={itemTransition(reduce)}
            className="relative"
          >
            <span className="relative z-10 flex size-12 items-center justify-center rounded-2xl border border-border bg-surface">
              <step.icon aria-hidden className="size-5 text-accent" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 max-w-sm leading-relaxed text-muted">
              {step.text}
            </p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  );
}

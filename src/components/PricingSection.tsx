import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { pricingPlans } from "@/data/pricing";
import { fadeUp, itemTransition, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

function scrollToLead() {
  document.getElementById("lead")?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

export function PricingSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="container-site scroll-mt-20 py-24 md:py-32"
    >
      <h2 id="pricing-title" className="h-section max-w-2xl">
        Честные цены без звёздочек
      </h2>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        Цена фиксируется в договоре до начала работы и не меняется в процессе.
      </p>

      <motion.ul
        className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch"
        variants={staggerContainer(reduce)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {pricingPlans.map((plan) => (
          <motion.li
            key={plan.id}
            variants={fadeUp(reduce)}
            transition={itemTransition(reduce)}
            className="h-full"
          >
            <article
              className={cn(
                "flex h-full flex-col rounded-2xl border p-7",
                plan.featured
                  ? "border-accent/50 bg-surface shadow-[0_0_0_1px_var(--accent-soft),0_20px_60px_rgba(0,0,0,0.25)]"
                  : "border-border bg-surface",
              )}
            >
              {plan.featured && (
                <span className="mb-4 inline-flex w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                  Выбирают чаще всего
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-3xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted">{plan.duration}</span>
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-accent"
                    />
                    <span className="leading-relaxed text-muted">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={scrollToLead}
                className={cn(
                  "mt-8 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-[filter,background-color,border-color] duration-200",
                  plan.featured
                    ? "bg-accent text-accent-foreground hover:brightness-110"
                    : "border border-border text-foreground hover:border-foreground/30 hover:bg-surface-2",
                )}
              >
                Обсудить проект
              </button>
            </article>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

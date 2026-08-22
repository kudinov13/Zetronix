import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { faqItems } from "@/data/faq";
import { Reveal } from "@/components/Reveal";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="container-site scroll-mt-20 py-24 md:py-32"
    >
      <h2 id="faq-title" className="h-section max-w-2xl">
        Частые вопросы
      </h2>

      <div className="mt-12 max-w-3xl">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <Reveal key={item.question} delay={index * 0.04}>
              <div className="border-t border-border last:border-b">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    id={`faq-button-${index}`}
                    className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-medium md:text-lg">
                      {item.question}
                    </span>
                    <Plus
                      aria-hidden
                      className={cn(
                        "size-5 shrink-0 text-accent transition-transform duration-300",
                        isOpen && "rotate-45",
                      )}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-button-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: reduce ? 0.15 : 0.35,
                        ease: EASE_OUT,
                      }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 leading-relaxed text-muted">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

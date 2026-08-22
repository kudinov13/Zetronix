import { motion, useReducedMotion } from "framer-motion";
import { Github, Send } from "lucide-react";
import { team } from "@/data/team";
import { fadeUp, itemTransition, staggerContainer } from "@/lib/motion";

export function TeamSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="team"
      aria-labelledby="team-title"
      className="container-site scroll-mt-20 py-24 md:py-32"
    >
      <h2 id="team-title" className="h-section max-w-2xl">
        Кто будет делать ваш сайт
      </h2>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        Маленькая студия без посредников: вы всегда общаетесь напрямую с тем,
        кто делает работу.
      </p>

      <motion.ul
        className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={staggerContainer(reduce)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {team.map((member) => (
          <motion.li
            key={member.id}
            variants={fadeUp(reduce)}
            transition={itemTransition(reduce)}
          >
            <article className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-surface-2">
                <img
                  src={member.photo}
                  alt={`Фотография: ${member.name}`}
                  width={600}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-center gap-2 bg-gradient-to-t from-background/90 to-transparent p-4 pt-10 transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0">
                  <a
                    href={member.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} в Telegram`}
                    className="flex size-11 items-center justify-center rounded-full bg-surface text-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Send aria-hidden className="size-4" />
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} на GitHub`}
                    className="flex size-11 items-center justify-center rounded-full bg-surface text-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Github aria-hidden className="size-4" />
                  </a>
                </div>
              </div>
              <h3 className="mt-4 text-base font-semibold">{member.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {member.detail}
              </p>
            </article>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

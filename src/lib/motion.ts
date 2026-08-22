import type { Variants, Transition } from "framer-motion";

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const springSoft: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
};

export const springLayout: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  duration: 0.3,
};

export function fadeUp(reduce: boolean | null): Variants {
  return {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };
}

export function staggerContainer(
  reduce: boolean | null,
  step = 0.08,
): Variants {
  return {
    hidden: {},
    visible: {
      transition: reduce ? {} : { staggerChildren: step },
    },
  };
}

export const itemTransition = (reduce: boolean | null): Transition =>
  reduce ? { duration: 0.3 } : { duration: 0.55, ease: EASE_OUT };

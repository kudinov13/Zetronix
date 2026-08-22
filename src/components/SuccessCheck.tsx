import { motion, useReducedMotion } from "framer-motion";

export function SuccessCheck() {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 64 64"
      className="size-16"
      role="img"
      aria-label="Заявка отправлена"
      initial={reduce ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="4"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduce ? 0.2 : 0.6, ease: "easeOut" }}
      />
      <motion.path
        d="M20 33 L28.5 41.5 L45 24"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: reduce ? 0.2 : 0.4,
          delay: reduce ? 0 : 0.45,
          ease: "easeOut",
        }}
      />
    </motion.svg>
  );
}

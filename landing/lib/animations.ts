import type { Variants, Transition } from "framer-motion";

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.15,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

export const clipReveal: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: { clipPath: "inset(0 0% 0 0)" },
};

export const springScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const tiltUp: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: 15 },
  visible: { opacity: 1, y: 0, rotateX: 0 },
};

// ---------------------------------------------------------------------------
// Keyframe animation objects (used as animate= props, not Variants)
// ---------------------------------------------------------------------------

/** Hero float — pass as `animate` prop on a motion.div */
export const lpFloat = {
  y: [0, -10, 0],
  transition: { duration: 4.5, ease: "easeInOut", repeat: Infinity },
};

/** Modal in — use initial/animate pair */
export const lpModalIn = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

/** Fade in — pass as `animate` prop */
export const lpFadeIn = {
  opacity: [0, 1],
  transition: { duration: 1.5, ease: "easeOut" },
};

// ---------------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------------

export const defaultTransition: Transition = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1],
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 18,
  mass: 1,
};

export const brandTransition: Transition = {
  duration: 1.5,
  ease: "easeOut",
};

export const modalTransition: Transition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1],
};

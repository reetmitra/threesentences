import type { Variants, Transition } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
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
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0 },
};

export const clipReveal: Variants = {
  hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
  visible: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
};

export const springScale: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1 },
};

export const tiltUp: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: 15 },
  visible: { opacity: 1, y: 0, rotateX: 0 },
};

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

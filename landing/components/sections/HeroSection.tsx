"use client";

import { motion } from "framer-motion";
import { useScrollY } from "@/hooks/useScrollY";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Logo3hree } from "@/components/Logo3hree";

interface HeroSectionProps {
  onCTAClick: () => void;
}

const lpFloat = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 4.5, ease: "easeInOut" as const, repeat: Infinity },
  },
};

function FloatingMark({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      className="flex gap-[14px] items-center mb-10"
      animate={reduced ? undefined : "animate"}
      variants={lpFloat}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-[10px] h-[10px] rounded-full"
          style={{ backgroundColor: "#FFFFF0" }}
        />
      ))}
    </motion.div>
  );
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  const scrollY = useScrollY();
  const reduced = useReducedMotion();
  const elevated = scrollY > 40;

  const heroOpacity = reduced ? 1 : Math.max(0, 1 - scrollY / 600);
  const heroY = reduced ? 0 : Math.min(scrollY * 0.3, 200);
  const glowY = reduced ? 0 : scrollY * 0.15;

  const heroStyle = reduced
    ? {}
    : {
        opacity: heroOpacity,
        transform: `translateY(${heroY}px)`,
      };

  const glowStyle = reduced
    ? {
        background:
          "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.05), transparent 50%)",
      }
    : {
        background:
          "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.05), transparent 50%)",
        transform: `translateY(${glowY}px)`,
        opacity: heroOpacity,
      };

  return (
    <section className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          padding: elevated ? "14px 64px" : "24px 64px",
          background: elevated ? "rgba(6,6,8,0.78)" : "transparent",
          backdropFilter: elevated ? "blur(16px)" : "none",
          WebkitBackdropFilter: elevated ? "blur(16px)" : "none",
          borderBottom: `1px solid ${elevated ? "rgba(255,255,255,0.06)" : "transparent"}`,
          transition: "all 240ms ease",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo3hree size="sm" />
            <span className="font-mono text-xs tracking-[3px] uppercase text-white/60">
              Three Sentences
            </span>
            <span className="font-mono text-[9px] tracking-[2px] uppercase text-white/20">
              by 363™
            </span>
          </div>
          <div className="flex items-center gap-6">
            {(['why', 'how', 'inside', 'faq'] as const).map(link => (
              <a
                key={link}
                href={`#${link}`}
                className="hidden md:block text-[11px] tracking-[2.4px] uppercase font-mono text-white/50 hover:text-white transition-colors duration-200"
              >
                {link.toUpperCase()}
              </a>
            ))}
            <button
              onClick={onCTAClick}
              className="font-mono text-[11px] tracking-[2px] uppercase text-white/50 border border-white/10 px-4 py-2 rounded-full hover:text-white hover:border-white/30 transition-colors duration-200"
            >
              Join the waitlist
            </button>
          </div>
        </div>
      </nav>

      {/* Background glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={glowStyle}
      />

      {/* Dot grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(235,231,220,0.025) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Hero content */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 pt-24"
        style={heroStyle}
      >
        <div className="text-center max-w-3xl mx-auto">
          <FloatingMark reduced={reduced} />

          <motion.h1
            className="text-7xl sm:text-8xl font-serif italic tracking-[-0.375rem] text-white leading-none mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
            }
          >
            Three<br />Sentences.
          </motion.h1>

          <motion.p
            className="font-mono text-[10px] tracking-[3px] uppercase text-white/30 mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }
            }
          >
            BE BETTER. DO BETTER.
          </motion.p>

          <motion.p
            className="text-white/40 text-base max-w-lg mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 0.8, delay: 0.5 }}
          >
            A daily journaling practice built on one unbreakable constraint.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.7 }
            }
          >
            <button
              onClick={onCTAClick}
              className="bg-white text-black font-mono text-xs tracking-[2px] uppercase px-8 py-3 rounded-full hover:-translate-y-px transition-transform duration-200"
            >
              Request access →
            </button>
            <a
              href="#constraint"
              className="font-mono text-xs tracking-[2px] uppercase px-8 py-3 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors duration-200"
            >
              See how it works
            </a>
          </motion.div>
        </div>
      </main>

      {/* Scroll cue */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none"
        style={reduced ? {} : { opacity: heroOpacity }}
      >
        <span className="font-mono text-[9px] tracking-[3px] uppercase text-white/25">
          Scroll
        </span>
        <div
          className="w-px h-14"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)",
          }}
        />
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TextScramble } from "@/components/ui/text-scramble";
import { GradualSpacing } from "@/components/ui/gradual-spacing";

interface HeroSectionProps {
  onCTAClick: () => void;
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  const [scrambleRelease, setScrambleRelease] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setScrambleRelease(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">THREE</span>
            <span className="text-[10px] text-white/30 tracking-wider uppercase">
              by 363™
            </span>
          </div>
          <Button variant="outline" onClick={onCTAClick} className="text-sm">
            Join the waitlist
          </Button>
        </div>
      </motion.nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Main Logo */}
          <div className="mb-6 flex flex-col items-center">
            <GradualSpacing
              text="THREE"
              duration={0.6}
              delayMultiple={0.08}
              className="text-7xl sm:text-8xl md:text-[9rem] font-bold tracking-tight text-white leading-none"
            />
            <motion.p
              className="text-sm sm:text-base text-white/50 tracking-wide mt-6 font-light text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              be better, do better
            </motion.p>
            <motion.p
              className="text-xs text-white/30 tracking-[0.2em] uppercase mt-3 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.6 }}
            >
              by 363™
            </motion.p>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="text-sm text-white/30 tracking-wide mb-8 mt-12"
          >
            Three sentences. Every day.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            className="text-sm text-white/30 max-w-lg mx-auto leading-relaxed mb-10"
          >
            A private community for high achievers who reflect daily.
            Write three sentences, stay accountable, and grow alongside
            people who are building something meaningful.
          </motion.p>

          {/* Release Date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="mb-10"
          >
            <TextScramble
              className="text-xs text-white/20 uppercase tracking-[0.3em] font-mono"
              duration={1.5}
              speed={0.04}
              trigger={scrambleRelease}
              characterSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            >
              Q4 2026
            </TextScramble>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.4 }}
          >
            <Button
              size="lg"
              onClick={onCTAClick}
              className="text-base px-8 py-6 h-auto"
            >
              Get early access
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-16 bg-gradient-to-b from-transparent to-white/20" />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-white/40"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </main>
    </section>
  );
}

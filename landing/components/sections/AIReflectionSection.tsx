"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Typewriter } from "@/components/ui/typewriter";
import { fadeUp, tiltUp, staggerContainer, defaultTransition } from "@/lib/animations";

type Range = "7d" | "30d" | "90d";

const RANGES: { label: string; value: Range; period: string; entries: number }[] = [
  { label: "1 week", value: "7d", period: "7-day analysis", entries: 7 },
  { label: "1 month", value: "30d", period: "30-day analysis", entries: 28 },
  { label: "3 months", value: "90d", period: "90-day analysis", entries: 81 },
];

const REFLECTIONS: Record<Range, string> = {
  "7d":
    "This week you kept it short and honest. Three sentences, no filler. You mentioned shipping twice — that's new. Something clicked.",
  "30d":
    "You've been writing about momentum a lot this month. There's a shift happening — you're moving from planning to executing. The entries where you mention shipping feel different. More alive. Trust that.",
  "90d":
    "Three months in, a clear pattern: you write best on Tuesdays and after workouts. Your language has grown quieter and more certain. The self-doubt entries peaked in month two and have been falling ever since.",
};

export function AIReflectionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [selectedRange, setSelectedRange] = useState<Range>("30d");

  // Delay typewriter start slightly after section enters view
  if (isInView && !showTypewriter) {
    setTimeout(() => setShowTypewriter(true), 600);
  }

  const activeRange = RANGES.find((r) => r.value === selectedRange)!;

  return (
    <section ref={ref} className="py-24 sm:py-32 px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
        {/* Left: Text */}
        <motion.div
          className="flex-1 text-center md:text-left"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.p
            variants={fadeUp}
            transition={defaultTransition}
            className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4"
          >
            Your AI mirror
          </motion.p>
          <motion.h2
            variants={fadeUp}
            transition={defaultTransition}
            className="text-3xl sm:text-4xl font-light text-white/80 leading-tight"
          >
            Patterns you can&apos;t
            <br />
            see yourself.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            transition={defaultTransition}
            className="text-sm text-white/25 leading-relaxed mt-6 max-w-sm mx-auto md:mx-0"
          >
            Three uses AI to surface patterns across 7, 30, and 90 days
            of your entries. Not advice. Not therapy. Just a mirror.
          </motion.p>
        </motion.div>

        {/* Right: Mockup card with 3D tilt entrance */}
        <motion.div
          className="flex-1 w-full max-w-sm"
          style={{ perspective: 800 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            variants={tiltUp}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            style={{ transformOrigin: "center bottom" }}
          >
            <div className="border border-white/[0.08] rounded-2xl p-6 bg-white/[0.02]">
              {/* Card header */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-[10px] text-white/30 uppercase tracking-wider">
                  AI Reflection
                </span>
              </div>

              {/* Range chips */}
              <div className="flex gap-1.5 mt-2 mb-3">
                {RANGES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRange(r.value)}
                    className={[
                      "text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors duration-200",
                      selectedRange === r.value
                        ? "border-white/30 text-white/60 bg-white/[0.06]"
                        : "border-white/[0.08] text-white/20 bg-transparent hover:border-white/20 hover:text-white/40",
                    ].join(" ")}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* AnimatePresence: period label */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`period-${selectedRange}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-[10px] text-white/15 mb-4"
                >
                  {activeRange.period}
                </motion.p>
              </AnimatePresence>

              <div className="h-px bg-white/[0.06] mb-4" />

              {/* Reflection content — AnimatePresence chip swap */}
              <div className="min-h-[120px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedRange}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {showTypewriter ? (
                      <Typewriter
                        text={REFLECTIONS[selectedRange]}
                        speed={25}
                        showCursor={true}
                        loop={false}
                        hideCursorOnType={true}
                        className="text-xs text-white/35 leading-relaxed"
                        cursorClassName="ml-0.5 text-white/30"
                      />
                    ) : (
                      <div className="text-xs text-white/10">...</div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Card footer */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`footer-${selectedRange}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-[10px] text-white/10 mt-4"
                >
                  Based on {activeRange.entries} entries
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

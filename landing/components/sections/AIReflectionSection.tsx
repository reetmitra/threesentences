"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Typewriter } from "@/components/ui/typewriter";
import { fadeUp, tiltUp, staggerContainer, defaultTransition } from "@/lib/animations";

const reflectionText =
  "You\u2019ve been writing about momentum a lot this month. There\u2019s a shift happening \u2014 you\u2019re moving from planning to executing. The entries where you mention shipping feel different. More alive. Trust that.";

export function AIReflectionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [showTypewriter, setShowTypewriter] = useState(false);

  // Delay typewriter start slightly after section enters view
  if (isInView && !showTypewriter) {
    setTimeout(() => setShowTypewriter(true), 600);
  }

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
              <p className="text-[10px] text-white/15 mb-4">30-day analysis</p>

              <div className="h-px bg-white/[0.06] mb-4" />

              {/* Reflection content */}
              <div className="min-h-[120px]">
                {showTypewriter ? (
                  <Typewriter
                    text={reflectionText}
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
              </div>

              {/* Card footer */}
              <p className="text-[10px] text-white/10 mt-4">
                Based on 28 entries
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";
import { fadeUp, defaultTransition } from "@/lib/animations";

const SCRIPT =
  "The rain stopped just after lunch.\nI walked the long way to the post office.\nA small kindness from a stranger.";

function countSentences(text: string): number {
  return (text.match(/\./g) || []).length;
}

function MiniPhone() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -30% 0px" });
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const delays: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 400;

    for (let i = 0; i < SCRIPT.length; i++) {
      const charDelay = 38 + Math.random() * 30;
      elapsed += charDelay;
      const idx = i + 1;
      const t = setTimeout(() => {
        if (!cancelled) setTyped(SCRIPT.slice(0, idx));
      }, elapsed);
      delays.push(t);
    }

    const doneT = setTimeout(() => {
      if (!cancelled) setSubmitted(true);
    }, elapsed + 600);
    delays.push(doneT);

    timeoutsRef.current = delays;
    return () => {
      cancelled = true;
      delays.forEach(clearTimeout);
    };
  }, [inView]);

  const dotCount = countSentences(typed);

  return (
    <div
      ref={ref}
      className="w-64 bg-[#0d0d0f] border border-white/[0.06] rounded-3xl p-5 font-mono text-xs shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="transition-colors duration-500"
          style={{ color: submitted ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)" }}
        >
          {submitted ? "Done." : "Today"}
        </span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors duration-200"
              style={{
                backgroundColor:
                  i < dotCount ? "#FFFFFF" : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Text area */}
      <div
        className="min-h-[80px] text-xs leading-relaxed whitespace-pre-wrap"
        style={{
          color: "rgba(255,255,255,0.6)",
          transition: "all 0.6s ease",
          ...(submitted
            ? {
                background: "rgba(255,255,255,0.03)",
                borderLeft: "2px solid rgba(255,255,255,0.5)",
                paddingLeft: "10px",
                borderRadius: "2px",
              }
            : {}),
        }}
      >
        {typed}
        {!submitted && (
          <span
            className="inline-block w-0.5 h-3 bg-white/60 ml-0.5 align-middle"
            style={{ animation: "lpCursor 1s step-start infinite" }}
          />
        )}
      </div>

      {/* Counter + submit */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <span
          style={{ color: submitted ? "#FFFFFF" : "rgba(255,255,255,0.3)" }}
        >
          {submitted
            ? "✓ Locked"
            : `${dotCount} / 3 · ${dotCount === 3 ? "Ready" : "more"}`}
        </span>
        <div
          className="px-3 py-1 rounded-full text-[10px] transition-all duration-500"
          style={{
            backgroundColor: submitted ? "#FFFFFF" : "transparent",
            border: "1px solid",
            borderColor: submitted ? "#FFFFFF" : "rgba(255,255,255,0.12)",
            color: submitted ? "#0a0a0a" : "rgba(255,255,255,0.35)",
          }}
        >
          {submitted ? "Submitted" : "Submit"}
        </div>
      </div>

      <style>{`@keyframes lpCursor { 0%,49%{opacity:1} 50%,100%{opacity:0} }`}</style>
    </div>
  );
}

export function ConstraintSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section
      ref={ref}
      className="min-h-[80vh] flex items-center justify-center px-6 py-32 sm:py-40"
    >
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left: copy */}
          <div className="flex-1 text-center lg:text-left">
            {/* Decorative line */}
            <motion.div
              className="w-16 h-px bg-white/10 mb-12 mx-auto lg:mx-0"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Main statement */}
            <TextScramble
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white"
              duration={1.2}
              speed={0.03}
              trigger={isInView}
              characterSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            >
              Three sentences.
            </TextScramble>

            {/* Sub-statement */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ ...defaultTransition, delay: 0.6 }}
              className="text-xl sm:text-2xl text-white/30 font-light mt-4"
            >
              No more. No less.
            </motion.p>

            {/* Philosophy */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ ...defaultTransition, delay: 1.0 }}
              className="text-sm text-white/20 max-w-sm leading-relaxed mt-12 mx-auto lg:mx-0"
            >
              Constraint breeds creativity. When you can only say three things,
              you say the right things.
            </motion.p>
          </div>

          {/* Right: MiniPhone demo */}
          <motion.div
            className="flex-shrink-0 flex justify-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <MiniPhone />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

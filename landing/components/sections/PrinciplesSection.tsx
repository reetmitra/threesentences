"use client";

import { motion } from "framer-motion";
import { slideFromLeft, slideFromRight, defaultTransition } from "@/lib/animations";
import { Reveal } from "@/components/ui/Reveal";

const principles = [
  { num: "01", title: "Three Sentences", subtitle: "The Constraint", tagline: "Say only what matters." },
  { num: "02", title: "Build Iron Habits", subtitle: "The Grind", tagline: "Show up every single day." },
  { num: "03", title: "No Edits", subtitle: "The Truth", tagline: "Write it. Leave it. Mean it." },
  { num: "04", title: "Go Ghost", subtitle: "The Focus", tagline: "Your journal is yours alone." },
  { num: "05", title: "Execute", subtitle: "The Action", tagline: "Stop planning. Start doing." },
];

export function PrinciplesSection() {
  return (
    <section className="py-24 sm:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.p
          className="text-xs text-white/30 tracking-[0.3em] uppercase text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          The Five Principles
        </motion.p>

        {/* Principles list */}
        <div className="divide-y divide-white/[0.06]">
          {principles.map((p, i) => (
            <Reveal key={p.num} delay={i * 0.08}>
              <motion.div
                variants={i % 2 === 0 ? slideFromLeft : slideFromRight}
                transition={defaultTransition}
                className="flex items-baseline gap-6 sm:gap-8 py-7 sm:py-8"
              >
                <span className="text-xs text-white/15 w-8 shrink-0">
                  {p.num}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                    <h3 className="text-lg sm:text-xl font-medium text-white/80">
                      {p.title}
                    </h3>
                    <span className="text-sm text-white/25">{p.subtitle}</span>
                  </div>
                  <p className="text-sm text-white/20 mt-1">{p.tagline}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

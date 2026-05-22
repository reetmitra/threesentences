"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

const principles = [
  { title: "Permanence.", body: "Every entry is locked. Your words stand." },
  { title: "Privacy.", body: "No tracking, no advertising, no third parties." },
  { title: "Presence.", body: "Three sentences forces you to be here, now." },
  { title: "People.", body: "A quiet circle of people who also show up." },
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
          The Four Principles
        </motion.p>

        {/* 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {principles.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.012)',
                  border: '1px solid #1e1e22',
                  borderRadius: 20,
                  padding: '56px 52px',
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: 3,
                    color: '#8a877e',
                    marginBottom: 24,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3
                  style={{
                    fontSize: 'clamp(22px, 2vw, 32px)',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    letterSpacing: -0.3,
                    lineHeight: 1.2,
                    color: '#ebe7dc',
                    marginBottom: 20,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    fontFamily: 'var(--font-sans)',
                    color: '#8a877e',
                    lineHeight: 1.65,
                  }}
                >
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

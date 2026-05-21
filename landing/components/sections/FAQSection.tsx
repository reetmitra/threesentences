"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

const FAQS = [
  {
    q: "How is Three different from a journal app?",
    a: "Three enforces a constraint — exactly three sentences per day. The limit is the point. It forces clarity.",
  },
  {
    q: "Is my data private?",
    a: "Your entries are encrypted end-to-end. Not even we can read them.",
  },
  {
    q: "What's the AI reflection?",
    a: "After you write, our AI reads your three sentences and offers one thoughtful question to deepen your reflection.",
  },
  {
    q: "What is The Circle?",
    a: "A small, close group — max 5 friends — who share their daily three sentences with each other.",
  },
  {
    q: "How does the streak work?",
    a: "Write once per day to keep your streak alive. Miss a day, it resets to zero.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes. Write daily, view your history, basic streaks — all free. AI reflections and Circle require Pro.",
  },
  {
    q: "When does it launch?",
    a: "Soon. Join the waitlist to get early access.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Heading */}
        <Reveal className="text-center mb-14">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-white/30 mb-4">
            FAQ
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#FFFFF0]">
            Questions
          </h2>
        </Reveal>

        {/* Accordion */}
        <div>
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                style={{ borderBottom: "1px solid #1E1E2E" }}
              >
                <button
                  className="w-full flex items-center justify-between py-5 text-left group"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                >
                  <span
                    className="text-base font-medium pr-6 leading-snug transition-colors duration-200"
                    style={{ color: isOpen ? "#FFFFF0" : "rgba(255,255,240,0.75)" }}
                  >
                    {item.q}
                  </span>
                  <span
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center font-mono text-lg leading-none"
                    style={{
                      color: "#6B6B8A",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    +
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <p
                        className="text-sm leading-relaxed pb-5"
                        style={{ color: "#6B6B8A" }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

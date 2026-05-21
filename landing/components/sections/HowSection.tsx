"use client";

import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    number: "01",
    title: "Write",
    body: "Open the app. Write exactly three sentences about your day.",
  },
  {
    number: "02",
    title: "Reflect",
    body: "Get AI-powered questions that push you deeper.",
  },
  {
    number: "03",
    title: "Grow",
    body: "Track your streak. Watch patterns emerge over time.",
  },
];

export function HowSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <Reveal className="text-center mb-16">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-white/30 mb-4">
            The practice
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#FFFFF0]">
            How it works
          </h2>
        </Reveal>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.15}>
              <div
                className="rounded-2xl p-8 h-full"
                style={{
                  backgroundColor: "#121218",
                  border: "1px solid #1E1E2E",
                }}
              >
                <span
                  className="font-mono text-xs tracking-[2px]"
                  style={{ color: "#3A3A5A" }}
                >
                  {step.number}
                </span>
                <h3
                  className="text-2xl font-bold tracking-tight mt-4 mb-3"
                  style={{ color: "#FFFFF0" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#6B6B8A" }}
                >
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

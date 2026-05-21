"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const TABS = ["Today", "History", "Insights", "Circle"] as const;
type Tab = (typeof TABS)[number];

/* ─── Mock UI content per tab ──────────────────────────────────────────────── */

function TodayContent() {
  return (
    <div
      className="rounded-2xl p-6 max-w-sm mx-auto"
      style={{ backgroundColor: "#0d0d10", border: "1px solid #1E1E2E" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-white/50">Today</span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: i === 0 ? "#FFFFF0" : "#2A2A3A" }}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2 mb-5">
        {["The morning was quiet.", "I finished what I started.", ""].map(
          (line, i) => (
            <div
              key={i}
              className="h-4 rounded"
              style={{
                backgroundColor: line ? "#1E1E2E" : "#141420",
                width: i === 0 ? "80%" : i === 1 ? "64%" : "40%",
              }}
            />
          )
        )}
      </div>
      <div
        className="flex items-center justify-between pt-4"
        style={{ borderTop: "1px solid #1E1E2E" }}
      >
        <span className="font-mono text-[10px] text-white/25">1 / 3 · more</span>
        <div
          className="px-3 py-1 rounded-full font-mono text-[10px]"
          style={{ border: "1px solid #2A2A3A", color: "#6B6B8A" }}
        >
          Submit
        </div>
      </div>
      <p className="font-mono text-[10px] tracking-[2px] uppercase text-white/20 mt-6 text-center">
        Write three sentences. Lock your day.
      </p>
    </div>
  );
}

function HistoryContent() {
  const days = Array.from({ length: 35 }, (_, i) => ({
    filled: Math.random() > 0.3,
    streak: Math.random() > 0.7,
  }));

  return (
    <div className="max-w-sm mx-auto">
      <p className="font-mono text-[10px] tracking-[2px] uppercase text-white/20 text-center mb-6">
        Every day, catalogued. Scroll back through your story.
      </p>
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "#0d0d10", border: "1px solid #1E1E2E" }}
      >
        <div className="grid grid-cols-7 gap-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              className="font-mono text-[9px] text-center"
              style={{ color: "#3A3A5A" }}
            >
              {d}
            </div>
          ))}
          {days.map((day, i) => (
            <div
              key={i}
              className="aspect-square rounded-full"
              style={{
                backgroundColor: day.streak
                  ? "#FFFFF0"
                  : day.filled
                  ? "#2A2A4A"
                  : "#141420",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsContent() {
  const bars = [
    { label: "Gratitude", pct: 72 },
    { label: "Work", pct: 48 },
    { label: "People", pct: 61 },
  ];

  return (
    <div className="max-w-sm mx-auto">
      <p className="font-mono text-[10px] tracking-[2px] uppercase text-white/20 text-center mb-6">
        Patterns surface over time. What do you return to?
      </p>
      <div
        className="rounded-2xl p-6 space-y-5"
        style={{ backgroundColor: "#0d0d10", border: "1px solid #1E1E2E" }}
      >
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex justify-between mb-1.5">
              <span className="font-mono text-[10px]" style={{ color: "#6B6B8A" }}>
                {bar.label}
              </span>
              <span className="font-mono text-[10px]" style={{ color: "#3A3A5A" }}>
                {bar.pct}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "#1E1E2E" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${bar.pct}%`, backgroundColor: "#FFFFF0" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CircleContent() {
  const avatars = [
    { initials: "AM", active: true },
    { initials: "JK", active: true },
    { initials: "RP", active: false },
  ];

  return (
    <div className="max-w-sm mx-auto">
      <p className="font-mono text-[10px] tracking-[2px] uppercase text-white/20 text-center mb-6">
        Share with close friends. See their days.
      </p>
      <div
        className="rounded-2xl p-6 space-y-3"
        style={{ backgroundColor: "#0d0d10", border: "1px solid #1E1E2E" }}
      >
        {avatars.map((av) => (
          <div
            key={av.initials}
            className="flex items-center gap-4 p-3 rounded-xl"
            style={{ backgroundColor: "#141420" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] flex-shrink-0"
              style={{
                backgroundColor: av.active ? "#1E1E3E" : "#1A1A22",
                color: av.active ? "#FFFFF0" : "#3A3A5A",
              }}
            >
              {av.initials}
            </div>
            <div className="flex-1 space-y-1.5">
              <div
                className="h-2.5 rounded"
                style={{ backgroundColor: "#2A2A3A", width: "70%" }}
              />
              <div
                className="h-2.5 rounded"
                style={{ backgroundColor: "#1E1E2E", width: "50%" }}
              />
            </div>
            {av.active && (
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#FFFFF0" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const TAB_CONTENT: Record<Tab, () => React.ReactNode> = {
  Today: () => <TodayContent />,
  History: () => <HistoryContent />,
  Insights: () => <InsightsContent />,
  Circle: () => <CircleContent />,
};

/* ─── Main section ──────────────────────────────────────────────────────────── */

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<Tab>("Today");
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduced = useReducedMotion();

  const startCycle = () => {
    if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    cycleTimerRef.current = setInterval(() => {
      setActiveTab((prev) => {
        const idx = TABS.indexOf(prev);
        return TABS[(idx + 1) % TABS.length];
      });
    }, 1800);
  };

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);

    // Clear auto-cycle on manual click
    if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);

    // Restart cycle after 6s idle (only if not reduced)
    if (!reduced) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        startCycle();
      }, 6000);
    }
  };

  useEffect(() => {
    if (reduced) return; // skip auto-cycle
    startCycle();
    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [reduced]);

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <Reveal className="text-center mb-12">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-white/30 mb-4">
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#FFFFF0]">
            Everything you need
          </h2>
        </Reveal>

        {/* Tab bar */}
        <div className="flex justify-center mb-8">
          <div
            className="flex gap-1 p-1 rounded-full"
            style={{ backgroundColor: "#0d0d10", border: "1px solid #1E1E2E" }}
          >
            {TABS.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className="relative px-4 py-2 rounded-full font-mono text-xs tracking-[1px] transition-colors duration-200"
                  style={{
                    color: isActive ? "#FFFFF0" : "#6B6B8A",
                    backgroundColor: isActive ? "#1E1E2E" : "transparent",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content with AnimatePresence */}
        <div className="min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -8 }}
              transition={reduced ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }}
            >
              {TAB_CONTENT[activeTab]()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pager dots */}
        <div className="flex justify-center gap-2 mt-8">
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: isActive ? "16px" : "6px",
                  backgroundColor: isActive ? "#FFFFF0" : "#3A3A4A",
                }}
                aria-label={`Switch to ${tab} tab`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

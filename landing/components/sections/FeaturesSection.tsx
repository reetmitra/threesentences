"use client";

import React, { useEffect, useRef, useState } from "react";
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
          style={{ border: "1px solid #1e1e22", color: "#8a877e" }}
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
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % 4), 1800);
    return () => clearInterval(id);
  }, []);

  const prompts = [
    { eyebrow: 'THEME', body: 'Transitions and thresholds' },
    { eyebrow: 'OBSERVATION', body: 'You write more on Tuesdays' },
    { eyebrow: 'PATTERN', body: 'Gratitude appears in 6 of 7 entries' },
    { eyebrow: 'QUESTION', body: 'What are you holding lightly?' },
  ];

  return (
    <div className="max-w-sm mx-auto">
      <p className="font-mono text-[10px] tracking-[2px] uppercase text-white/20 text-center mb-6">
        Patterns surface over time. What do you return to?
      </p>
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "#0d0d10", border: "1px solid #1E1E2E" }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {prompts.map((p, i) => (
            <div
              key={i}
              style={{
                opacity: active === i ? 1 : 0.55,
                borderLeft: `2px solid ${active === i ? '#ffffff' : '#3a3a3e'}`,
                paddingLeft: 12,
                paddingTop: 8,
                paddingBottom: 8,
                transition: 'opacity 400ms ease, border-color 400ms ease',
              }}
            >
              <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.4, color: active === i ? '#ffffff' : '#8a877e', fontFamily: 'var(--font-mono)', marginBottom: 4, transition: 'color 400ms ease' }}>{p.eyebrow}</p>
              <p style={{ fontSize: active === i ? 13 : 12, color: '#ebe7dc', fontFamily: 'var(--font-sans)', lineHeight: 1.5, transition: 'font-size 400ms ease' }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CircleContent() {
  const [view, setView] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setView(v => (v + 1) % 3), 5000);
    return () => clearInterval(id);
  }, []);

  const views = [
    // Friend list view
    <div key="list" style={{ padding: '12px 0' }}>
      {['Maya R.', 'James K.', 'Priya S.'].map((name, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #1e1e22' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#15151a', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: '#ebe7dc', fontFamily: 'var(--font-sans)', margin: 0 }}>{name}</p>
            <p style={{ fontSize: 10, color: '#8a877e', fontFamily: 'var(--font-sans)', margin: 0 }}>Day {47 + i * 11} streak</p>
          </div>
        </div>
      ))}
    </div>,
    // DM view
    <div key="dm" style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ alignSelf: 'flex-start', background: '#15151a', border: '1px solid #1e1e22', borderRadius: '16px 16px 16px 4px', padding: '8px 12px', maxWidth: '80%' }}>
        <p style={{ fontSize: 13, color: '#ebe7dc', margin: 0 }}>How are you feeling about the 30-day mark?</p>
      </div>
      <div style={{ alignSelf: 'flex-end', background: '#ffffff', borderRadius: '16px 16px 4px 16px', padding: '8px 12px', maxWidth: '80%' }}>
        <p style={{ fontSize: 13, color: '#0a0a0a', margin: 0 }}>Closer than I've ever been.</p>
      </div>
    </div>,
    // Group view
    <div key="group" style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.4, color: '#8a877e', fontFamily: 'var(--font-mono)', margin: '0 0 8px' }}>Sunday Circle · 4 members</p>
      <div style={{ background: '#15151a', border: '1px solid #1e1e22', borderRadius: '16px 16px 16px 4px', padding: '8px 12px' }}>
        <p style={{ fontSize: 9, color: '#8a877e', margin: '0 0 2px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Maya</p>
        <p style={{ fontSize: 13, color: '#ebe7dc', margin: 0 }}>Week 6. Still showing up.</p>
      </div>
    </div>,
  ];

  // Pager pill
  const pager = (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 12 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ height: 4, width: view === i ? 14 : 4, borderRadius: 2, background: view === i ? '#ffffff' : '#3a3a3e', transition: 'width 300ms ease, background 300ms ease' }} />
      ))}
    </div>
  );

  return (
    <div className="max-w-sm mx-auto">
      <p className="font-mono text-[10px] tracking-[2px] uppercase text-white/20 text-center mb-6">
        Share with close friends. See their days.
      </p>
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "#0d0d10", border: "1px solid #1E1E2E" }}
      >
        <div style={{ position: 'relative', minHeight: 180 }}>
          {views.map((v, i) => (
            <div key={i} style={{ position: i === 0 ? 'relative' : 'absolute', top: 0, left: 0, right: 0, opacity: view === i ? 1 : 0, transform: `translateY(${view === i ? 0 : 8}px)`, transition: 'opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 600ms cubic-bezier(0.16,1,0.3,1)', pointerEvents: view === i ? 'auto' : 'none' }}>
              {v}
            </div>
          ))}
        </div>
        {pager}
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
    <section className="px-6" style={{ paddingTop: 180, paddingBottom: 180 }}>
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
            className="flex gap-2 p-1 rounded-full"
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
                    color: isActive ? "#0a0a0a" : "#8a877e",
                    backgroundColor: isActive ? "#ffffff" : "transparent",
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
              transition={reduced ? { duration: 0 } : { duration: 0.4, ease: "easeInOut" }}
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

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface DemoSlide {
  id: string;
  label: string;
  title: string;
  description: string;
  accentDetail: string;
  mockup: React.ReactNode;
}

// --- Mockup Components ---

function WriteMockup() {
  return (
    <div className="space-y-4 px-2 w-full">
      <div className="flex items-start gap-3">
        <span className="text-[10px] text-white/20 font-mono mt-1 shrink-0">01</span>
        <div className="h-px flex-1 bg-white/10 mt-2.5" />
      </div>
      <div className="flex items-start gap-3">
        <span className="text-[10px] text-white/20 font-mono mt-1 shrink-0">02</span>
        <p className="text-xs text-white/30 leading-relaxed">
          &ldquo;Today I finally shipped the feature I&apos;ve been working on for weeks.&rdquo;
        </p>
      </div>
      <div className="flex items-start gap-3">
        <span className="text-[10px] text-white/20 font-mono mt-1 shrink-0">03</span>
        <p className="text-xs text-white/30 leading-relaxed">
          &ldquo;Small progress is still progress.&rdquo;
        </p>
      </div>
      <div className="flex justify-between pt-4 border-t border-white/5 mt-4">
        <span className="text-[10px] text-white/20">What&apos;s on your mind today?</span>
        <span className="text-sm font-mono text-white/50 tracking-wider">2/3</span>
      </div>
    </div>
  );
}

function ReflectMockup() {
  return (
    <div className="space-y-5 px-2 w-full">
      <div className="flex gap-2">
        {["7d", "30d", "90d"].map((range) => (
          range === "30d" ? (
            <span
              key={range}
              className="text-[10px] font-mono px-3 py-1 rounded-full bg-white/10 text-white/60"
            >
              {range}
            </span>
          ) : (
            <span
              key={range}
              className="text-[10px] font-mono px-3 py-1 rounded-full text-white/20 border border-white/5"
            >
              {range}
            </span>
          )
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-white/30" />
        </div>
        <span className="text-[10px] text-white/30 uppercase tracking-wider font-mono">Reflection</span>
      </div>
      <p className="text-xs text-white/25 leading-relaxed">
        &ldquo;Over the past 30 days, your entries show a pattern of steady growth.
        You&apos;ve been focused on shipping and learning to let go of perfectionism.&rdquo;
      </p>
      <p className="text-[10px] text-white/15 mt-3">Based on 28 entries</p>
    </div>
  );
}

function TrackMockup() {
  const dots = [
    [0, 1, 0, 1, 1, 0, 0],
    [1, 1, 1, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0],
  ];

  return (
    <div className="space-y-5 px-2 w-full">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-white/40 tracking-wider">FEB 2026</span>
        <div className="flex gap-3">
          <span className="text-[10px] text-white/15">‹</span>
          <span className="text-[10px] text-white/30">›</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="font-mono text-[8px] text-center w-5" style={{ color: "#3A3A5A" }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dots.map((week, wi) =>
          week.map((filled, di) => {
            const isFilled = filled === 1;
            const isStreak = isFilled && (wi + di) % 3 === 0;
            return (
              <div
                key={`${wi}-${di}`}
                className="w-5 h-5 rounded-full"
                style={{
                  backgroundColor: isStreak ? '#FFFFF0' : isFilled ? '#2A2A4A' : '#141420'
                }}
              />
            );
          })
        )}
      </div>
      <p className="text-[10px] text-white/20 font-mono tracking-wider">22 entries this month</p>
    </div>
  );
}

function ConnectMockup() {
  const friends = [
    { name: "Maya Chen", handle: "@mayac" },
    { name: "James K.", handle: "@jamesk" },
  ];

  return (
    <div className="space-y-4 px-2 w-full">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02]">
        <svg
          width={12}
          height={12}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          className="text-white/20"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-[10px] text-white/20">Search people...</span>
      </div>
      <div className="space-y-3">
        {friends.map((f) => (
          <div key={f.handle} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-[10px] text-white/30">{f.name[0]}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/50">{f.name}</p>
              <p className="text-[10px] text-white/20">{f.handle}</p>
            </div>
            <div className="px-2.5 py-1 rounded-full border border-white/10">
              <span className="text-[9px] text-white/30">Message</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-white/15 text-center mt-2">2 mutual friends</p>
    </div>
  );
}

function PhilosophyMockup() {
  const principles = [
    { num: "01", name: "Three Sentences", sub: "The Constraint" },
    { num: "02", name: "Iron Habits", sub: "The Grind" },
    { num: "03", name: "No Edits", sub: "The Truth" },
    { num: "04", name: "Go Ghost", sub: "The Focus" },
    { num: "05", name: "Execute", sub: "The Action" },
  ];

  return (
    <div className="space-y-3 px-2 w-full">
      {principles.map((p) => (
        <div key={p.num} className="flex items-baseline gap-4">
          <span className="text-[10px] text-white/15 font-mono shrink-0">{p.num}</span>
          <div>
            <p className="text-xs text-white/40">{p.name}</p>
            <p className="text-[10px] text-white/15">{p.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Slides Data ---

const SLIDES: DemoSlide[] = [
  {
    id: "write",
    label: "WRITE",
    title: "Three Sentences",
    description: "Write exactly three sentences. No more, no less. That’s the whole point.",
    accentDetail: "2/3",
    mockup: <WriteMockup />,
  },
  {
    id: "reflect",
    label: "REFLECT",
    title: "AI Reflections",
    description: "AI-powered insights from your journal entries over time.",
    accentDetail: "30 DAYS",
    mockup: <ReflectMockup />,
  },
  {
    id: "track",
    label: "TRACK",
    title: "Project 363",
    description: "363 days to better. Track your streak, own your journey.",
    accentDetail: "363",
    mockup: <TrackMockup />,
  },
  {
    id: "connect",
    label: "CONNECT",
    title: "Community",
    description: "Find your people. Stay accountable together.",
    accentDetail: "FRIENDS",
    mockup: <ConnectMockup />,
  },
  {
    id: "philosophy",
    label: "PHILOSOPHY",
    title: "The Five Principles",
    description: "The rules that make Three work.",
    accentDetail: "5 RULES",
    mockup: <PhilosophyMockup />,
  },
];

// --- Animation Config ---

const slideTransition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1] as const,
};

// --- Main Component ---

export function DemoSlides() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  const startCycle = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % SLIDES.length);
    }, 5000);
  }, []);

  useEffect(() => {
    if (isInView) {
      startCycle();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isInView, startCycle]);

  const handleDotClick = (i: number) => {
    setActiveIndex(i);
    startCycle();
  };

  const currentSlide = SLIDES[activeIndex];

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-14 sm:mb-16 text-center">
          <p className="text-xs text-white/30 tracking-[0.3em] uppercase mb-3">How it works</p>
          <h2 className="text-xl sm:text-2xl font-light text-white/80 tracking-tight">
            Simple by design
          </h2>
        </div>

        {/* Phone Frame */}
        <div className="mx-auto max-w-xs sm:max-w-sm">
          <div className="border border-white/[0.08] rounded-[2rem] p-5 sm:p-6 bg-white/[0.02]">
            {/* Top Bar */}
            <div className="flex justify-between mb-4 items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeIndex + "-label"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[10px] font-mono text-white/30 tracking-[0.2em] uppercase"
                >
                  {currentSlide.label}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeIndex + "-detail"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[10px] font-mono text-white/20"
                >
                  {currentSlide.accentDetail}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Slide Content */}
            <div className="min-h-[240px] sm:min-h-[280px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={slideTransition}
                  className="w-full"
                >
                  {currentSlide.mockup}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Below Frame */}
        <div className="text-center mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="text-base sm:text-lg font-medium text-white/90 mb-1.5">
                {currentSlide.title}
              </h3>
              <p className="text-sm text-white/35 max-w-xs mx-auto">
                {currentSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="mt-8 flex gap-1.5 justify-center">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === activeIndex
                  ? "w-6 bg-white/50"
                  : "w-1.5 bg-white/15 hover:bg-white/25"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
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
    <div className="space-y-4 px-2">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-[10px] text-white/20 font-mono mt-1 shrink-0">01</span>
          <div className="h-px flex-1 bg-white/10 mt-2.5" />
        </div>
        <div className="flex items-start gap-3">
          <span className="text-[10px] text-white/20 font-mono mt-1 shrink-0">02</span>
          <p className="text-xs text-white/30 leading-relaxed">
            Today I finally shipped the feature I&apos;ve been working on for weeks.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-[10px] text-white/20 font-mono mt-1 shrink-0">03</span>
          <p className="text-xs text-white/30 leading-relaxed">
            Small progress is still progress.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <span className="text-[10px] text-white/20">What&apos;s on your mind today?</span>
        <span className="text-sm font-mono text-white/50 tracking-wider">2/3</span>
      </div>
    </div>
  );
}

function ReflectMockup() {
  return (
    <div className="space-y-5 px-2">
      <div className="flex items-center justify-center gap-2">
        {["7d", "30d", "90d"].map((range) => (
          <span
            key={range}
            className={cn(
              "text-[10px] font-mono px-3 py-1 rounded-full transition-colors",
              range === "30d"
                ? "bg-white/10 text-white/60"
                : "text-white/20 border border-white/5"
            )}
          >
            {range}
          </span>
        ))}
      </div>
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/30" />
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-wider font-mono">Reflection</span>
        </div>
        <p className="text-xs text-white/25 leading-relaxed">
          Over the past 30 days, your entries show a pattern of steady growth.
          You&apos;ve been focused on shipping and learning to let go of perfectionism.
        </p>
        <p className="text-[10px] text-white/15 mt-3">Based on 28 entries</p>
      </div>
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
    <div className="space-y-5 px-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/30 font-mono tracking-wider">FEB 2026</span>
        <div className="flex gap-2">
          <span className="text-white/15 text-[10px]">&#8249;</span>
          <span className="text-white/30 text-[10px]">&#8250;</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex gap-3 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="text-[8px] text-white/15 w-5 text-center font-mono">{d}</span>
          ))}
        </div>
        {dots.map((week, wi) => (
          <div key={wi} className="flex gap-3">
            {week.map((filled, di) => (
              <div
                key={di}
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center",
                  filled ? "bg-white/10" : ""
                )}
              >
                {filled ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="text-center pt-2">
        <span className="text-[10px] text-white/20 font-mono tracking-wider">22 entries this month</span>
      </div>
    </div>
  );
}

function ConnectMockup() {
  const friends = [
    { name: "Maya Chen", handle: "@mayac" },
    { name: "James K.", handle: "@jamesk" },
  ];

  return (
    <div className="space-y-4 px-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02]">
        <svg className="w-3 h-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/50">{f.name}</p>
              <p className="text-[10px] text-white/20">{f.handle}</p>
            </div>
            <div className="px-2.5 py-1 rounded-full border border-white/10">
              <span className="text-[9px] text-white/30">Message</span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center pt-1">
        <span className="text-[10px] text-white/15">2 mutual friends</span>
      </div>
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
    <div className="space-y-3 px-2">
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
    description: "Write exactly three sentences. No more, no less. That\u2019s the whole point.",
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

const slideVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const slideTransition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1],
};

// --- Main Component ---

export function DemoSlides() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const hasEntered = useInView(sectionRef, { once: true, amount: 0.2 });

  useEffect(() => {
    if (!isInView) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isInView, activeIndex]);

  const currentSlide = SLIDES[activeIndex];

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={hasEntered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14 sm:mb-16"
        >
          <p className="text-xs text-white/30 tracking-[0.3em] uppercase mb-3">
            How it works
          </p>
          <h2 className="text-xl sm:text-2xl font-light text-white/80 tracking-tight">
            Simple by design
          </h2>
        </motion.div>

        {/* Slide Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={hasEntered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          {/* Phone Mockup Frame */}
          <div className="mx-auto max-w-xs sm:max-w-sm">
            <div className="border border-white/[0.08] rounded-[2rem] p-5 sm:p-6 bg-white/[0.02]">
              {/* Top Bar */}
              <div className="flex justify-between items-center mb-5 px-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSlide.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-mono"
                  >
                    {currentSlide.label}
                  </motion.span>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSlide.accentDetail}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[10px] text-white/20 font-mono"
                  >
                    {currentSlide.accentDetail}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Slide Content */}
              <div className="min-h-[240px] sm:min-h-[280px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide.id}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={slideTransition}
                    className="w-full"
                  >
                    {currentSlide.mockup}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Slide Info */}
          <div className="text-center mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id + "-info"}
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
          <div className="flex items-center justify-center gap-1.5 mt-8">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
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
        </motion.div>
      </div>
    </section>
  );
}

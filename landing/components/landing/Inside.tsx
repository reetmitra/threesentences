"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal } from "./Reveal";
import { Tilt } from "./Tilt";
import { PhoneSocialPreview, PhoneTodayPreview } from "./appScreens";
import { PhoneCheckinPreview, PhonePatternsPreview } from "./previews";

/** A real fragment of the app: its own faces, its own borders. */
function AppScreen({ children, label, height }: { children: ReactNode; label: string; height: number }) {
  return (
    <div className="app-screen" data-ui role="img" aria-label={label} style={{ height }}>
      {children}
    </div>
  );
}

const STEPS: { tab: string; title: string; body: string; label: string; h: number; screen: () => ReactNode }[] = [
  {
    tab: "Today",
    title: "Write in a quiet room.",
    body: "A blinking cursor, today's date, and the rule of three. The counter watches without judging. Submit only becomes available at exactly three.",
    label: "The Today screen with two of three sentences written",
    h: 580,
    screen: () => <PhoneTodayPreview />,
  },
  {
    tab: "Check-in",
    title: "Ten more seconds.",
    body: "After your three sentences: how was today, in one word, and up to three habits you are working on, yes or no. Skip any of it. Only you ever see it.",
    label: "The nightly check-in: one word for the day and three habits",
    h: 600,
    screen: () => <PhoneCheckinPreview />,
  },
  {
    tab: "Patterns",
    title: "See the month you had.",
    body: "The calendar fills as you write, and a ring marks the days you kept all your habits. Mood as a quiet line, habits as a grid, over 7, 30 or 90 days. Tap any day to reread it.",
    label: "The Patterns screen: a month calendar, mood line and habit grid",
    h: 700,
    screen: () => <PhonePatternsPreview />,
  },
  {
    tab: "The Circle",
    title: "Small by design.",
    body: "Up to eight close friends. Private messages. No feeds, no likes, no following. Just people you trust with your practice.",
    label: "The Circle: a short list of close friends and a private chat",
    h: 640,
    screen: () => <PhoneSocialPreview />,
  },
];

export function Inside() {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLElement | null)[]>([]);
  const plate = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    steps.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Scale the drawn screen to fill the plate (up to 1.2x, down to 0.7x on short windows).
  useEffect(() => {
    const el = plate.current;
    if (!el) return;
    const fit = () => el.style.setProperty("--s", String(Math.min(1.2, Math.max(0.7, (el.clientHeight - 48) / STEPS[active].h))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  const go = (i: number) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    steps.current[i]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  return (
    <section id="inside" data-stop="inside" className="inside">
      <div className="inside-head">
        <Reveal as="h2">A quiet shape for a loud year.</Reveal>
        <Reveal as="p" i={1} className="lead">
          Four screens, shown here as they are in the app.
        </Reveal>
      </div>
      <div className="inside-grid">
        <div className="plate" aria-hidden="true" ref={plate}>
          <div className="plate-screen" key={active}>
            <Tilt max={6}>
              <AppScreen label={STEPS[active].label} height={STEPS[active].h}>{STEPS[active].screen()}</AppScreen>
            </Tilt>
          </div>
        </div>
        <div className="steps">
          <div className="tabs" role="group" aria-label="Screens">
            {STEPS.map((s, i) => (
              <button type="button" key={s.tab} aria-current={active === i} onClick={() => go(i)}>
                {s.tab}
              </button>
            ))}
          </div>
          {STEPS.map((s, i) => (
            <article
              className="step"
              key={s.tab}
              data-step={i}
              ref={(el) => {
                steps.current[i] = el;
              }}
            >
              <div className="step-screen">
                <AppScreen label={s.label} height={s.h}>{s.screen()}</AppScreen>
              </div>
              <h3>{s.title}</h3>
              <p className="text">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

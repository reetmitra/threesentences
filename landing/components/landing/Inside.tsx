"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal } from "./Reveal";
import { Tilt } from "./Tilt";
import { PhoneSocialPreview, PhoneTodayPreview } from "./appScreens";
import { PhoneCheckinPreview, PhonePatternsPreview } from "./previews";

/** A real fragment of the app: its own faces, its own borders. */
function AppScreen({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="app-screen" data-ui role="img" aria-label={label}>
      {children}
    </div>
  );
}

const STEPS: { tab: string; title: string; body: string; label: string; screen: () => ReactNode }[] = [
  {
    tab: "Today",
    title: "Write in a quiet room.",
    body: "A blinking cursor, today's date, and the rule of three. The counter watches without judging. Submit only becomes available at exactly three.",
    label: "The Today screen with two of three sentences written",
    screen: () => <PhoneTodayPreview />,
  },
  {
    tab: "Check-in",
    title: "Ten more seconds.",
    body: "After your three sentences: how was today, in one word, and up to three habits you are working on, yes or no. Skip any of it. Only you ever see it.",
    label: "The nightly check-in: one word for the day and three habits",
    screen: () => <PhoneCheckinPreview />,
  },
  {
    tab: "Patterns",
    title: "See the month you had.",
    body: "The calendar fills as you write, and a ring marks the days you kept all your habits. Mood as a quiet line, habits as a grid, over 7, 30 or 90 days. Tap any day to reread it.",
    label: "The Patterns screen: a month calendar, mood line and habit grid",
    screen: () => <PhonePatternsPreview />,
  },
  {
    tab: "The Circle",
    title: "Small by design.",
    body: "Up to eight close friends. Private messages. No feeds, no likes, no following. Just people you trust with your practice.",
    label: "The Circle: a short list of close friends and a private chat",
    screen: () => <PhoneSocialPreview />,
  },
];

export function Inside() {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLElement | null)[]>([]);

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
        <div className="plate" aria-hidden="true">
          <div className="plate-screen" key={active}>
            <Tilt max={6}>
              <AppScreen label={STEPS[active].label}>{STEPS[active].screen()}</AppScreen>
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
                <AppScreen label={s.label}>{s.screen()}</AppScreen>
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

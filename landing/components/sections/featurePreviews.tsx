"use client";

/* Phone previews for the nightly check-in and the Patterns tab, drawn from
   the app's real screens. Sample data is deterministic so the page renders
   the same on the server and in the browser. */

import { useState } from "react";
import {
  LP_INK,
  LP_INK_BRIGHT,
  LP_INK_DIM,
  LP_INK_FADE,
  LP_SURFACE,
  LP_SANS,
  LP_SERIF,
  LP_MONO,
} from "@/components/lp";

const MOODS = ["rough", "low", "okay", "good", "great"] as const;
const HABITS = ["In bed by 1am", "Moved 20 min", "No phone in bed"];

const label: React.CSSProperties = {
  fontFamily: LP_MONO,
  fontSize: 10,
  color: LP_INK_DIM,
  letterSpacing: 1.8,
  textTransform: "uppercase",
};

function Title({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: LP_SERIF, fontStyle: "italic", fontSize: 30, color: LP_INK, letterSpacing: -0.5, lineHeight: 1 }}>
      {children}
    </div>
  );
}

/* ─── Check-in ────────────────────────────────────────────────────────── */

export function PhoneCheckinPreview() {
  const [mood, setMood] = useState(3); // good
  const [answers, setAnswers] = useState<(boolean | null)[]>([true, true, false]);

  const answer = (i: number, v: boolean) =>
    setAnswers((a) => a.map((x, j) => (j === i ? (x === v ? null : v) : x)));

  return (
    <div style={{ flex: 1, padding: "10px 20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={label}>Wed · Nov 18</div>
        <Title>Done.</Title>
      </div>

      <div style={{ background: LP_SURFACE, borderRadius: 14, padding: "14px 16px", borderLeft: `2px solid ${LP_INK}` }}>
        <div style={{ fontFamily: LP_SERIF, fontSize: 14.5, lineHeight: 1.55, color: LP_INK }}>
          Walked to the park this morning. The light was soft and gold. I felt calm for once.
        </div>
      </div>
      <div style={{ ...label, fontSize: 9, textAlign: "center" }}>Locks at 4am · edit until then</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
        <div style={label}>How was today</div>
        <div style={{ display: "flex", gap: 5 }} role="radiogroup" aria-label="Mood">
          {MOODS.map((m, i) => (
            <button
              key={m}
              role="radio"
              aria-checked={mood === i}
              onClick={() => setMood(i)}
              style={{
                flex: 1,
                height: 34,
                borderRadius: 999,
                border: "none",
                background: mood === i ? LP_INK_BRIGHT : LP_SURFACE,
                color: mood === i ? "#0a0a0a" : LP_INK_DIM,
                fontFamily: LP_SANS,
                fontSize: 12,
                cursor: "pointer",
                transition: "background 160ms ease, color 160ms ease",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
        <div style={label}>Your three</div>
        {HABITS.map((h, i) => (
          <div key={h} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, fontFamily: LP_SANS, fontSize: 14, color: LP_INK }}>{h}</div>
            {([true, false] as const).map((v) => {
              const on = answers[i] === v;
              return (
                <button
                  key={String(v)}
                  aria-pressed={on}
                  aria-label={`${h}, ${v ? "done" : "not done"}`}
                  onClick={() => answer(i, v)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    border: "none",
                    background: on ? LP_INK_BRIGHT : LP_SURFACE,
                    color: on ? "#0a0a0a" : LP_INK_DIM,
                    fontSize: 15,
                    lineHeight: 1,
                    cursor: "pointer",
                    transition: "background 160ms ease",
                  }}
                >
                  {v ? "✓" : "–"}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Patterns ────────────────────────────────────────────────────────── */

type Range = 7 | 30 | 90;

// 90 days ending today (Nov 18). mood 1–5 or 0 = not logged; habits: 1 done, 0 not done, -1 unanswered.
const DAYS = Array.from({ length: 90 }, (_, i) => {
  const wave = [3, 3, 4, 2, 3, 4, 4, 5, 3, 2, 3, 4, 4, 3, 1, 3, 4, 4, 5, 4];
  const mood = i % 11 === 6 ? 0 : wave[(i * 7) % wave.length];
  const habit = (k: number) => ((i + k) % 9 === 4 ? -1 : (i * (k + 3)) % 5 === 0 ? 0 : 1);
  return { mood, habits: [habit(0), habit(1), habit(2)] };
});

// November 2026 starts on a Sunday; today is the 18th.
const ENTRY_DAYS = new Set([1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18]);
const FULL_DAYS = new Set([2, 6, 9, 13, 16, 18]);

function MoodLine({ days }: { days: typeof DAYS }) {
  const w = 300;
  const h = 64;
  const step = w / days.length;
  const pts = days.map((d, i) => ({ x: step * i + step / 2, y: d.mood ? h - 6 - ((d.mood - 1) / 4) * (h - 12) : null }));
  const r = Math.min(2.6, step / 2);
  const segs: string[] = [];
  pts.forEach((p, i) => {
    const q = pts[i + 1];
    if (p.y !== null && q && q.y !== null) segs.push(`M${p.x},${p.y}L${q.x},${q.y}`);
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden="true">
      <path d={segs.join("")} stroke={LP_INK_DIM} strokeWidth={1.2} fill="none" />
      {pts.map((p, i) => (p.y === null ? null : <circle key={i} cx={p.x} cy={p.y} r={r} fill={LP_INK_BRIGHT} />))}
    </svg>
  );
}

export function PhonePatternsPreview() {
  const [range, setRange] = useState<Range>(30);
  const days = DAYS.slice(90 - range);

  return (
    <div style={{ flex: 1, padding: "10px 20px 16px", display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
      <Title>Patterns</Title>
      <div style={{ display: "flex", gap: 6 }} role="radiogroup" aria-label="Range">
        {([7, 30, 90] as const).map((r) => (
          <button
            key={r}
            role="radio"
            aria-checked={range === r}
            aria-label={`${r} days`}
            onClick={() => setRange(r)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              border: "none",
              background: range === r ? LP_INK_BRIGHT : LP_SURFACE,
              color: range === r ? "#0a0a0a" : LP_INK_DIM,
              fontFamily: LP_MONO,
              fontSize: 12,
              cursor: "pointer",
              transition: "background 160ms ease",
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div style={{ background: LP_SURFACE, borderRadius: 14, padding: "10px 10px 8px" }}>
        <div style={{ ...label, textAlign: "center", marginBottom: 6, color: LP_INK }}>November 2026</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
            const today = d === 18;
            const future = d > 18;
            return (
              <div key={d} style={{ height: 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {FULL_DAYS.has(d) && (
                  <span style={{ position: "absolute", width: 22, height: 22, borderRadius: 999, border: `1px solid ${LP_INK_DIM}` }} />
                )}
                <span
                  style={{
                    fontFamily: LP_SANS,
                    fontSize: 11,
                    color: future ? LP_INK_FADE : today ? LP_INK_BRIGHT : LP_INK_DIM,
                    fontWeight: today ? 600 : 400,
                  }}
                >
                  {d}
                </span>
                <span style={{ width: 3, height: 3, borderRadius: 999, background: ENTRY_DAYS.has(d) ? LP_INK : "transparent" }} />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={label}>Mood</div>
        <MoodLine days={days} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={label}>Habits</div>
        {HABITS.map((h, k) => {
          const answered = days.filter((d) => d.habits[k] !== -1);
          const done = answered.filter((d) => d.habits[k] === 1).length;
          return (
            <div key={h} aria-label={`${h}: ${done} of ${answered.length} days`}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: LP_SANS, fontSize: 12, color: LP_INK, marginBottom: 4 }}>
                <span>{h}</span>
                <span style={{ fontFamily: LP_MONO, fontSize: 10, color: LP_INK_DIM }}>
                  {done}/{answered.length}
                </span>
              </div>
              <div style={{ display: "flex", gap: range === 90 ? 1 : 2, height: 12, overflow: "hidden" }}>
                {days.map((d, i) => (
                  <span
                    key={i}
                    style={{
                      flex: 1,
                      borderRadius: 2,
                      background: d.habits[k] === 1 ? LP_INK_BRIGHT : "transparent",
                      boxShadow: d.habits[k] === 0 ? `inset 0 0 0 1px ${LP_INK_DIM}` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

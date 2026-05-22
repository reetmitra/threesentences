"use client";

import React, { useState } from "react";
import {
  LP_INK,
  LP_INK_BRIGHT,
  LP_INK_DIM,
  LP_PAPER,
  LP_SURFACE,
  LP_FRAME,
  LP_SERIF,
  LP_MONO,
  Reveal,
  Eyebrow,
  H2,
  Lead,
  P,
} from "@/components/lp";

const reads: Record<string, { theme: string; obs: string; q: string }> = {
  "7d": {
    theme: "Letting go, on your own terms.",
    obs: "Across seven entries you returned twice to a kettle and once to a sunrise. Three quiet moments where you stopped before reaching for your phone. Each was a small refusal — small, but a refusal.",
    q: "What did the kettle give you that the inbox could not?",
  },
  "30d": {
    theme: "A month of returning to slowness.",
    obs: "You wrote about walking eleven times. The word \"quiet\" appears seven times across thirty entries. Most of your best days began with you closing the laptop first.",
    q: "When was the last time silence felt like a friend?",
  },
  "90d": {
    theme: "Building a quieter shape to your days.",
    obs: "Over three months the meetings have receded and the walks have grown. Something is forming that you have not named yet.",
    q: "If you had to name it, what would you call it?",
  },
};

export function AIReflectionSection() {
  const [range, setRange] = useState("7d");
  const r = reads[range];

  return (
    <section style={{ background: LP_PAPER, padding: "180px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 64px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "center",
          }}
        >
          <Reveal>
            <Eyebrow>Optional · always opt-in</Eyebrow>
            <div style={{ height: 28 }} />
            <H2>
              AI that finds patterns
              <br />
              without rewriting you.
            </H2>
            <div style={{ height: 28 }} />
            <Lead style={{ maxWidth: 440 }}>
              Once a week, an optional AI reads across your entries and surfaces
              a theme, an observation, and a single question to sit with. Your
              words aren&apos;t changed — they&apos;re listened to.
            </Lead>
            <div style={{ height: 32 }} />
            <div style={{ display: "flex", gap: 8 }}>
              {(
                [
                  ["7d", "7 days"],
                  ["30d", "30 days"],
                  ["90d", "90 days"],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: `1px solid ${range === k ? LP_INK : LP_FRAME}`,
                    background: range === k ? LP_INK : "transparent",
                    color: range === k ? "#0a0a0a" : LP_INK_DIM,
                    fontFamily: LP_MONO,
                    fontSize: 11,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 180ms ease",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  padding: "20px 22px",
                  background: LP_SURFACE,
                  borderRadius: 14,
                  border: `1px solid ${LP_FRAME}`,
                }}
              >
                <Eyebrow style={{ marginBottom: 10 }}>Theme</Eyebrow>
                <div
                  style={{
                    fontFamily: LP_SERIF,
                    fontStyle: "italic",
                    fontSize: 24,
                    color: LP_INK,
                    letterSpacing: -0.4,
                    lineHeight: 1.2,
                  }}
                >
                  {r.theme}
                </div>
              </div>
              <div
                style={{
                  padding: "20px 22px",
                  background: LP_SURFACE,
                  borderRadius: 14,
                  border: `1px solid ${LP_FRAME}`,
                }}
              >
                <Eyebrow style={{ marginBottom: 10 }}>Observation</Eyebrow>
                <P>{r.obs}</P>
              </div>
              <div
                style={{
                  padding: "22px 22px",
                  background: LP_SURFACE,
                  borderRadius: 14,
                  borderLeft: `2px solid ${LP_INK_BRIGHT}`,
                }}
              >
                <Eyebrow color={LP_INK_BRIGHT} style={{ marginBottom: 10 }}>
                  A question to sit with
                </Eyebrow>
                <div
                  style={{
                    fontFamily: LP_SERIF,
                    fontStyle: "italic",
                    fontSize: 20,
                    color: LP_INK,
                    lineHeight: 1.4,
                  }}
                >
                  {r.q}
                </div>
              </div>
              <P style={{ textAlign: "center", fontSize: 11, letterSpacing: 0.5 }}>
                AI patterns may be wrong. Use with care. Crisis resources always
                available.
              </P>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

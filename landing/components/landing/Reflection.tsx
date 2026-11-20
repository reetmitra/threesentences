"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { Tilt } from "./Tilt";

const READINGS = [
  {
    days: 7,
    theme: "Letting go, on your own terms.",
    observation:
      "Across seven entries you returned twice to a kettle and once to a sunrise. Three quiet moments where you stopped before reaching for your phone. Each was a small refusal. Small, but a refusal.",
    question: "What did the kettle give you that the inbox could not?",
  },
  {
    days: 30,
    theme: "A month of returning to slowness.",
    observation:
      "You wrote about walking eleven times. The word “quiet” appears seven times across thirty entries. Most of your best days began with you closing the laptop first.",
    question: "When was the last time silence felt like a friend?",
  },
  {
    days: 90,
    theme: "Building a quieter shape to your days.",
    observation:
      "Over three months the meetings have receded and the walks have grown. Something is forming that you have not named yet.",
    question: "If you had to name it, what would you call it?",
  },
] as const;

export function Reflection() {
  const [i, setI] = useState(0);
  const [swap, setSwap] = useState(0);
  const r = READINGS[i];

  return (
    <section id="reflection" data-stop="reflection" className="section">
      <div className="split">
        <div className="col-a">
          <Reveal as="h2">Listened to, never rewritten.</Reveal>
          <Reveal as="p" i={1} className="lead">
            Once a week, an optional AI reads across your entries and surfaces a theme, an observation, and a single
            question to sit with.
          </Reveal>
          <Reveal as="p" i={2} className="text soft">
            Your words aren&apos;t changed; they&apos;re listened to. It&apos;s off until you turn it on, and you can
            turn it off at any time.
          </Reveal>
        </div>
        <Reveal i={1} className="col-b">
          <Tilt>
            <div className="slip">
              <div className="seg" role="group" aria-label="Reflection range">
                {READINGS.map((x, n) => (
                  <button
                    type="button"
                    key={x.days}
                    aria-pressed={i === n}
                    onClick={() => {
                      setI(n);
                      setSwap((s) => s + 1);
                    }}
                  >
                    {x.days} days
                  </button>
                ))}
              </div>
              <div className="reading" data-swap={swap > 0} key={swap}>
                <h3>{r.theme}</h3>
                <p>{r.observation}</p>
                <p className="question">
                  <strong>A question to sit with:</strong> {r.question}
                </p>
              </div>
              <p className="small soft" style={{ marginTop: 28 }}>
                AI patterns may be wrong. Use with care. Crisis resources always available.
              </p>
            </div>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}

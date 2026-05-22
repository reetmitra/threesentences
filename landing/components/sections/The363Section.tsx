"use client";

import React, { useState, useEffect } from "react";
import {
  LP_INK,
  LP_INK_DIM,
  LP_PAPER,
  LP_SERIF,
  useInView,
  Eyebrow,
  H2,
  Lead,
} from "@/components/lp";

export function The363Section() {
  const [ref, inView] = useInView({ threshold: 0.2 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = 363;
    const step = () => {
      start += 3;
      if (start <= end) {
        setCount(start);
        requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    setTimeout(() => requestAnimationFrame(step), 200);
  }, [inView]);

  return (
    <section style={{ background: LP_PAPER, padding: "200px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 64px" }}>
        <div ref={ref} style={{ textAlign: "center", position: "relative" }}>
          {/* Giant watermark */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: LP_SERIF,
              fontStyle: "italic",
              fontSize: "clamp(220px, 32vw, 520px)",
              color: LP_INK,
              opacity: 0.03,
              letterSpacing: -12,
              pointerEvents: "none",
              lineHeight: 0.9,
            }}
          >
            363
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <Eyebrow>Not 365.</Eyebrow>
            <div style={{ height: 32 }} />
            <div
              style={{
                fontFamily: LP_SERIF,
                fontStyle: "italic",
                fontSize: "clamp(100px, 18vw, 280px)",
                letterSpacing: -8,
                lineHeight: 0.95,
                color: LP_INK,
              }}
            >
              {String(count).padStart(3, "0")}
            </div>
            <div style={{ height: 40 }} />
            <div
              style={{
                display: "flex",
                gap: 0,
                justifyContent: "center",
                alignItems: "flex-start",
                maxWidth: 800,
                margin: "0 auto",
              }}
            >
              <H2 style={{ color: LP_INK_DIM, fontSize: "clamp(28px, 3.5vw, 48px)" }}>
                You cannot be perfect.&nbsp;
              </H2>
              <H2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}>
                But you can be relentless.
              </H2>
            </div>
            <div style={{ height: 48 }} />
            <Lead
              style={{
                margin: "0 auto",
                color: LP_INK_DIM,
                textAlign: "center",
                maxWidth: 560,
              }}
            >
              Two days of grace, built in. Miss a day, return without shame.
              Empty days are not failures — they are days.
            </Lead>
          </div>
        </div>
      </div>
    </section>
  );
}

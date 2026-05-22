"use client";

import React from "react";
import {
  LP_PAPER_2,
  LP_FRAME,
  Reveal,
  Eyebrow,
  H2,
  H3,
  P,
} from "@/components/lp";

const principles = [
  {
    n: "01",
    title: "Permanence.",
    body: "Once submitted, your words cannot be changed. Not ever. No \"just a quick edit.\" The impermanence of memory is what makes the permanence of writing matter.",
  },
  {
    n: "02",
    title: "Privacy.",
    body: "Your journal belongs to you. End-to-end encrypted. No ads, no data selling, no scraping your entries to train anything. What you write, stays yours.",
  },
  {
    n: "03",
    title: "Presence.",
    body: "Three sentences forces you to choose. What actually happened today? Not the curated version — the real one. That practice, done daily, changes you.",
  },
  {
    n: "04",
    title: "People.",
    body: "An optional small circle of people you actually know. No public profiles. No strangers liking your entries. A safe audience, by invitation only.",
  },
];

export function PrinciplesSection() {
  return (
    <section style={{ background: LP_PAPER_2, padding: "180px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 64px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <Eyebrow>What we believe</Eyebrow>
            <div style={{ height: 28 }} />
            <H2>Four things we will not compromise.</H2>
          </div>
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
          }}
        >
          {principles.map((p, i) => (
            <Reveal key={p.n} delay={i * 80}>
              <div
                style={{
                  padding: "56px 52px",
                  border: `1px solid ${LP_FRAME}`,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.012)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Eyebrow>{p.n}</Eyebrow>
                <div style={{ height: 24 }} />
                <H3 style={{ fontSize: 36 }}>{p.title}</H3>
                <div style={{ height: 20 }} />
                <P style={{ lineHeight: 1.65 }}>{p.body}</P>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

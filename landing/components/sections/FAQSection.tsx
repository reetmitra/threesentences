"use client";

import { useState } from "react";
import {
  LP_INK,
  LP_INK_DIM,
  LP_FRAME,
  LP_SERIF,
  Reveal,
  Eyebrow,
  H2,
  Lead,
} from "@/components/lp";

const items = [
  {
    q: 'Why exactly three sentences?',
    a: "Three is the sweet spot between too little and too much. One sentence feels like a tweet. Five starts to feel like homework. Three forces you to choose what actually mattered — and it's short enough that you'll do it even on your worst days.",
  },
  {
    q: "Why can't I edit my entries?",
    a: 'Because the words you write in the moment are true in a way that edited words are not. The slight roughness of an unedited entry is the point. Three Sentences is a record of who you were, not who you wish you had been.',
  },
  {
    q: 'What does "363/365" mean?',
    a: "Two days of grace, built in. We don't track streaks as shame — we track them as a record of relentlessness. Miss a day. Miss two. Return on the third and keep going. Empty days are not failures.",
  },
  {
    q: 'What is "The Circle"?',
    a: 'An optional feature — up to eight people you trust with your practice. No feeds, no public profiles, no follower counts. Just encrypted messages between people who actually know each other.',
  },
  {
    q: 'Is the AI reflection safe?',
    a: 'The AI reflection is off by default. You opt in, and you can opt out at any time. It reads across your entries to find themes and patterns — it never rewrites your words, never shares them, and never uses them to train anything.',
  },
  {
    q: 'When does it launch?',
    a: "Q4 2026, iOS first. We're opening access in small waves. Request access from the waitlist and we'll send you in when there's room. The waitlist is not a marketing gimmick — we genuinely want to keep the first cohort small.",
  },
  {
    q: 'How is my journal protected?',
    a: "End-to-end encrypted. Your entries are yours — not ours. We cannot read them, we cannot sell them, and we will not. The business model is a simple subscription, not your data.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" style={{ background: '#060608', padding: '160px 0' }}>
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 64px' }}>
        <Reveal>
          <div style={{ marginBottom: 72 }}>
            <Eyebrow>Frequently asked</Eyebrow>
            <div style={{ height: 28 }} />
            <H2>Questions people ask<br />before they start.</H2>
          </div>
        </Reveal>
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 40}>
            <div style={{ borderTop: `1px solid ${LP_FRAME}` }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '28px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 24,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  fontFamily: LP_SERIF,
                  fontStyle: 'italic',
                  fontSize: 22,
                  color: LP_INK,
                  letterSpacing: -0.3,
                  lineHeight: 1.2,
                }}>{item.q}</div>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: `1px solid ${LP_FRAME}`,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: LP_INK_DIM,
                  fontSize: 20,
                  lineHeight: 1,
                  transform: open === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform 220ms ease',
                }}>+</div>
              </button>
              <div style={{
                overflow: 'hidden',
                maxHeight: open === i ? 300 : 0,
                transition: 'max-height 300ms cubic-bezier(0.16,1,0.3,1)',
              }}>
                <div style={{ paddingBottom: 32 }}>
                  <Lead style={{ fontSize: 16, lineHeight: 1.65, maxWidth: '100%' }}>{item.a}</Lead>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
        <div style={{ borderTop: `1px solid ${LP_FRAME}` }} />
      </div>
    </section>
  );
}

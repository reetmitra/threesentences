"use client";

import {
  Reveal,
  Eyebrow,
  H2,
  H3,
  P,
  LP_INK,
  LP_INK_DIM,
  LP_PAPER,
  LP_FRAME,
  LP_MONO,
  LP_SERIF,
} from "@/components/lp";

const steps = [
  { n: '01', title: 'Open the app.', body: 'Just you, the date, and a quiet writing surface. No streak nags, no scrolling feed.' },
  { n: '02', title: 'Write three sentences.', body: 'The counter watches as you go. Submit unlocks the moment you reach exactly three.' },
  { n: '03', title: 'Close it. Return tomorrow.', body: 'Your work is done before nine. Watch the calendar quietly fill, day by day.' },
];

export function HowSection() {
  return (
    <section style={{ background: LP_PAPER, padding: '180px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 64px' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 100 }}>
            <Eyebrow>The daily loop</Eyebrow>
            <div style={{ height: 28 }} />
            <H2>One minute. Every&nbsp;day.</H2>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 150}>
              <div style={{
                padding: '40px 36px',
                border: `1px solid ${LP_FRAME}`,
                borderRadius: 20, height: '100%',
                background: 'rgba(255,255,255,0.012)',
                display: 'flex', flexDirection: 'column', gap: 18,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  fontFamily: LP_MONO, fontSize: 14, color: LP_INK_DIM,
                  letterSpacing: 2.4, textTransform: 'uppercase', fontWeight: 500,
                }}>Step {s.n}</div>
                <div style={{
                  fontFamily: LP_SERIF, fontStyle: 'italic', fontSize: 110,
                  color: LP_INK, letterSpacing: -3, lineHeight: 0.9,
                  opacity: 0.85,
                }}>{s.n}</div>
                <H3 style={{ fontSize: 26, marginTop: 8 }}>{s.title}</H3>
                <P style={{ color: LP_INK_DIM }}>{s.body}</P>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

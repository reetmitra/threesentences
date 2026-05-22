"use client";

import {
  LP_INK,
  LP_INK_DIM,
  LP_FRAME,
  LP_SERIF,
  Reveal,
  Eyebrow,
  H2,
  P,
  Hairline,
} from "@/components/lp";

const quotes = [
  {
    text: 'Three sentences made me realize I was writing about the same problem for six straight weeks. I had not noticed until I saw it in a grid.',
    who: 'Early beta tester, London',
  },
  {
    text: 'I have tried every journaling app. This is the only one I still use. The constraint removes all the friction.',
    who: 'Designer, New York',
  },
  {
    text: "The permanence is uncomfortable at first. Then it becomes the point. You can't hide from what you actually wrote.",
    who: 'Founder, Singapore',
  },
];

export function TrustSection() {
  return (
    <section style={{ background: '#0e0e10', padding: '160px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 64px' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <Eyebrow>From the beta</Eyebrow>
            <div style={{ height: 24 }} />
            <H2>What people say<br />after a hundred days.</H2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {quotes.map((q, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{
                padding: '40px 36px',
                borderRadius: 20,
                border: `1px solid ${LP_FRAME}`,
                background: 'rgba(255,255,255,0.012)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                height: '100%',
              }}>
                <div style={{
                  fontFamily: LP_SERIF,
                  fontStyle: 'italic',
                  fontSize: 'clamp(60px,8vw,80px)',
                  color: LP_INK,
                  opacity: 0.12,
                  lineHeight: 0.6,
                  letterSpacing: -2,
                }}>&ldquo;</div>
                <div style={{
                  fontFamily: LP_SERIF,
                  fontStyle: 'italic',
                  fontSize: 20,
                  color: LP_INK,
                  lineHeight: 1.55,
                  marginTop: -32,
                }}>
                  {q.text}
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <Hairline width="32px" style={{ margin: '0 0 14px' }} />
                  <P style={{ fontSize: 12, letterSpacing: 0.3 }}>{q.who}</P>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

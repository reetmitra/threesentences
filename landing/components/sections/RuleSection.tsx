"use client";

import React, { useEffect, useState } from "react";
import {
  LP_INK,
  LP_INK_BRIGHT,
  LP_INK_DIM,
  LP_INK_FADE,
  LP_SURFACE,
  LP_FRAME,
  LP_SANS,
  LP_SERIF,
  LP_MONO,
  Reveal,
  Eyebrow,
  H1,
  Lead,
  MiniDots,
  MiniPhone,
  useInView,
} from "@/components/lp";

function PhoneWritingDemo() {
  const SCRIPT = [
    'The rain stopped just after lunch.',
    'I walked the long way to the post office.',
    'A small kindness from a stranger.',
  ];
  const [text, setText] = useState('');
  const [filled, setFilled] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [ref, inView] = useInView({ threshold: 0.3 });

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const full = SCRIPT.join(' ');
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      if (i <= full.length) {
        setText(full.slice(0, i));
        const completed = SCRIPT.reduce((acc, s, idx) => {
          const upto = SCRIPT.slice(0, idx + 1).join(' ').length;
          return i >= upto ? acc + 1 : acc;
        }, 0);
        setFilled(completed);
        i += 1;
        setTimeout(tick, 38 + Math.random() * 30);
      } else {
        setTimeout(() => { if (!cancelled) setSubmitted(true); }, 600);
      }
    };
    setTimeout(tick, 400);
    return () => { cancelled = true; };
  }, [inView]);

  return (
    <div ref={ref} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 22px 14px' }}>
        <div style={{ fontFamily: LP_MONO, fontSize: 11, color: LP_INK_DIM, letterSpacing: 1.8, textTransform: 'uppercase' }}>Tue · Jun 18</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <div style={{ fontFamily: LP_SERIF, fontStyle: 'italic', fontSize: 36, color: LP_INK, letterSpacing: -0.8 }}>{submitted ? 'Done.' : 'Today'}</div>
          <div style={{ padding: '5px 12px', border: `1.5px solid ${submitted ? LP_INK_BRIGHT : LP_FRAME}`, borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6, fontFamily: LP_MONO, fontSize: 12, color: submitted ? LP_INK_BRIGHT : LP_INK }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 2c0 3 3 3.5 3 6.5a3 3 0 0 1-6 0c0-1.5 1-2.5 1.5-3 0 2 1.5 2.5 1.5 2.5C8.75 6 7.5 4.5 8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
            <span>13</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
        <div style={{
          padding: '14px 16px', borderLeft: `2px solid ${LP_INK_FADE}`,
          fontFamily: LP_SERIF, fontStyle: 'italic', fontSize: 14, color: LP_INK_DIM, lineHeight: 1.4,
        }}>
          "What did you notice today that you usually don't?"
        </div>

        {submitted ? (
          <div style={{
            padding: '16px 16px', background: LP_SURFACE, borderRadius: 12,
            borderLeft: `2px solid ${LP_INK_BRIGHT}`,
            fontFamily: LP_SERIF, fontSize: 16, lineHeight: 1.6, color: LP_INK,
          }}>{text}</div>
        ) : (
          <div style={{
            flex: 1, fontFamily: LP_SERIF, fontSize: 16, lineHeight: 1.6, color: LP_INK,
            minHeight: 200,
          }}>
            {text}
            <span style={{
              display: 'inline-block', width: 2, height: 18,
              background: LP_INK_BRIGHT, verticalAlign: 'text-bottom', marginLeft: 2,
              animation: 'lp-cursor 900ms steps(2) infinite',
            }} />
          </div>
        )}

        <div style={{ flex: submitted ? 1 : 0 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${LP_FRAME}` }}>
          <MiniDots filled={Math.min(filled, 3)} size={8} />
          <div style={{ fontFamily: LP_MONO, fontSize: 10, color: submitted ? LP_INK_BRIGHT : (filled === 3 ? LP_INK_BRIGHT : LP_INK_DIM), letterSpacing: 1.6, textTransform: 'uppercase' }}>
            {submitted ? '✓ Locked' : `${filled} / 3 · ${filled === 3 ? 'ready' : `${3 - filled} more`}`}
          </div>
        </div>

        <div style={{
          height: 44, borderRadius: 999,
          border: submitted ? `1.5px solid ${LP_INK_BRIGHT}` : (filled === 3 ? `1.5px solid ${LP_INK_BRIGHT}` : `1.5px solid ${LP_INK_FADE}`),
          background: submitted ? LP_INK_BRIGHT : (filled === 3 ? LP_INK_BRIGHT : 'transparent'),
          color: submitted ? '#0a0a0a' : (filled === 3 ? '#0a0a0a' : LP_INK_DIM),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: LP_SANS, fontSize: 14, fontWeight: 500, letterSpacing: 0.3,
          marginBottom: 18, transition: 'all 280ms ease',
        }}>{submitted ? 'Submitted · Tomorrow returns' : 'Submit'}</div>
      </div>
    </div>
  );
}

export function RuleSection({ onCTAClick }: { onCTAClick: () => void }) {
  return (
    <section
      id="rule"
      style={{ background: '#060608', padding: '180px 0' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 64px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 80,
          alignItems: 'center',
        }}>
          <div>
            <Reveal>
              <Eyebrow>The only rule</Eyebrow>
              <div style={{ height: 28 }} />
              <H1 style={{ fontSize: 'clamp(56px, 8vw, 110px)' }}>
                Three.<br />
                <span style={{ color: LP_INK_DIM }}>No more,</span><br />
                <span style={{ color: LP_INK_DIM }}>no less.</span>
              </H1>
            </Reveal>
            <Reveal delay={300}>
              <Lead style={{ marginTop: 40, maxWidth: 460 }}>
                Each day, write exactly three sentences about your day. Submit them and they're permanent. No edits. No deletions. Your words stand.
              </Lead>
            </Reveal>
            <Reveal delay={500}>
              <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 18 }}>
                <MiniDots filled={3} size={14} />
                <div style={{ fontFamily: LP_MONO, fontSize: 12, color: LP_INK, letterSpacing: 2.4, textTransform: 'uppercase' }}>3 / 3 · ready</div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <MiniPhone>
                <PhoneWritingDemo />
              </MiniPhone>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

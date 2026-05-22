"use client";

import {
  Reveal,
  Eyebrow,
  H2,
  H3,
  Lead,
  P,
  LP_INK,
  LP_INK_BRIGHT,
  LP_INK_DIM,
  LP_INK_FADE,
  LP_PAPER,
  LP_FRAME,
  LP_MONO,
} from "@/components/lp";

export function ProblemSection() {
  return (
    <section id="problem" style={{ background: LP_PAPER, padding: '180px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 64px' }}>
        <Reveal>
          <div style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
            <Eyebrow>The problem with journaling apps</Eyebrow>
            <div style={{ height: 32 }} />
            <H2>
              Most journaling apps ask you to write a&nbsp;lot.
              <br />
              <span style={{ color: LP_INK_DIM }}>So most days, you write nothing.</span>
            </H2>
            <div style={{ height: 48 }} />
            <Lead style={{ margin: '0 auto', maxWidth: 580 }}>
              Blank pages are intimidating. Streaks are punishing. Notifications scream for your attention.
              What if the smallest possible practice was also the most effective one?
            </Lead>
          </div>
        </Reveal>

        <div style={{ height: 100 }} />

        <Reveal delay={200}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
            border: `1px solid ${LP_FRAME}`, borderRadius: 24,
            overflow: 'hidden', maxWidth: 1000, margin: '0 auto',
          }}>
            <div style={{ padding: '48px 44px', borderRight: `1px solid ${LP_FRAME}` }}>
              <Eyebrow color={LP_INK_FADE}>The old way</Eyebrow>
              <div style={{ height: 22 }} />
              <H3 style={{ color: LP_INK_DIM, fontSize: 32, lineHeight: 1.3 }}>
                Open a blank page. Write until you feel done.
              </H3>
              <div style={{ height: 26 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Streak shame for missed days', 'Infinite scroll of past entries', 'AI that rewrites your voice', 'Likes and follower counts'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontFamily: LP_MONO, color: LP_INK_FADE, fontSize: 14 }}>—</span>
                    <P style={{ color: LP_INK_DIM, textDecoration: 'line-through', textDecorationColor: LP_INK_FADE }}>{t}</P>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '48px 44px', background: 'rgba(255,255,255,0.015)' }}>
              <Eyebrow color={LP_INK}>The Three Sentences way</Eyebrow>
              <div style={{ height: 22 }} />
              <H3 style={{ fontSize: 32, lineHeight: 1.3 }}>
                Write three sentences. Submit. Close the app.
              </H3>
              <div style={{ height: 26 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Two days of grace built in', 'A calendar that fills as you do', 'Your words stay your words', 'A small circle, end-to-end encrypted'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: LP_INK_BRIGHT, flexShrink: 0 }} />
                    <P style={{ color: LP_INK }}>{t}</P>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

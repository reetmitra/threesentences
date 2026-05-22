"use client";

import {
  LP_INK_DIM,
  LP_MONO,
  Reveal,
  H1,
  Lead,
  CTA,
  Mark,
  DotGrid,
} from "@/components/lp";

export function FinalCTASection({ onCTAClick }: { onCTAClick: () => void }) {
  return (
    <section style={{
      background: '#0e0e10',
      padding: '200px 0',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <DotGrid opacity={0.035} size={32} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 60%, rgba(255,255,255,0.04), transparent 55%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 900, margin: '0 auto', padding: '0 64px' }}>
        <Reveal>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <Mark size={52} />
          </div>
        </Reveal>
        <Reveal delay={100}>
          <H1 style={{ fontSize: 'clamp(60px, 10vw, 140px)' }}>
            Start with<br />today.
          </H1>
        </Reveal>
        <Reveal delay={250}>
          <Lead style={{ margin: '40px auto 0', maxWidth: 520, textAlign: 'center' }}>
            Three Sentences is invite-only. We're opening early access in small waves to people who are serious about the practice.
          </Lead>
        </Reveal>
        <Reveal delay={400}>
          <div style={{ marginTop: 52, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <CTA fill size="lg" onClick={onCTAClick}>
              Request access <span style={{ fontSize: 18 }}>→</span>
            </CTA>
          </div>
        </Reveal>
        <Reveal delay={550}>
          <div style={{
            marginTop: 48,
            display: 'flex',
            gap: 32,
            justifyContent: 'center',
            flexWrap: 'wrap',
            fontFamily: LP_MONO,
            fontSize: 11,
            color: LP_INK_DIM,
            letterSpacing: 2.4,
            textTransform: 'uppercase',
          }}>
            <span>Invite only</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>iOS · Q4 2026</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>No spam, ever</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

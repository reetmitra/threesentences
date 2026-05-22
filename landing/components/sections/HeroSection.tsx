"use client";

import {
  LP_INK,
  LP_INK_DIM,
  LP_INK_FADE,
  LP_FRAME,
  LP_MONO,
  LP_SERIF,
  Mark,
  DotGrid,
  Reveal,
  H1,
  Lead,
  CTA,
  useScrollY,
} from "@/components/lp";

function Nav({ onCTA }: { onCTA: () => void }) {
  const y = useScrollY();
  const elevated = y > 40;
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: elevated ? '14px 48px' : '24px 48px',
      background: elevated ? 'rgba(6,6,8,0.78)' : 'transparent',
      backdropFilter: elevated ? 'blur(16px) saturate(140%)' : 'none',
      WebkitBackdropFilter: elevated ? 'blur(16px) saturate(140%)' : 'none',
      borderBottom: elevated ? `1px solid ${LP_FRAME}` : '1px solid transparent',
      transition: 'all 240ms ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Mark size={28} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontFamily: LP_SERIF, fontStyle: 'italic', fontSize: 18, color: LP_INK, letterSpacing: -0.3 }}>Three Sentences</span>
          <span style={{ fontFamily: LP_MONO, fontSize: 9, color: LP_INK_DIM, letterSpacing: 2.2, textTransform: 'uppercase' }}>by 363™</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {[['why', '#problem'], ['how', '#rule'], ['inside', '#features'], ['faq', '#faq']].map(([l, h]) => (
          <a key={h} href={h} style={{
            fontFamily: LP_MONO, fontSize: 11, color: LP_INK_DIM,
            letterSpacing: 2.4, textTransform: 'uppercase',
            textDecoration: 'none', transition: 'color 200ms',
          }} onMouseEnter={(e) => e.currentTarget.style.color = LP_INK} onMouseLeave={(e) => e.currentTarget.style.color = LP_INK_DIM}>{l}</a>
        ))}
        <CTA size="sm" ghost onClick={onCTA}>Join the waitlist</CTA>
      </div>
    </nav>
  );
}

function Hero({ onCTA }: { onCTA: () => void }) {
  const y = useScrollY();
  const parallax = Math.min(y * 0.3, 200);
  const fade = Math.max(0, 1 - y / 600);

  return (
    <section id="hero" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '120px 32px 80px',
    }}>
      <DotGrid />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 38%, rgba(255,255,255,0.05), transparent 50%)',
        pointerEvents: 'none', zIndex: 0,
        transform: `translateY(${parallax * 0.5}px)`,
        opacity: fade,
      }} />

      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        maxWidth: 1100, margin: '0 auto',
        transform: `translateY(${parallax}px)`,
        opacity: fade,
        transition: 'opacity 200ms ease',
      }}>
        {/* Floating mark */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 36,
          animation: 'lp-float 4500ms ease-in-out infinite',
        }}>
          <Mark size={56} />
        </div>

        <Reveal y={32}>
          <H1 style={{ fontSize: 'clamp(72px, 12vw, 180px)', letterSpacing: -6 }}>
            Three<br />Sentences.
          </H1>
        </Reveal>

        <Reveal delay={250} y={20}>
          <div style={{
            fontFamily: LP_MONO, fontSize: 14, color: LP_INK,
            letterSpacing: 4.8, textTransform: 'uppercase',
            marginTop: 36, fontWeight: 500,
          }}>
            Be&nbsp;better. Do&nbsp;better.
          </div>
        </Reveal>

        <Reveal delay={500}>
          <Lead style={{
            fontSize: 'clamp(17px, 1.4vw, 20px)', color: LP_INK_DIM,
            margin: '40px auto 0', maxWidth: 560,
          }}>
            A quiet daily journaling practice on a single truth: you cannot be perfect, but you can be relentless.
          </Lead>
        </Reveal>

        <Reveal delay={700}>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 44, flexWrap: 'wrap' }}>
            <CTA fill size="lg" onClick={onCTA}>Request access <span style={{ fontSize: 18 }}>→</span></CTA>
            <CTA ghost size="lg" onClick={() => document.getElementById('rule')?.scrollIntoView({ behavior: 'smooth' })}>See how it works</CTA>
          </div>
        </Reveal>

        <Reveal delay={900}>
          <div style={{
            display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center',
            marginTop: 56, fontFamily: LP_MONO, fontSize: 10,
            color: LP_INK_DIM, letterSpacing: 2.4, textTransform: 'uppercase',
          }}>
            <span>Invite only</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: LP_INK_FADE }} />
            <span>Launching Q4 2026</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: LP_INK_FADE }} />
            <span>iOS first</span>
          </div>
        </Reveal>
      </div>

      {/* scroll cue */}
      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        opacity: fade * 0.6,
      }}>
        <div style={{
          fontFamily: LP_MONO, fontSize: 10, color: LP_INK_DIM,
          letterSpacing: 2.4, textTransform: 'uppercase',
        }}>Scroll</div>
        <div style={{ width: 1, height: 40, background: `linear-gradient(${LP_INK_DIM}, transparent)` }} />
      </div>
    </section>
  );
}

export function HeroSection({ onCTAClick }: { onCTAClick: () => void }) {
  return (
    <>
      <Nav onCTA={onCTAClick} />
      <Hero onCTA={onCTAClick} />
    </>
  );
}

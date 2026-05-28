/* landing-sections-c.jsx — FAQ, Final CTA, WaitlistModal, Footer. */

const { useState: cS, useEffect: cE } = React;

/* ── FAQ ────────────────────────────────────────────────── */
function FAQSection() {
  const items = [
    { q: 'What if I have more than three sentences in me?',
      a: 'Hold them. They will still be there tomorrow. The constraint is the practice — three is a discipline, not a quota. If you need to write more, write more somewhere else.' },
    { q: 'Can I edit an entry after I submit?',
      a: 'No. Permanence is the point. Submitted entries cannot be edited or deleted. Your words stand as written, which keeps you honest in the writing.' },
    { q: 'What if I miss a day?',
      a: 'You miss a day. The streak resets to one when you return. The goal is 363/365, not 365/365 — two days of grace are built in.' },
    { q: 'Is this another habit-tracking app?',
      a: 'No. There are no charts to optimize, no mood emojis to pick, no weekly score. There is one number — the days you wrote — and it sits quietly in the corner.' },
    { q: 'How does AI reflection work?',
      a: 'Optionally. Once a week, if you turn it on, an AI reads back across 7, 30, or 90 days and surfaces a theme. It never gives you advice. It is a mirror, not a therapist.' },
    { q: 'Who can see my entries?',
      a: 'No one. Entries are encrypted at rest and never leave your device unless you opt in to AI reflection. There is no public feed, no comments, no follower count.' },
    { q: 'When does it launch?',
      a: 'Q4 2026. iOS first. Invite only — we open small waves to keep the circle quality high.' },
  ];
  const [open, setOpen] = cS(null);
  return (
    <Section id="faq" py={160} narrow>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <Eyebrow style={{ marginBottom: 28 }}>Questions</Eyebrow>
          <H2>What people ask before they start.</H2>
        </div>
      </Reveal>
      <div style={{ borderTop: `1px solid ${LP_FRAME}` }}>
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{ borderBottom: `1px solid ${LP_FRAME}` }}>
              <button onClick={() => setOpen(isOpen ? null : i)} style={{
                width: '100%', padding: '28px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
                background: 'transparent', border: 0, cursor: 'pointer',
                textAlign: 'left',
              }}>
                <H3 style={{
                  fontFamily: LP_SANS, fontWeight: 500,
                  fontSize: 'clamp(18px, 1.8vw, 22px)',
                  color: LP_INK, letterSpacing: -0.2,
                }}>{item.q}</H3>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `1px solid ${LP_FRAME}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: LP_INK, fontSize: 18, fontWeight: 300,
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 220ms ease',
                  flexShrink: 0,
                }}>+</div>
              </button>
              <div style={{
                maxHeight: isOpen ? 300 : 0,
                overflow: 'hidden',
                transition: 'max-height 300ms cubic-bezier(0.16,1,0.3,1)',
              }}>
                <Lead style={{
                  fontSize: 16, color: LP_INK_DIM, lineHeight: 1.7,
                  paddingBottom: 28, maxWidth: 680,
                }}>{item.a}</Lead>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ── Final CTA — mirror of hero ─────────────────────────── */
function FinalCTASection({ onCTA }) {
  return (
    <section style={{
      padding: '200px 24px',
      background: LP_PAPER_2, position: 'relative', overflow: 'hidden',
    }}>
      <DotGrid opacity={0.028} size={28}/>
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 38%, rgba(255,255,255,0.05), transparent 50%)',
        pointerEvents: 'none',
      }}/>
      <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <Mark size={52}/>
        </div>
        {/* Mirror hero — italic Newsreader wordmark scale */}
        <div style={{
          fontFamily: LP_SERIF, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(72px, 12vw, 180px)',
          letterSpacing: -6, lineHeight: 1,
          color: LP_INK, marginBottom: 40,
        }}>
          Start with<br/>today.
        </div>
        <Lead style={{ color: LP_INK, maxWidth: 520, margin: '0 auto 48px' }}>
          Three sentences. The smallest possible practice. The only one you'll actually do.
        </Lead>
        <CTA fill size="lg" onClick={onCTA}>Request access →</CTA>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
          marginTop: 56, flexWrap: 'wrap',
          fontFamily: LP_MONO, fontSize: 11, fontWeight: 500,
          letterSpacing: 2.4, textTransform: 'uppercase',
          color: LP_INK_DIM,
        }}>
          <span style={{ whiteSpace: 'nowrap' }}>Invite only</span>
          <span style={{ width: 4, height: 4, borderRadius: 2, background: LP_INK_FADE }}/>
          <span style={{ whiteSpace: 'nowrap' }}>iOS</span>
          <span style={{ width: 4, height: 4, borderRadius: 2, background: LP_INK_FADE }}/>
          <span style={{ whiteSpace: 'nowrap' }}>Q4 2026</span>
          <span style={{ width: 4, height: 4, borderRadius: 2, background: LP_INK_FADE }}/>
          <span style={{ whiteSpace: 'nowrap' }}>No spam, ever</span>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────────────────── */
function Footer({ onCTA }) {
  const cols = [
    { e: 'Product', links: ['Why', 'How it works', 'Inside the app', 'Principles', 'Roadmap'] },
    { e: 'Company', links: ['About', 'Press', 'Beta program', 'Careers', 'Contact'] },
    { e: 'Legal',   links: ['Privacy', 'Terms', 'Encryption', 'Open source', 'Brand'] },
  ];
  return (
    <footer style={{ padding: '80px 64px 56px', background: LP_PAPER }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 64,
        }} className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Mark size={32}/>
              <span style={{
                fontFamily: LP_SERIF, fontStyle: 'italic',
                fontSize: 20, color: LP_INK, letterSpacing: -0.3,
              }}>Three Sentences</span>
            </div>
            <P style={{ color: LP_INK_DIM, maxWidth: 360, marginBottom: 24, lineHeight: 1.65 }}>
              A quiet daily journaling practice on a single rule. Invite only.
              Launching Q4 2026. iOS first.
            </P>
            <CTA ghost size="sm" onClick={onCTA}>Request access</CTA>
          </div>
          {cols.map(col => (
            <div key={col.e}>
              <Meta size={11} ls={2.4} style={{ display: 'block', marginBottom: 20 }}>{col.e}</Meta>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(l => (
                  <a key={l} href="#" style={{
                    fontFamily: LP_SANS, fontSize: 14, color: LP_INK_DIM, textDecoration: 'none',
                    transition: 'color 180ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = LP_INK}
                  onMouseLeave={e => e.currentTarget.style.color = LP_INK_DIM}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Hairline width="100%" style={{ margin: '48px 0 24px' }}/>
        <div style={{
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <Meta size={10} ls={1.4}>© 2026 Three Sentences. All rights reserved.</Meta>
          <Meta size={10} ls={1.4}>@363v1 · three63.com</Meta>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr !important; } }`}</style>
    </footer>
  );
}

/* ── Waitlist Modal ─────────────────────────────────────── */
function WaitlistModal({ open, onClose }) {
  const [email, setEmail] = cS('');
  const [submitted, setSubmitted] = cS(false);
  const valid = /\S+@\S+\.\S+/.test(email);

  cE(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  cE(() => {
    if (!open) {
      const t = setTimeout(() => { setSubmitted(false); setEmail(''); }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'pt-fade-in 200ms ease both',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: LP_PAPER_2, border: `1px solid ${LP_FRAME}`,
        borderRadius: 24, padding: '44px 44px 36px',
        width: '100%', maxWidth: 520,
        position: 'relative',
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8)',
        animation: 'lp-modal-in 300ms cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 16, right: 16,
          width: 36, height: 36, borderRadius: 18,
          background: 'transparent', border: `1px solid ${LP_FRAME}`,
          color: LP_INK_DIM, fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <Mark size={44}/>
            </div>
            <H3 style={{ marginBottom: 14 }}>You're on the list.</H3>
            <Lead style={{ color: LP_INK_DIM, fontSize: 15, marginBottom: 36 }}>
              We'll send you in when there's room. No marketing in between.
            </Lead>
            <Meta size={11} ls={3} color={LP_INK_DIM}>Be better. Do better.</Meta>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <Mark size={36}/>
            </div>
            <H3 style={{ textAlign: 'center', marginBottom: 14 }}>Request early access.</H3>
            <Lead style={{ color: LP_INK_DIM, fontSize: 15, textAlign: 'center', marginBottom: 32 }}>
              Three Sentences opens in small waves. Drop your email and we'll send you in when there's room.
            </Lead>
            <form onSubmit={(e) => { e.preventDefault(); if (valid) setSubmitted(true); }}>
              <input
                type="email" autoFocus
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%', height: 54, padding: '0 18px',
                  background: LP_SURFACE, color: LP_INK,
                  border: `1px solid ${LP_FRAME}`, borderRadius: 12,
                  fontFamily: LP_SANS, fontSize: 15,
                  marginBottom: 14, outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = LP_INK}
                onBlur={e => e.target.style.borderColor = LP_FRAME}
              />
              <button type="submit" disabled={!valid} style={{
                width: '100%', height: 54,
                background: valid ? LP_INK_BRIGHT : 'transparent',
                color: valid ? '#0a0a0a' : LP_INK_DIM,
                border: `1px solid ${valid ? LP_INK_BRIGHT : LP_FRAME}`,
                borderRadius: 999,
                fontFamily: LP_SANS, fontSize: 15, fontWeight: 500, letterSpacing: 0.3,
                cursor: valid ? 'pointer' : 'not-allowed',
                transition: 'all 200ms ease',
              }}>Join the waitlist</button>
            </form>
            <Meta size={10} ls={1.4} style={{ display: 'block', textAlign: 'center', marginTop: 18 }}>
              No spam. No marketing. Just a single note when your spot opens.
            </Meta>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { FAQSection, FinalCTASection, Footer, WaitlistModal });

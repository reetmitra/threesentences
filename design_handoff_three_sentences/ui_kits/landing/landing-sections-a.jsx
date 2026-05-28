/* landing-sections-a.jsx — Nav, Hero, Problem, Rule (+typing demo), How. */

const { useState: aS, useEffect: aE, useRef: aR } = React;

/* ── Nav ───────────────────────────────────────────────── */
function Nav({ onCTA }) {
  const y = useScrollY();
  const elevated = y > 40;
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: elevated ? '14px 64px' : '24px 64px',
      background: elevated ? 'rgba(6,6,8,0.78)' : 'transparent',
      backdropFilter: elevated ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: elevated ? 'blur(16px)' : 'none',
      borderBottom: `1px solid ${elevated ? LP_FRAME : 'transparent'}`,
      transition: 'all 240ms ease',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, whiteSpace: 'nowrap' }}>
          <Mark size={28}/>
          <span style={{
            fontFamily: LP_SERIF, fontStyle: 'italic',
            fontSize: 18, color: LP_INK, letterSpacing: -0.3,
          }}>Three Sentences</span>
          <Meta size={9} ls={2} color={LP_INK_DIM}>by 363™</Meta>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ display: 'flex', gap: 24 }} className="nav-links">
            {[
              ['Why',    '#problem'],
              ['How',    '#how'],
              ['Inside', '#features'],
              ['FAQ',    '#faq'],
            ].map(([l, h]) => (
              <a key={l} href={h} style={{
                fontFamily: LP_MONO, fontSize: 11, fontWeight: 400,
                letterSpacing: 2.4, textTransform: 'uppercase',
                color: LP_INK_DIM, textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = LP_INK}
              onMouseLeave={e => e.currentTarget.style.color = LP_INK_DIM}>{l}</a>
            ))}
          </div>
          <CTA ghost size="sm" onClick={onCTA}>Join the waitlist</CTA>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .nav-links { display: none !important; } }`}</style>
    </nav>
  );
}

/* ── Hero ───────────────────────────────────────────────── */
function Hero({ onCTA }) {
  const y = useScrollY();
  const heroOpacity = Math.max(0, 1 - y / 600);
  const heroY = Math.min(y * 0.3, 200);
  const glowY = y * 0.15;
  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '160px 24px 80px',
      position: 'relative', overflow: 'hidden',
    }}>
      <DotGrid opacity={0.028} size={28}/>
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 38%, rgba(255,255,255,0.05), transparent 50%)',
        transform: `translateY(${glowY}px)`,
        opacity: heroOpacity,
        pointerEvents: 'none',
      }}/>
      <div style={{
        textAlign: 'center', maxWidth: 1024,
        transform: `translateY(${heroY}px)`,
        opacity: heroOpacity,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40,
                      animation: 'lp-float 4.5s ease-in-out infinite' }}>
          <Mark size={56}/>
        </div>
        {/* HERO WORDMARK — the one place italic Newsreader is allowed at scale */}
        <div style={{
          fontFamily: LP_SERIF, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(72px, 12vw, 180px)',
          letterSpacing: -6, lineHeight: 1,
          color: LP_INK, marginBottom: 36,
        }}>
          Three<br/>Sentences.
        </div>
        <Meta size={14} ls={4.8} color={LP_INK} style={{ display: 'block', marginBottom: 56 }}>
          Be&nbsp;better. Do&nbsp;better.
        </Meta>
        <Lead style={{ color: LP_INK, maxWidth: 560, margin: '0 auto 56px' }}>
          A quiet daily journaling practice on a single rule: write exactly three sentences.
          You'll do it on your worst days. You'll do it on your best ones.
        </Lead>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
          <CTA fill size="lg" onClick={onCTA}>Request access →</CTA>
          <CTA ghost size="lg" onClick={() => document.getElementById('rule').scrollIntoView({ behavior: 'smooth' })}>
            See how it works
          </CTA>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
          flexWrap: 'wrap',
          fontFamily: LP_MONO, fontSize: 11, fontWeight: 500,
          letterSpacing: 2.4, textTransform: 'uppercase',
          color: LP_INK_DIM,
        }}>
          <span style={{ whiteSpace: 'nowrap' }}>Invite only</span>
          <span style={{ width: 4, height: 4, borderRadius: 2, background: LP_INK_FADE }}/>
          <span style={{ whiteSpace: 'nowrap' }}>Launching Q4 2026</span>
          <span style={{ width: 4, height: 4, borderRadius: 2, background: LP_INK_FADE }}/>
          <span style={{ whiteSpace: 'nowrap' }}>iOS first</span>
        </div>
      </div>
      {/* Scroll cue */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        opacity: heroOpacity,
      }}>
        <Meta size={9} ls={2.4}>Scroll</Meta>
        <div style={{ width: 1, height: 56,
          background: `linear-gradient(to bottom, ${LP_INK_DIM}, transparent)` }}/>
      </div>
    </section>
  );
}

/* ── Problem ────────────────────────────────────────────── */
function ProblemSection() {
  return (
    <Section id="problem" py={160} bg={LP_PAPER}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <Eyebrow style={{ marginBottom: 28 }}>The problem</Eyebrow>
          <H2 style={{ marginBottom: 32 }}>
            Most journaling apps ask you to write a lot.<br/>
            <span style={{ color: LP_INK_DIM }}>So most days, you write nothing.</span>
          </H2>
          <Lead style={{ color: LP_INK_DIM, maxWidth: 640, margin: '0 auto' }}>
            The blank page is the antagonist. You buy the notebook. You write for three days. You stop.
            Three Sentences makes the page small enough to finish — every day.
          </Lead>
        </div>
      </Reveal>

      <Reveal delay={150}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
          border: `1px solid ${LP_FRAME}`, borderRadius: 24,
          overflow: 'hidden',
        }} className="problem-grid">
          {/* Old way */}
          <div style={{ padding: '48px 44px', borderRight: `1px solid ${LP_FRAME}` }}>
            <Eyebrow color={LP_INK_DIM} style={{ marginBottom: 18 }}>The old way</Eyebrow>
            <H3 style={{ color: LP_INK_DIM, marginBottom: 28, letterSpacing: -0.3 }}>
              Open the app. Stare at the blank page.
            </H3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                'Write 500 words about your day',
                'Pick a mood from twelve emoji',
                'Track 14 habits in a grid',
                'Get a weekly score for "wellness"',
              ].map(t => (
                <li key={t} style={{
                  fontFamily: LP_SANS, fontSize: 15, color: LP_INK_FADE,
                  textDecoration: 'line-through', lineHeight: 1.55,
                }}>{t}</li>
              ))}
            </ul>
          </div>
          {/* New way */}
          <div style={{ padding: '48px 44px' }}>
            <Eyebrow color={LP_INK_BRIGHT} style={{ marginBottom: 18 }}>The Three Sentences way</Eyebrow>
            <H3 style={{ marginBottom: 28, letterSpacing: -0.3 }}>
              Write three sentences. Submit. Close it.
            </H3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                'Three sentences. Exactly.',
                'No moods. No grids. No scores.',
                'Permanent. No edits, no deletions.',
                '60 seconds, and you are done.',
              ].map(t => (
                <li key={t} style={{
                  fontFamily: LP_SANS, fontSize: 15, color: LP_INK, lineHeight: 1.55,
                  display: 'flex', alignItems: 'baseline', gap: 12,
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: 2, background: LP_INK_BRIGHT, flexShrink: 0,
                                 transform: 'translateY(-3px)' }}/>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <style>{`@media (max-width: 768px) { .problem-grid { grid-template-columns: 1fr !important; } .problem-grid > div:first-child { border-right: 0 !important; border-bottom: 1px solid ${LP_FRAME} !important; } }`}</style>
      </Reveal>
    </Section>
  );
}

/* ── Rule (with phone typing demo) ───────────────────────── */
function RuleSection({ onCTA }) {
  return (
    <Section id="rule" py={160}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 80, alignItems: 'center',
      }} className="rule-grid">
        <Reveal>
          <Eyebrow style={{ marginBottom: 28 }}>The only rule</Eyebrow>
          <H1 style={{ marginBottom: 32, letterSpacing: -3 }}>
            Three.<br/>
            <span style={{ color: LP_INK_DIM }}>No more,</span><br/>
            <span style={{ color: LP_INK_DIM }}>no less.</span>
          </H1>
          <Lead style={{ marginBottom: 36, maxWidth: 480 }}>
            Three Sentences enforces the limit at the input level. Submit doesn't unlock until
            you have exactly three. Then your words are saved — permanently.
          </Lead>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <MiniDots filled={3} total={3} size={12}/>
            <Meta size={11} ls={2}>3 / 3 · Ready</Meta>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <MiniPhone width={360} height={760}>
              <PhoneWritingDemo/>
            </MiniPhone>
          </div>
        </Reveal>
      </div>
      <style>{`@media (max-width: 900px) { .rule-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </Section>
  );
}

/* The typing demo. On view, types a 3-sentence script char-by-char, then
   transitions to submitted state. */
function PhoneWritingDemo() {
  const [ref, seen] = useInView(0.3);
  const SCRIPT = [
    'The rain stopped just after lunch.',
    'I walked the long way to the post office.',
    'A small kindness from a stranger.',
  ];
  const FULL = SCRIPT.join(' ');
  const [shown, setShown] = aS(0);
  const [done, setDone] = aS(false);

  aE(() => {
    if (!seen) return;
    let cancelled = false;
    const startTimer = setTimeout(() => {
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        if (i >= FULL.length) {
          setTimeout(() => !cancelled && setDone(true), 600);
          return;
        }
        i++;
        setShown(i);
        setTimeout(tick, 38 + Math.random() * 30);
      };
      tick();
    }, 400);
    return () => { cancelled = true; clearTimeout(startTimer); };
  }, [seen]);

  // Count complete sentences typed
  let filled = 0, acc = 0;
  for (const s of SCRIPT) {
    acc += s.length + 1;
    if (shown >= acc - 1) filled++;
  }
  filled = Math.min(filled, 3);

  const text = FULL.slice(0, shown);

  return (
    <div ref={ref} style={{
      height: '100%', padding: '12px 22px 28px',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14, flexShrink: 0 }}>
        <div style={{ flexShrink: 0 }}>
          <Meta size={10} ls={1.4} style={{ marginBottom: 4, display: 'block', whiteSpace: 'nowrap' }}>Tue · Jun 18</Meta>
          <div style={{
            fontFamily: LP_SANS, fontWeight: 600,
            fontSize: 26, color: LP_INK, letterSpacing: -0.5, lineHeight: 1,
            whiteSpace: 'nowrap',
          }}>{done ? 'Done.' : 'Today'}</div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          border: `1px solid ${done ? LP_INK_BRIGHT : LP_FRAME}`,
          flexShrink: 0,
          transition: 'border-color 400ms ease',
        }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M8 2c0 3 3 3.5 3 6.5a3 3 0 0 1-6 0c0-1.5 1-2.5 1.5-3 0 2 1.5 2.5 1.5 2.5C8.75 6 7.5 4.5 8 2Z"
                  stroke={done ? LP_INK_BRIGHT : LP_INK_DIM} strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
          <span style={{
            fontFamily: LP_MONO, fontSize: 11, fontWeight: 500,
            color: done ? LP_INK_BRIGHT : LP_INK, letterSpacing: 0.6,
            transition: 'color 400ms ease',
          }}>21</span>
        </div>
      </div>

      {/* Writing surface */}
      <div style={{
        flex: 1, position: 'relative',
        padding: done ? '20px 20px 22px' : '0',
        background: done ? LP_SURFACE : 'transparent',
        borderRadius: done ? 16 : 0,
        borderLeft: done ? `2px solid ${LP_INK_BRIGHT}` : 'none',
        transition: 'all 600ms cubic-bezier(0.16,1,0.3,1)',
        marginTop: done ? 12 : 0,
      }}>
        <div style={{
          fontFamily: LP_SERIF, fontStyle: 'normal', fontWeight: 400,
          fontSize: 17, lineHeight: 1.6, color: LP_INK, letterSpacing: -0.1,
        }}>
          {text}
          {!done && shown < FULL.length && (
            <span style={{
              display: 'inline-block', width: 7, height: 18,
              background: LP_INK, marginLeft: 1, verticalAlign: '-2px',
              animation: 'lp-cursor 1s steps(1) infinite',
            }}/>
          )}
        </div>
      </div>

      {/* Counter strip */}
      <div style={{
        marginTop: 16, paddingTop: 14, borderTop: `1px solid ${LP_FRAME}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <MiniDots filled={filled} total={3} size={9}/>
        <Meta size={11} ls={1.4} color={done || filled === 3 ? LP_INK_BRIGHT : LP_INK_DIM}>
          {done ? '✓ Locked' : `${filled} / 3 · ${filled === 3 ? 'Ready' : `${3 - filled} more`}`}
        </Meta>
      </div>

      {/* Submit pill */}
      <div style={{ marginTop: 12, flexShrink: 0 }}>
        <div style={{
          width: '100%', height: 48, borderRadius: 999,
          background: done || filled === 3 ? LP_INK_BRIGHT : 'transparent',
          color: done || filled === 3 ? '#0a0a0a' : LP_INK_DIM,
          border: `1px solid ${done || filled === 3 ? LP_INK_BRIGHT : LP_INK_FADE}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: LP_SANS, fontSize: 14, fontWeight: 500, letterSpacing: 0.3,
          transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
        }}>
          {done ? 'Submitted · Tomorrow returns' : 'Submit'}
        </div>
      </div>
    </div>
  );
}

/* ── How It Works ───────────────────────────────────────── */
function HowSection() {
  const steps = [
    { n: '01', t: 'Open the app.',                 b: 'No notification badges, no streak guilt-trips on the splash. The app opens to a blank page with a date.' },
    { n: '02', t: 'Write three sentences.',        b: 'About anything. The rain. A meeting. A small kindness. The cursor blinks until you have exactly three.' },
    { n: '03', t: 'Close it. Return tomorrow.',    b: 'Submission is permanent. The next time you open the app, today is over and a new blank page is waiting.' },
  ];
  return (
    <Section id="how" py={160}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <Eyebrow style={{ marginBottom: 28 }}>How it works</Eyebrow>
          <H2>Sixty seconds. Then you're done.</H2>
        </div>
      </Reveal>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32,
      }} className="how-grid">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 150}>
            <div style={{
              padding: '40px 36px 36px',
              border: `1px solid ${LP_FRAME}`, borderRadius: 20,
              background: 'rgba(255,255,255,0.012)',
              height: '100%', display: 'flex', flexDirection: 'column',
            }}>
              <Meta size={11} ls={2.4} style={{ marginBottom: 20 }}>Step {s.n}</Meta>
              {/* STEP NUMERAL — italic Newsreader allowed at scale */}
              <div style={{
                fontFamily: LP_SERIF, fontStyle: 'italic',
                fontSize: 110, color: LP_INK, opacity: 0.85,
                letterSpacing: -3, lineHeight: 0.9,
                marginBottom: 24,
              }}>{s.n}</div>
              <H3 style={{ marginBottom: 16, letterSpacing: -0.3 }}>{s.t}</H3>
              <P style={{ color: LP_INK_DIM, lineHeight: 1.65 }}>{s.b}</P>
            </div>
          </Reveal>
        ))}
      </div>
      <style>{`@media (max-width: 900px) { .how-grid { grid-template-columns: 1fr !important; gap: 20px !important; } }`}</style>
    </Section>
  );
}

Object.assign(window, {
  Nav, Hero, ProblemSection, RuleSection, PhoneWritingDemo, HowSection,
});

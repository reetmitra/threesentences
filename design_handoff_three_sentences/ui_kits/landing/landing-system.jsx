/* landing-system.jsx — tokens, atoms, hooks for the landing page. */

/* ── Tokens (mirror colors_and_type.css) ────────────────── */
const LP_INK         = '#ebe7dc';
const LP_INK_BRIGHT  = '#ffffff';
const LP_INK_DIM     = '#8a877e';
const LP_INK_FADE    = '#3a3a3e';
const LP_PAPER       = '#060608';
const LP_PAPER_2     = '#0e0e10';
const LP_SURFACE     = '#15151a';
const LP_FRAME       = '#1e1e22';
const LP_WARM        = '#e8d4b3';

const LP_SANS  = "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif";
const LP_SERIF = "'Newsreader', 'Iowan Old Style', 'Times New Roman', serif";
const LP_MONO  = "'IBM Plex Mono', ui-monospace, monospace";

const { useState: lpS, useEffect: lpE, useRef: lpR, useMemo: lpM } = React;

/* ── Hooks ─────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = lpR(null);
  const [seen, setSeen] = lpS(false);
  lpE(() => {
    if (!ref.current || seen) return;
    const el = ref.current;
    // If the element is already (even partially) on screen at mount, fire immediately.
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.top < vh && r.bottom > 0) { setSeen(true); return; }
    // Otherwise observe; trigger on any intersection.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    // Safety net: if no IntersectionObserver event in 2s (some embeds throttle scrollers),
    // reveal anyway so content never stays invisible.
    const t = setTimeout(() => { setSeen(true); io.disconnect(); }, 2000);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [seen, threshold]);
  return [ref, seen];
}

function useScrollY() {
  const [y, setY] = lpS(0);
  lpE(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { setY(window.scrollY); raf = null; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return y;
}

/* ── Primitives ────────────────────────────────────────── */
function Section({ id, children, py = 160, bg = LP_PAPER, narrow = false, full = false, style = {} }) {
  return (
    <section id={id} style={{
      background: bg,
      padding: `${py}px 0`,
      position: 'relative',
      ...style,
    }}>
      <div style={{
        maxWidth: narrow ? 840 : (full ? '100%' : 1280),
        margin: '0 auto',
        padding: full ? 0 : '0 64px',
      }}>{children}</div>
    </section>
  );
}

function Reveal({ children, delay = 0, y = 24, as = 'div', style = {} }) {
  const [ref, seen] = useInView(0.15);
  const Tag = as;
  return (
    <Tag ref={ref} style={{
      ...style,
      opacity: seen ? 1 : 0,
      transform: seen ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</Tag>
  );
}

function DotGrid({ opacity = 0.025, size = 28 }) {
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `radial-gradient(rgba(235,231,220,${opacity}) 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
    }}/>
  );
}

function Hairline({ width = '60%', style = {} }) {
  return <div style={{ height: 1, width, background: LP_FRAME, margin: '0 auto', ...style }}/>;
}

/* ── Typography ─────────────────────────────────────────── */
function Eyebrow({ children, color = LP_INK_DIM, style = {} }) {
  return (
    <div style={{
      fontFamily: LP_MONO, fontSize: 12, fontWeight: 500,
      letterSpacing: 3, textTransform: 'uppercase',
      color, lineHeight: 1, ...style,
    }}>{children}</div>
  );
}

function Meta({ children, size = 10, color = LP_INK_DIM, ls = 1.4, style = {} }) {
  return (
    <span style={{
      fontFamily: LP_MONO, fontSize: size, fontWeight: 500,
      letterSpacing: ls, textTransform: 'uppercase',
      color, lineHeight: 1, ...style,
    }}>{children}</span>
  );
}

/* Display H1 / H2 / H3 — SANS SEMIBOLD, not italic (italic only for the hero wordmark and numerals) */
function H1({ children, style = {} }) {
  return <h1 style={{
    fontFamily: LP_SANS, fontWeight: 600,
    fontSize: 'clamp(48px, 7vw, 96px)',
    letterSpacing: -2, lineHeight: 1.05,
    color: LP_INK, margin: 0,
    textWrap: 'balance', ...style,
  }}>{children}</h1>;
}
function H2({ children, style = {} }) {
  return <h2 style={{
    fontFamily: LP_SANS, fontWeight: 600,
    fontSize: 'clamp(32px, 4vw, 56px)',
    letterSpacing: -1, lineHeight: 1.1,
    color: LP_INK, margin: 0,
    textWrap: 'balance', ...style,
  }}>{children}</h2>;
}
function H3({ children, style = {} }) {
  return <h3 style={{
    fontFamily: LP_SANS, fontWeight: 600,
    fontSize: 'clamp(22px, 2vw, 28px)',
    letterSpacing: -0.4, lineHeight: 1.2,
    color: LP_INK, margin: 0, ...style,
  }}>{children}</h3>;
}

function Lead({ children, style = {} }) {
  return <p style={{
    fontFamily: LP_SANS, fontWeight: 400,
    fontSize: 'clamp(17px, 1.4vw, 20px)',
    lineHeight: 1.6, letterSpacing: -0.1,
    color: LP_INK, margin: 0,
    ...style,
  }}>{children}</p>;
}

function P({ children, style = {} }) {
  return <p style={{
    fontFamily: LP_SANS, fontWeight: 400,
    fontSize: 15, lineHeight: 1.6,
    color: LP_INK, margin: 0, ...style,
  }}>{children}</p>;
}

/* ── Atoms ──────────────────────────────────────────────── */
function CTA({ children, onClick, fill = false, ghost = false, size = 'md', style = {} }) {
  const sizes = { sm: 40, md: 52, lg: 62 };
  const padX = { sm: 22, md: 28, lg: 36 };
  const h = sizes[size];
  let bg = 'transparent', fg = LP_INK, border = LP_INK;
  if (fill)  { bg = LP_INK_BRIGHT; fg = '#0a0a0a'; border = LP_INK_BRIGHT; }
  if (ghost) { bg = 'transparent'; fg = LP_INK; border = LP_FRAME; }

  const [hover, setHover] = lpS(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        height: h, padding: `0 ${padX[size]}px`,
        background: bg, color: fg, border: `1px solid ${border}`,
        borderRadius: 999,
        fontFamily: LP_SANS, fontSize: size === 'lg' ? 16 : 14, fontWeight: 500,
        letterSpacing: 0.3, cursor: 'pointer',
        transform: hover ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'transform 200ms ease, background 200ms ease, border-color 200ms ease',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        ...style,
      }}>
      {children}
    </button>
  );
}

function Mark({ size = 28 }) {
  const r = size / 9;
  const gap = size / 8;
  return (
    <div aria-label="Three Sentences" style={{
      width: size, height: size,
      borderRadius: size * 0.22,
      background: LP_INK_BRIGHT,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap,
      flexShrink: 0,
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: r * 2, height: r * 2, borderRadius: '50%', background: '#0a0a0a',
        }}/>
      ))}
    </div>
  );
}

function MiniDots({ filled = 3, total = 3, size = 10 }) {
  return (
    <span style={{ display: 'inline-flex', gap: size }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: size, height: size, borderRadius: '50%',
          background: i < filled ? LP_INK_BRIGHT : 'transparent',
          border: i < filled ? 'none' : `1px solid ${LP_INK_FADE}`,
          transition: 'background 200ms ease',
        }}/>
      ))}
    </span>
  );
}

function MiniPhone({ width = 360, height = 720, children }) {
  return (
    <div style={{
      width, height,
      borderRadius: Math.round(width * 0.13),
      border: `1px solid ${LP_FRAME}`,
      background: LP_PAPER_2,
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 80px 160px -40px rgba(0,0,0,0.9), 0 30px 60px -30px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.03)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Dynamic island */}
      <div aria-hidden style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        width: 96, height: 26, borderRadius: 14, background: '#000',
        zIndex: 5, pointerEvents: 'none',
      }}/>
      {/* Top safe area — clears the dynamic island */}
      <div style={{ height: 50, flexShrink: 0 }}/>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1, minHeight: 0 }}>
        {children}
      </div>
      {/* Home indicator */}
      <div aria-hidden style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 100, height: 4, borderRadius: 3,
        background: LP_INK, opacity: 0.4, zIndex: 5, pointerEvents: 'none',
      }}/>
    </div>
  );
}

Object.assign(window, {
  LP_INK, LP_INK_BRIGHT, LP_INK_DIM, LP_INK_FADE, LP_PAPER, LP_PAPER_2,
  LP_SURFACE, LP_FRAME, LP_WARM, LP_SANS, LP_SERIF, LP_MONO,
  useInView, useScrollY,
  Section, Reveal, DotGrid, Hairline,
  Eyebrow, Meta, H1, H2, H3, Lead, P,
  CTA, Mark, MiniDots, MiniPhone,
});

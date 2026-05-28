/* brand/shared.jsx — palette + primitives shared across all brand artboards. */

const B = {
  /* Noir surfaces (the app interior) */
  paper:     '#0e0e10',
  paperOut:  '#060608',
  surface:   '#15151a',
  surfaceHi: '#1c1c22',
  frame:     '#1e1e22',
  /* Ink (text on paper) */
  ink:       '#ebe7dc',
  inkBright: '#ffffff',
  inkDim:    '#75726a',
  inkFade:   '#36363a',
  /* Cream side (editorial / out-of-app) */
  cream:     '#efece5',
  creamHi:   '#f6f4ee',
  creamLo:   '#e4dfd2',
  /* Warm accent — only for warnings, milestones, watermark accents */
  warn:      '#f6c177',
};

const F = {
  serif: "'Newsreader','Iowan Old Style',Georgia,serif",
  sans:  "'Schibsted Grotesk','Helvetica Neue',Arial,sans-serif",
  mono:  "'IBM Plex Mono',ui-monospace,Menlo,monospace",
};

/* ── Eyebrow (mono uppercase label) ─────────────────────────── */
function Eyebrow({ children, color, size = 10, style }) {
  return (
    <div style={{
      fontFamily: F.mono, fontSize: size, fontWeight: 500,
      letterSpacing: 1.6, textTransform: 'uppercase',
      color: color || B.inkDim, lineHeight: 1,
      ...style,
    }}>{children}</div>
  );
}

/* ── Caption (description under a specimen) ─────────────────── */
function Caption({ title, body, color, align = 'left' }) {
  return (
    <div style={{ textAlign: align, maxWidth: 540 }}>
      {title ? (
        <div style={{
          fontFamily: F.serif, fontStyle: 'italic', fontSize: 18, fontWeight: 400,
          letterSpacing: -0.2, color: color || '#1a1a1a', lineHeight: 1.2,
        }}>{title}</div>
      ) : null}
      {body ? (
        <div style={{
          fontFamily: F.sans, fontSize: 12.5, fontWeight: 400,
          color: '#6b6b6b', lineHeight: 1.55, marginTop: title ? 5 : 0,
        }}>{body}</div>
      ) : null}
    </div>
  );
}

/* ── Specimen frame ─────────────────────────────────────────── */
/* A consistent card that holds the visual specimen, with its eyebrow
   above and caption below. Surface defaults to cream — pass `dark` for
   the noir variant. */
function Specimen({ eyebrow, title, body, dark, padded = true, h = 260, w, children, style }) {
  const bg = dark ? B.paper : B.creamHi;
  const inkColor = dark ? B.ink : '#1a1a1a';
  const dimColor = dark ? B.inkDim : '#6b6b6b';
  return (
    <div style={{ width: w || 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {eyebrow ? <Eyebrow color={dimColor}>{eyebrow}</Eyebrow> : null}
      <div style={{
        width: '100%', height: h, background: bg,
        borderRadius: 14,
        border: dark ? '1px solid ' + B.frame : '1px solid ' + B.creamLo,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: padded ? 24 : 0, overflow: 'hidden', position: 'relative',
        color: inkColor,
        ...style,
      }}>
        {children}
      </div>
      {(title || body) ? (
        <Caption title={title} body={body} color={inkColor} />
      ) : null}
    </div>
  );
}

/* ── The brand mark itself (white tile + three ink dots) ────── */
function MarkDot({ size = 80, tileBg, dotColor, radiusRatio = 0.22 }) {
  const tile = size;
  const tileR = tile * radiusRatio;
  const dotR = tile * 0.062;
  const gap  = tile * 0.21;
  const cx = tile / 2;
  const cy = tile / 2;
  return (
    <svg viewBox={`0 0 ${tile} ${tile}`} width={size} height={size} style={{ display: 'block', flex: 'none' }}>
      <rect x="0" y="0" width={tile} height={tile} rx={tileR} fill={tileBg || B.inkBright} />
      <g fill={dotColor || B.paper}>
        <circle cx={cx - gap} cy={cy} r={dotR} />
        <circle cx={cx}       cy={cy} r={dotR} />
        <circle cx={cx + gap} cy={cy} r={dotR} />
      </g>
    </svg>
  );
}

/* ── Wordmark "Three Sentences" — italic serif ──────────────── */
function Wordmark({ size = 32, color, weight = 400, italic = true, label = 'Three Sentences' }) {
  return (
    <span style={{
      fontFamily: F.serif, fontStyle: italic ? 'italic' : 'normal',
      fontWeight: weight, fontSize: size,
      letterSpacing: size > 40 ? -0.7 : -0.4,
      lineHeight: 1, color: color || '#1a1a1a',
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

/* ── Mono tagline ───────────────────────────────────────────── */
function MonoTag({ size = 11, children, color, tracking = 2 }) {
  return (
    <span style={{
      fontFamily: F.mono, fontSize: size, fontWeight: 500,
      letterSpacing: tracking, textTransform: 'uppercase',
      color: color || B.inkDim, lineHeight: 1,
    }}>{children}</span>
  );
}

/* ── A faint imagery placeholder (subtly striped) ───────────── */
function PhotoSlot({ w = 200, h = 260, label = 'Imagery' }) {
  return (
    <div style={{
      width: w, height: h, position: 'relative', overflow: 'hidden',
      background:
        'repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 6px, rgba(255,255,255,0) 6px 12px), #18181c',
      border: '1px solid ' + B.frame, borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <MonoTag size={9} color="rgba(235,231,220,0.45)" tracking={1.6}>{label}</MonoTag>
    </div>
  );
}

/* ── Cream swatch (color tile) ──────────────────────────────── */
function Swatch({ color, name, hex, role, w = 200, h = 132, dark }) {
  const onDark = dark || ['#0e0e10','#060608','#15151a','#1c1c22','#1e1e22','#36363a'].includes(color);
  const txt = onDark ? B.ink : '#1a1a1a';
  const dim = onDark ? B.inkDim : '#6b6b6b';
  return (
    <div style={{
      width: w, height: h, borderRadius: 8, padding: 14,
      background: color, color: txt, position: 'relative',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      border: onDark ? '1px solid ' + B.frame : '1px solid ' + B.creamLo,
    }}>
      <div style={{
        fontFamily: F.sans, fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
      }}>{name}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: dim, letterSpacing: 1, textTransform: 'uppercase' }}>{role}</div>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: txt, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.85 }}>{hex}</div>
      </div>
    </div>
  );
}

Object.assign(window, { B, F, Eyebrow, Caption, Specimen, MarkDot, Wordmark, MonoTag, PhotoSlot, Swatch });

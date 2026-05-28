/* brand/01-logo.jsx — Brand · Logo mark.
   The three-dot tile. Variants, sizing, clear space, and don'ts. */

/* ── Primary mark (white tile, ink dots) ───────────────────── */
function LogoPrimary() {
  return (
    <Specimen
      eyebrow="01.1 · Primary"
      title="The mark."
      body="A bone-white tile, three ink dots. The constraint made visible. Use this on noir surfaces and any photographic background. Tile radius is 22% of width — never round it more, never less."
      dark padded h={320} w={360}>
      <MarkDot size={210} />
    </Specimen>
  );
}

/* ── Reversed (ink tile, white dots) ───────────────────────── */
function LogoReversed() {
  return (
    <Specimen
      eyebrow="01.2 · Reversed"
      title="On cream."
      body="When the brand sits on a cream or paper surface, invert: ink tile, bone dots. Same proportions; only the swatches flip."
      padded h={320} w={360}>
      <MarkDot size={210} tileBg={B.paper} dotColor={B.inkBright} />
    </Specimen>
  );
}

/* ── Monochrome (single-color, no tile) ─────────────────────── */
function LogoMono() {
  return (
    <Specimen
      eyebrow="01.3 · Monochrome"
      title="One-color."
      body="When the medium can't carry a tile — a single foil colour, a debossed page, a favicon at 16px — drop the tile and use the three dots alone."
      dark padded h={320} w={360}>
      <svg viewBox="0 0 240 80" width="240" height="80" style={{ display: 'block' }}>
        <g fill={B.ink}>
          <circle cx={40}  cy={40} r={18} />
          <circle cx={120} cy={40} r={18} />
          <circle cx={200} cy={40} r={18} />
        </g>
      </svg>
    </Specimen>
  );
}

/* ── Sizes — show the mark across a real range ─────────────── */
function LogoSizes() {
  const sizes = [96, 64, 44, 32, 24, 16];
  return (
    <Specimen
      eyebrow="01.4 · Sizing ladder"
      title="From hero to favicon."
      body="The mark survives down to 16px. Below that, switch to the single-dot favicon variant (see system docs). Sizes shown: 96 / 64 / 44 / 32 / 24 / 16 px."
      dark h={320} w={760}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32 }}>
        {sizes.map((s) => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <MarkDot size={s} />
            <MonoTag size={9} color={B.inkDim} tracking={1.4}>{s}px</MonoTag>
          </div>
        ))}
      </div>
    </Specimen>
  );
}

/* ── Clear space (margin rules) ────────────────────────────── */
function LogoClearSpace() {
  /* Show the mark + dashed clear-space guides 1× the dot radius from each
     edge of the tile — the "minimum breathing room". */
  const tile = 180;
  const margin = tile * 0.25;
  return (
    <Specimen
      eyebrow="01.5 · Clear space"
      title="Breathing room."
      body="Keep a margin equal to one dot-diameter on every side of the tile. The unit (X) scales with the mark."
      dark h={320} w={420}>
      <div style={{
        position: 'relative',
        padding: margin,
        border: '1px dashed ' + B.frame,
        borderRadius: 4,
      }}>
        <MarkDot size={tile} />
        {/* X markers on each side */}
        {['top','bottom','left','right'].map((side) => (
          <div key={side} style={{
            position: 'absolute', fontFamily: F.mono, fontSize: 9,
            letterSpacing: 1.2, textTransform: 'uppercase', color: B.inkDim,
            ...(side === 'top'    ? { top: margin / 2 - 5, left: '50%', transform: 'translateX(-50%)' } : {}),
            ...(side === 'bottom' ? { bottom: margin / 2 - 5, left: '50%', transform: 'translateX(-50%)' } : {}),
            ...(side === 'left'   ? { left: margin / 2 - 6, top: '50%', transform: 'translateY(-50%)' } : {}),
            ...(side === 'right'  ? { right: margin / 2 - 6, top: '50%', transform: 'translateY(-50%)' } : {}),
          }}>X</div>
        ))}
      </div>
    </Specimen>
  );
}

/* ── Don'ts ────────────────────────────────────────────────── */
function LogoDonts() {
  const Cell = ({ children, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 130, height: 130, background: B.paper,
        border: '1px solid ' + B.frame, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {children}
        {/* Forbidden diagonal slash */}
        <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 130 130" preserveAspectRatio="none">
          <line x1="14" y1="14" x2="116" y2="116" stroke={B.warn} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <MonoTag size={9} color={B.warn} tracking={1.4}>{label}</MonoTag>
    </div>
  );
  return (
    <Specimen
      eyebrow="01.6 · Don't"
      title="What it isn't."
      body="The mark has one shape, one radius, one ratio. Do not rotate, recolor outside the system, stretch, add fills, or layer effects."
      dark padded h={320} w={760}>
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Cell label="don't rotate">
          <div style={{ transform: 'rotate(18deg)' }}><MarkDot size={80} /></div>
        </Cell>
        <Cell label="don't recolor">
          <MarkDot size={80} tileBg={B.warn} dotColor={B.paper} />
        </Cell>
        <Cell label="don't stretch">
          <div style={{ transform: 'scaleX(1.4) scaleY(0.75)' }}><MarkDot size={80} /></div>
        </Cell>
        <Cell label="don't outline">
          <svg viewBox="0 0 80 80" width="80" height="80">
            <rect x="2" y="2" width="76" height="76" rx="17.6" fill="none" stroke={B.ink} strokeWidth="2" />
            <g fill="none" stroke={B.ink} strokeWidth="2">
              <circle cx={23} cy={40} r={5} />
              <circle cx={40} cy={40} r={5} />
              <circle cx={57} cy={40} r={5} />
            </g>
          </svg>
        </Cell>
        <Cell label="don't add shadow">
          <div style={{ filter: 'drop-shadow(0 8px 12px rgba(246,193,119,0.5))' }}><MarkDot size={80} /></div>
        </Cell>
      </div>
    </Specimen>
  );
}

/* ── Registry ──────────────────────────────────────────────── */
const LOGO_ITEMS = [
  { id: 'logo-primary',  w: 384, h: 504, Render: LogoPrimary },
  { id: 'logo-reversed', w: 384, h: 504, Render: LogoReversed },
  { id: 'logo-mono',     w: 384, h: 504, Render: LogoMono },
  { id: 'logo-sizes',    w: 784, h: 504, Render: LogoSizes },
  { id: 'logo-clear',    w: 444, h: 504, Render: LogoClearSpace },
  { id: 'logo-donts',    w: 784, h: 504, Render: LogoDonts },
];

Object.assign(window, { LOGO_ITEMS });

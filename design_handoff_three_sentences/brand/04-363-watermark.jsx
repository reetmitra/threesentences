/* brand/04-watermark.jsx — Brand · 363 watermark.
   "The goal is 363/365, not 365/365." 363 is the brand's secret number.
   Treated as an oversized italic numeral watermark across surfaces. */

/* The 363 numeral itself — huge italic serif. */
function ThreeSixThree({ size = 280, color }) {
  return (
    <span style={{
      fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400,
      fontSize: size, lineHeight: 0.85, letterSpacing: -size * 0.028,
      color: color || B.ink, whiteSpace: 'nowrap', display: 'block',
    }}>363</span>
  );
}

/* ── Hero — the numeral, alone ─────────────────────────────── */
function WatermarkHero() {
  return (
    <Specimen
      eyebrow="04.1 · 363"
      title="The secret number."
      body="Three hundred sixty-three days a year. The goal is not perfection — it's the relentless return. The numeral is the brand's quiet pact with the practice."
      dark padded h={420} w={620}>
      <ThreeSixThree size={300} color={B.ink} />
    </Specimen>
  );
}

/* ── With ratio (363/365) ──────────────────────────────────── */
function WatermarkRatio() {
  return (
    <Specimen
      eyebrow="04.2 · Ratio"
      title="363 / 365."
      body="The ratio framed: the goal beside the year. Use the slash always at half the cap-height of the numerals. The denominator is half the weight."
      dark padded h={420} w={620}>
      <div style={{ display: 'flex', alignItems: 'baseline', color: B.ink }}>
        <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 240, lineHeight: 0.85, letterSpacing: -6 }}>363</span>
        <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 120, lineHeight: 0.85, color: B.inkFade, margin: '0 4px' }}>/</span>
        <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 110, lineHeight: 0.85, color: B.inkDim, letterSpacing: -2 }}>365</span>
      </div>
    </Specimen>
  );
}

/* ── Page watermark (placed on a page) ─────────────────────── */
function WatermarkPage() {
  return (
    <Specimen
      eyebrow="04.3 · Page watermark"
      title="Quietly behind."
      body="The numeral lives at the edge of editorial pages — bottom-right, bleeding off — at 8% opacity ink. Body content sits on top. Never let the watermark dominate."
      dark padded={false} h={420} w={620}
      style={{ alignItems: 'stretch', justifyContent: 'flex-start' }}>
      <div style={{ flex: 1, padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div>
          <MonoTag size={10} color={B.inkDim}>Letter from the editor</MonoTag>
          <div style={{ marginTop: 16, fontFamily: F.serif, fontStyle: 'italic', fontSize: 28, color: B.ink, lineHeight: 1.25, maxWidth: 380 }}>
            "You cannot be perfect, but you can be relentless."
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <MonoTag size={9} color={B.inkDim}>— The practice, week one</MonoTag>
        </div>
        {/* Watermark, bleeding off bottom-right */}
        <div style={{
          position: 'absolute', right: -28, bottom: -54,
          color: 'rgba(235,231,220,0.08)', pointerEvents: 'none',
        }}>
          <ThreeSixThree size={320} color="currentColor" />
        </div>
      </div>
    </Specimen>
  );
}

/* ── Milestone scale (other counts) ────────────────────────── */
function WatermarkScale() {
  const counts = [
    { n: 7,   label: 'A first week.' },
    { n: 30,  label: 'Days unbroken.' },
    { n: 100, label: 'A hundred days.' },
    { n: 363, label: 'Three hundred sixty-three.' },
  ];
  return (
    <Specimen
      eyebrow="04.4 · Milestones"
      title="The family."
      body="The numeral treatment scales to every milestone. Same italic, same tracking, different number — a small ladder the user climbs."
      dark padded h={420} w={780}>
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
        {counts.map(({ n, label }) => (
          <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 130 }}>
            <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 96, color: B.ink, lineHeight: 0.85, letterSpacing: -2 }}>{n}</span>
            <div style={{ height: 1, width: 28, background: B.inkFade }} />
            <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 13, color: B.inkDim, textAlign: 'center' }}>{label}</div>
          </div>
        ))}
      </div>
    </Specimen>
  );
}

/* ── Amber accent treatment ────────────────────────────────── */
function WatermarkAmber() {
  return (
    <Specimen
      eyebrow="04.5 · Crisis accent"
      title="Warmth, sparingly."
      body="The only colour the brand permits is a warm amber — used at the moment of crisis, milestone overflow, or 363 itself. Never decorative. Always meaningful."
      dark padded h={420} w={620}>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 240, color: B.warn, lineHeight: 0.85, letterSpacing: -6 }}>363</span>
      </div>
    </Specimen>
  );
}

const WATERMARK_ITEMS = [
  { id: 'wt-hero',  w: 644, h: 604, Render: WatermarkHero },
  { id: 'wt-ratio', w: 644, h: 604, Render: WatermarkRatio },
  { id: 'wt-page',  w: 644, h: 604, Render: WatermarkPage },
  { id: 'wt-scale', w: 804, h: 604, Render: WatermarkScale },
  { id: 'wt-amber', w: 644, h: 604, Render: WatermarkAmber },
];

Object.assign(window, { WATERMARK_ITEMS, ThreeSixThree });

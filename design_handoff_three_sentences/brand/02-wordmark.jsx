/* brand/02-wordmark.jsx — Brand · Wordmark.
   "Three Sentences" set in Newsreader italic. Pairings, sizes, lockups. */

/* ── The wordmark, hero ────────────────────────────────────── */
function WordmarkHero() {
  return (
    <Specimen
      eyebrow="02.1 · The wordmark"
      title="Three Sentences."
      body="Newsreader italic, regular weight, optical-size 36. The italic is the signature — never set the wordmark upright. Letter-spacing tightens to -0.7 at display sizes."
      dark padded h={320} w={760}>
      <Wordmark size={84} color={B.ink} />
    </Specimen>
  );
}

/* ── Sizes — wordmark across the scale ─────────────────────── */
function WordmarkSizes() {
  const sizes = [{ s: 72, l: 'Display' }, { s: 44, l: 'Page title' }, { s: 28, l: 'Section' }, { s: 18, l: 'Inline' }];
  return (
    <Specimen
      eyebrow="02.2 · Scale"
      title="Four sizes."
      body="Display for splash and milestones. Page title for tab headers. Section for cards. Inline for body and footers."
      dark padded h={420} w={760} style={{ alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26, width: '100%' }}>
        {sizes.map(({ s, l }) => (
          <div key={s} style={{ display: 'flex', alignItems: 'baseline', gap: 24, borderBottom: '1px solid ' + B.frame, paddingBottom: 14 }}>
            <Wordmark size={s} color={B.ink} />
            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <MonoTag size={9} color={B.inkDim} tracking={1.4}>{l}</MonoTag>
              <MonoTag size={9} color={B.inkDim} tracking={1.4}>{s}px / italic 400</MonoTag>
            </div>
          </div>
        ))}
      </div>
    </Specimen>
  );
}

/* ── Lockup A — horizontal (mark left, wordmark right) ─────── */
function LockupHorizontal() {
  return (
    <Specimen
      eyebrow="02.3 · Lockup · horizontal"
      title="Side by side."
      body="The default lockup. Mark height equals cap height of the wordmark; gap equals the mark's dot-spacing."
      dark h={260} w={620}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <MarkDot size={56} />
        <Wordmark size={42} color={B.ink} />
      </div>
    </Specimen>
  );
}

/* ── Lockup B — stacked (mark above) ───────────────────────── */
function LockupStacked() {
  return (
    <Specimen
      eyebrow="02.4 · Lockup · stacked"
      title="Centered, stacked."
      body="For square formats: avatars, splash, milestone overlay. Mark above, generous 1.2× gap, wordmark centered."
      dark h={300} w={300}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <MarkDot size={68} />
        <Wordmark size={30} color={B.ink} />
      </div>
    </Specimen>
  );
}

/* ── Lockup C — with tagline ────────────────────────────────── */
function LockupWithTag() {
  return (
    <Specimen
      eyebrow="02.5 · Lockup · with tagline"
      title="Signature."
      body="The full signature: mark + wordmark + the mono tagline beneath, set in IBM Plex Mono uppercase at 1.6× letter-spacing."
      dark h={300} w={500}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <MarkDot size={48} />
          <Wordmark size={36} color={B.ink} />
        </div>
        <div style={{ height: 1, width: 220, background: B.frame, opacity: 0.8 }} />
        <MonoTag size={11} color={B.ink} tracking={3.8}>Be better. Do better.</MonoTag>
      </div>
    </Specimen>
  );
}

/* ── Cream variant ─────────────────────────────────────────── */
function LockupOnCream() {
  return (
    <Specimen
      eyebrow="02.6 · On cream"
      title="Editorial."
      body="On paper or in print: ink wordmark, ink-tiled mark with bone dots. Same ratios."
      padded h={260} w={620}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <MarkDot size={56} tileBg={B.paper} dotColor={B.inkBright} />
        <Wordmark size={42} color={B.paper} />
      </div>
    </Specimen>
  );
}

const WORDMARK_ITEMS = [
  { id: 'wm-hero',    w: 784, h: 504, Render: WordmarkHero },
  { id: 'wm-sizes',   w: 784, h: 604, Render: WordmarkSizes },
  { id: 'wm-lockh',   w: 644, h: 444, Render: LockupHorizontal },
  { id: 'wm-lockv',   w: 324, h: 484, Render: LockupStacked },
  { id: 'wm-locktag', w: 524, h: 484, Render: LockupWithTag },
  { id: 'wm-cream',   w: 644, h: 444, Render: LockupOnCream },
];

Object.assign(window, { WORDMARK_ITEMS });

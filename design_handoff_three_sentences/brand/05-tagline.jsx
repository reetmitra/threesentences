/* brand/05-tagline.jsx — Brand · Tagline.
   "Be better. Do better." — mono uppercase, generous tracking.
   Variants for hero, signature, and an editorial pull-quote pairing. */

const PRIMARY_TAG = 'Be better. Do better.';

/* ── Hero tagline ──────────────────────────────────────────── */
function TaglineHero() {
  return (
    <Specimen
      eyebrow="05.1 · Tagline"
      title="Be better. Do better."
      body="IBM Plex Mono, weight 500, uppercase, letter-spacing 3.8. The period after each word matters — it is the rhythm of the practice."
      dark padded h={360} w={780}>
      <MonoTag size={26} color={B.ink} tracking={5.6}>BE BETTER. DO BETTER.</MonoTag>
    </Specimen>
  );
}

/* ── Signature pairing ─────────────────────────────────────── */
function TaglineSignature() {
  return (
    <Specimen
      eyebrow="05.2 · Signature"
      title="Quiet pairing."
      body="Below the wordmark, with a single hairline rule above. This is the email-footer, settings-screen, splash-bottom usage."
      dark padded h={340} w={620}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <Wordmark size={42} color={B.ink} />
        <div style={{ height: 1, width: 200, background: B.frame }} />
        <MonoTag size={12} color={B.ink} tracking={3.8}>BE BETTER. DO BETTER.</MonoTag>
      </div>
    </Specimen>
  );
}

/* ── Companion lines (the long-form taglines) ──────────────── */
function TaglineFamily() {
  const lines = [
    { eyebrow: 'Primary', text: 'Be better. Do better.', sub: 'The mantra. Used everywhere.' },
    { eyebrow: 'Long',    text: 'Three sentences a day.', sub: 'For onboarding and product copy.' },
    { eyebrow: 'Milestone', text: 'Days unbroken.', sub: 'Streak and counter use.' },
    { eyebrow: 'Philosophy',text: 'Show up. Do the work. Let go of perfection.', sub: 'Long-form — about pages, social.' },
  ];
  return (
    <Specimen
      eyebrow="05.3 · The family"
      title="One mantra, three companions."
      body="A small group of lines that share rhythm. Use the primary always; the others rotate by context."
      dark padded h={440} w={780} style={{ alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
        {lines.map((l, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 20,
            borderBottom: i < lines.length - 1 ? '1px solid ' + B.frame : 'none',
            paddingBottom: i < lines.length - 1 ? 16 : 0,
          }}>
            <div style={{ width: 90 }}>
              <MonoTag size={9} color={B.inkDim} tracking={1.6}>{l.eyebrow}</MonoTag>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 22, color: B.ink, lineHeight: 1.2 }}>"{l.text}"</div>
              <div style={{ fontFamily: F.sans, fontSize: 12, color: B.inkDim, lineHeight: 1.5 }}>{l.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </Specimen>
  );
}

/* ── Italic serif pull-quote variant ──────────────────────── */
function TaglineQuote() {
  return (
    <Specimen
      eyebrow="05.4 · As pull-quote"
      title="Editorial voice."
      body="When the tagline carries emotional weight — milestones, letters, dedications — switch it from mono to italic serif. The mantra softens."
      dark padded h={360} w={620}>
      <div style={{
        borderLeft: '2px solid ' + B.inkBright,
        paddingLeft: 22,
        maxWidth: 460,
      }}>
        <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 32, color: B.ink, lineHeight: 1.25, letterSpacing: -0.4 }}>
          Be better.<br />Do better.
        </div>
        <div style={{ marginTop: 16 }}>
          <MonoTag size={9} color={B.inkDim} tracking={1.6}>— The practice</MonoTag>
        </div>
      </div>
    </Specimen>
  );
}

/* ── On cream (inverted) ──────────────────────────────────── */
function TaglineCream() {
  return (
    <Specimen
      eyebrow="05.5 · On cream"
      title="Print variant."
      body="On paper or print — ink mono at the same tracking. The cream warms the type."
      h={340} w={620}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <Wordmark size={42} color={B.paper} />
        <div style={{ height: 1, width: 200, background: B.creamLo }} />
        <MonoTag size={12} color={B.paper} tracking={3.8}>BE BETTER. DO BETTER.</MonoTag>
      </div>
    </Specimen>
  );
}

const TAGLINE_ITEMS = [
  { id: 'tg-hero',     w: 804, h: 544, Render: TaglineHero },
  { id: 'tg-sig',      w: 644, h: 524, Render: TaglineSignature },
  { id: 'tg-family',   w: 804, h: 624, Render: TaglineFamily },
  { id: 'tg-quote',    w: 644, h: 544, Render: TaglineQuote },
  { id: 'tg-cream',    w: 644, h: 524, Render: TaglineCream },
];

Object.assign(window, { TAGLINE_ITEMS, PRIMARY_TAG });

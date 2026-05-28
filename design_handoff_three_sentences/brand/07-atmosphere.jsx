/* brand/07-atmosphere.jsx — Brand · Atmosphere.
   The mood the brand lives inside. Color, surface, light, type, imagery. */

/* ── Color palette ─────────────────────────────────────────── */
function AtmospherePalette() {
  const noir = [
    { color: B.paperOut,  name: 'Backdrop',  hex: '#060608', role: 'Outer canvas' },
    { color: B.paper,     name: 'Paper',     hex: '#0e0e10', role: 'Phone interior' },
    { color: B.surface,   name: 'Surface',   hex: '#15151a', role: 'Card surface' },
    { color: B.surfaceHi, name: 'Surface ↑', hex: '#1c1c22', role: 'Hover / toast' },
    { color: B.frame,     name: 'Frame',     hex: '#1e1e22', role: 'Hairline 1px' },
    { color: B.inkFade,   name: 'Ink fade',  hex: '#36363a', role: 'Placeholder' },
  ];
  const ink = [
    { color: B.inkDim,    name: 'Ink dim',   hex: '#75726a', role: 'Secondary' },
    { color: B.ink,       name: 'Ink',       hex: '#ebe7dc', role: 'Primary text' },
    { color: B.inkBright, name: 'Ink bright',hex: '#ffffff', role: 'Emphasis only' },
    { color: B.warn,      name: 'Warn',      hex: '#f6c177', role: 'Crisis · overflow' },
  ];
  return (
    <Specimen
      eyebrow="07.1 · Palette"
      title="Near-monochrome."
      body="Ten values, eight of them grey. Pure white is reserved for moments of emphasis. Warn amber is the only chromatic note, and it always carries meaning."
      dark padded h={520} w={780} style={{ alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
        <div>
          <MonoTag size={9} color={B.inkDim} tracking={1.6}>Noir surfaces</MonoTag>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 10 }}>
            {noir.map((s) => <Swatch key={s.hex} {...s} w="100%" h={120} />)}
          </div>
        </div>
        <div>
          <MonoTag size={9} color={B.inkDim} tracking={1.6}>Ink & accent</MonoTag>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 10 }}>
            {ink.map((s) => <Swatch key={s.hex} {...s} w="100%" h={120} />)}
          </div>
        </div>
      </div>
    </Specimen>
  );
}

/* ── Typography pairing ────────────────────────────────────── */
function AtmosphereType() {
  return (
    <Specimen
      eyebrow="07.2 · Type"
      title="Three families, three voices."
      body="Newsreader italic carries emotion. Schibsted Grotesk runs the UI. IBM Plex Mono whispers metadata. Never mix the roles."
      dark padded h={580} w={780} style={{ alignItems: 'stretch', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26, color: B.ink }}>
        {/* Serif */}
        <div style={{ borderBottom: '1px solid ' + B.frame, paddingBottom: 22, display: 'flex', alignItems: 'flex-end', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <MonoTag size={9} color={B.inkDim} tracking={1.6}>Newsreader · italic · 400</MonoTag>
            <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 56, lineHeight: 1.0, letterSpacing: -1, marginTop: 8 }}>
              Be better. Do better.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <MonoTag size={9} color={B.inkDim} tracking={1.4}>Display / H1 / H2</MonoTag>
            <MonoTag size={9} color={B.inkDim} tracking={1.4}>Quotes · milestones</MonoTag>
          </div>
        </div>
        {/* Sans */}
        <div style={{ borderBottom: '1px solid ' + B.frame, paddingBottom: 22, display: 'flex', alignItems: 'flex-end', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <MonoTag size={9} color={B.inkDim} tracking={1.6}>Schibsted Grotesk · 400 / 500 / 600</MonoTag>
            <div style={{ fontFamily: F.sans, fontSize: 22, lineHeight: 1.4, marginTop: 8, fontWeight: 400 }}>
              Three sentences. What happened today?
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <MonoTag size={9} color={B.inkDim} tracking={1.4}>UI · body · buttons</MonoTag>
          </div>
        </div>
        {/* Mono */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <MonoTag size={9} color={B.inkDim} tracking={1.6}>IBM Plex Mono · 500 · uppercase</MonoTag>
            <div style={{ marginTop: 8 }}>
              <MonoTag size={18} color={B.ink} tracking={2.4}>SUBMITTED · 9:14 PM · LOCKED</MonoTag>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <MonoTag size={9} color={B.inkDim} tracking={1.4}>Eyebrows · meta · dates</MonoTag>
          </div>
        </div>
      </div>
    </Specimen>
  );
}

/* ── Mood — a composition ──────────────────────────────────── */
function AtmosphereMood() {
  return (
    <Specimen
      eyebrow="07.3 · Mood"
      title="Quiet broadsheet."
      body="The brand reads like an editorial page — wide margins, italic openings, mono captions. The screen is the page. The page is the practice."
      dark padded={false} h={620} w={780}
      style={{ flexDirection: 'row', alignItems: 'stretch', justifyContent: 'flex-start' }}>
      {/* Left column: a quiet "page" */}
      <div style={{
        flex: 1, padding: 36, display: 'flex', flexDirection: 'column', gap: 22,
        borderRight: '1px solid ' + B.frame, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MarkDot size={32} />
          <Wordmark size={20} color={B.ink} />
        </div>
        <div>
          <MonoTag size={9} color={B.inkDim}>TUE · JUN 18</MonoTag>
          <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 38, color: B.ink, lineHeight: 1.15, marginTop: 14, letterSpacing: -0.6 }}>
            Three sentences.<br />What happened?
          </div>
        </div>
        <div style={{ fontFamily: F.serif, fontSize: 16, color: B.ink, lineHeight: 1.6, opacity: 0.85, maxWidth: 320 }}>
          The room held quiet until the kettle whistled. She wrote without looking up, the way one breathes in sleep.
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <MonoTag size={9} color={B.inkDim}>3 / 3 · ready</MonoTag>
          <MonoTag size={9} color={B.inkDim}>Day 142</MonoTag>
        </div>
        {/* Watermark — the 363 in the corner */}
        <div style={{ position: 'absolute', right: -18, bottom: -38, pointerEvents: 'none', color: 'rgba(235,231,220,0.05)' }}>
          <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 200, lineHeight: 0.85, letterSpacing: -4 }}>363</span>
        </div>
      </div>

      {/* Right column: imagery + meta */}
      <div style={{ width: 280, padding: 24, display: 'flex', flexDirection: 'column', gap: 18, background: B.surface }}>
        <PhotoSlot w="100%" h={200} label="Photography · soft window light" />
        <div>
          <MonoTag size={9} color={B.inkDim}>SURFACE TEXTURE</MonoTag>
          <div style={{
            marginTop: 8, height: 80, borderRadius: 8, border: '1px solid ' + B.frame,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), transparent 60%), ' +
                        'repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0 4px, transparent 4px 8px), #15151a',
          }} />
        </div>
        <div style={{ marginTop: 'auto' }}>
          <MonoTag size={9} color={B.inkDim}>SHADOW</MonoTag>
          <div style={{
            marginTop: 8, height: 60, borderRadius: 8,
            background: B.paper,
            boxShadow:
              '0 30px 60px -30px rgba(0,0,0,0.95),' +
              '0 12px 24px -12px rgba(0,0,0,0.6),' +
              'inset 0 0 0 1px rgba(255,255,255,0.025)',
          }} />
        </div>
      </div>
    </Specimen>
  );
}

/* ── Imagery direction ─────────────────────────────────────── */
function AtmosphereImagery() {
  return (
    <Specimen
      eyebrow="07.4 · Imagery"
      title="What to photograph."
      body="Quiet domestic stillness. Soft window light. A single object on a textured ground. Never groups of people, never marketing-bright. The image is a place to rest the eye, not the subject."
      dark padded h={420} w={780}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, width: '100%' }}>
        {[
          'window light, morning',
          'kettle, paper, table',
          'open notebook',
          'empty chair, dusk',
        ].map((l, i) => (
          <PhotoSlot key={i} w="100%" h={220} label={l} />
        ))}
      </div>
    </Specimen>
  );
}

/* ── Light & shadow specimen ───────────────────────────────── */
function AtmosphereLight() {
  return (
    <Specimen
      eyebrow="07.5 · Light"
      title="One source, low."
      body="Shadows are deep but soft. A single dramatic outer shadow on the phone frame. Never multi-directional, never colored, never blurred for decoration."
      dark padded h={420} w={620}>
      <div style={{
        width: 240, height: 320, borderRadius: 36, background: B.paper,
        boxShadow:
          '0 60px 120px -40px rgba(0,0,0,0.95),' +
          '0 30px 60px -30px rgba(0,0,0,0.6),' +
          'inset 0 0 0 1px rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 14,
      }}>
        <MarkDot size={44} />
        <Wordmark size={20} color={B.ink} />
        <MonoTag size={9} color={B.inkDim} tracking={2.4}>BE BETTER. DO BETTER.</MonoTag>
      </div>
    </Specimen>
  );
}

const ATMOSPHERE_ITEMS = [
  { id: 'at-palette',  w: 804, h: 704, Render: AtmospherePalette },
  { id: 'at-type',     w: 804, h: 764, Render: AtmosphereType },
  { id: 'at-mood',     w: 804, h: 804, Render: AtmosphereMood },
  { id: 'at-imagery',  w: 804, h: 604, Render: AtmosphereImagery },
  { id: 'at-light',    w: 644, h: 604, Render: AtmosphereLight },
];

Object.assign(window, { ATMOSPHERE_ITEMS });

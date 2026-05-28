/* brand/03-3hree.jsx — Brand · 3hree variant.
   A playful display wordmark where the numeral "3" replaces "Th".
   For social, casual use, merch, IG. */

/* The "3hree" word as a tightly composed unit. */
function ThreeWord({ size = 120, color }) {
  /* We render "3" and "hree" separately so we can hand-tune the kerning,
     because Newsreader's italic "3" overlaps the "h" naturally. */
  return (
    <span style={{
      fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400,
      fontSize: size, lineHeight: 1, letterSpacing: -0.04 * size,
      color: color || B.ink, whiteSpace: 'nowrap',
    }}>
      3<span style={{ marginLeft: -size * 0.06 }}>hree</span>
    </span>
  );
}

/* ── Hero: 3hree Sentences ─────────────────────────────────── */
function ThreeHero() {
  return (
    <Specimen
      eyebrow="03.1 · 3hree Sentences"
      title="The numeral is the brand."
      body="A display variant where the italic '3' replaces 'Th'. Reads as Three Sentences, signs as 3hree Sentences. Use for social, merch, captions — anywhere the brand needs to wink."
      dark padded h={360} w={780}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <ThreeWord size={132} color={B.ink} />
        <Wordmark size={42} color={B.ink} label="Sentences" />
      </div>
    </Specimen>
  );
}

/* ── Inline (single-line) ──────────────────────────────────── */
function ThreeInline() {
  return (
    <Specimen
      eyebrow="03.2 · Single line"
      title="Inline."
      body="When the variant must run on a single line — headers, t-shirt prints, bio strings. Spacing between the two words tightens to about 0.5× the cap-height."
      dark padded h={260} w={780}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <ThreeWord size={88} color={B.ink} />
        <Wordmark size={88} color={B.ink} label="Sentences" />
      </div>
    </Specimen>
  );
}

/* ── How the numeral works (anatomy) ──────────────────────── */
function ThreeAnatomy() {
  return (
    <Specimen
      eyebrow="03.3 · Anatomy"
      title="Why it reads."
      body="The italic 3 in Newsreader leans into the next glyph; the bowls echo the 'h' ascender. Together they re-sound 'Three' instinctively. Other typefaces will not do this — Newsreader only."
      dark padded h={420} w={620}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{ position: 'relative' }}>
          <ThreeWord size={150} color={B.ink} />
          {/* Annotation arrows */}
          <div style={{
            position: 'absolute', top: -22, left: 6,
            fontFamily: F.mono, fontSize: 9, color: B.warn,
            letterSpacing: 1.4, textTransform: 'uppercase',
          }}>numeral</div>
          <div style={{
            position: 'absolute', top: -22, left: 92,
            fontFamily: F.mono, fontSize: 9, color: B.inkDim,
            letterSpacing: 1.4, textTransform: 'uppercase',
          }}>roman italic</div>
          {/* Underline ticks */}
          <svg style={{ position: 'absolute', left: 0, bottom: -16, width: 240, height: 14, display: 'block' }} viewBox="0 0 240 14">
            <path d="M 6 4 L 6 10 L 86 10 L 86 4" stroke={B.warn} strokeWidth="1" fill="none" />
            <path d="M 96 4 L 96 10 L 236 10 L 236 4" stroke={B.inkDim} strokeWidth="1" fill="none" />
          </svg>
        </div>
        <div style={{ display: 'flex', gap: 28, marginTop: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 56, color: B.ink, lineHeight: 1 }}>3</span>
            <MonoTag size={9} color={B.inkDim} tracking={1.4}>tabular figure</MonoTag>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 56, color: B.ink, lineHeight: 1 }}>h</span>
            <MonoTag size={9} color={B.inkDim} tracking={1.4}>ascender</MonoTag>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 56, color: B.ink, lineHeight: 1 }}>ree</span>
            <MonoTag size={9} color={B.inkDim} tracking={1.4}>lowercase</MonoTag>
          </div>
        </div>
      </div>
    </Specimen>
  );
}

/* ── Use cases — IG bio, captions, sticker ─────────────────── */
function ThreeUses() {
  return (
    <Specimen
      eyebrow="03.4 · Where it lives"
      title="Casual surfaces."
      body="Not the legal name — the everyday name. The variant lives on social, merch, stickers and captions. The wordmark stays the primary form for product and press."
      dark h={360} w={780}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* IG handle */}
        <div style={{
          background: B.surface, border: '1px solid ' + B.frame, borderRadius: 12,
          padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6, width: 200,
        }}>
          <MonoTag size={9} color={B.inkDim}>IG handle</MonoTag>
          <div style={{ fontFamily: F.sans, fontSize: 18, color: B.ink, fontWeight: 500 }}>@3hreesentences</div>
        </div>
        {/* Round sticker */}
        <div style={{
          width: 140, height: 140, borderRadius: 999, background: B.ink, color: B.paper,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        }}>
          <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 56, lineHeight: 1 }}>3</span>
          <MonoTag size={8} color={B.paper} tracking={2}>SENTENCES</MonoTag>
        </div>
        {/* Caption */}
        <div style={{
          background: B.surface, border: '1px solid ' + B.frame, borderRadius: 12,
          padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 240,
        }}>
          <MonoTag size={9} color={B.inkDim}>Caption</MonoTag>
          <div style={{ fontFamily: F.sans, fontSize: 13, color: B.ink, lineHeight: 1.5 }}>
            Day 42 of <ThreeWord size={15} color={B.ink} /> Sentences. The constraint is the point.
          </div>
        </div>
      </div>
    </Specimen>
  );
}

const THREE_ITEMS = [
  { id: 'tv-hero',    w: 804, h: 544, Render: ThreeHero },
  { id: 'tv-inline',  w: 804, h: 444, Render: ThreeInline },
  { id: 'tv-anatomy', w: 644, h: 604, Render: ThreeAnatomy },
  { id: 'tv-uses',    w: 804, h: 544, Render: ThreeUses },
];

Object.assign(window, { THREE_ITEMS, ThreeWord });

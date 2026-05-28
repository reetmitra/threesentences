/* brand/06-icons.jsx — Brand · Icons (Lucide-style).
   Outline icons, 1.5 stroke, currentColor. Matches the app's 15-icon set. */

const ICON_STROKE = 1.5;

const I = {
  plus: (
    <g><path d="M12 5v14M5 12h14" /></g>
  ),
  bell: (
    <g>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </g>
  ),
  chat: (
    <g>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </g>
  ),
  edit: (
    <g>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </g>
  ),
  search: (
    <g>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </g>
  ),
  flame: (
    <g>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.4 0 2.5-1.1 2.5-2.5 0-1.9-1.5-2.7-2.5-4-1.6-2-1-5 2.5-7-.5 3 2 4.4 3 6 1 1.5 1 4-1 6-2 2-6 2-6 2-1.5 0-3-.5-4-1.5z" />
    </g>
  ),
  spark: (
    <g>
      <path d="M12 3l1.5 6L20 12l-6.5 1.5L12 21l-1.5-7.5L4 12l6.5-1.5L12 3z" />
    </g>
  ),
  caret: (
    <g><path d="M9 6l6 6-6 6" /></g>
  ),
  check: (
    <g><path d="M20 6L9 17l-5-5" /></g>
  ),
  close: (
    <g><path d="M18 6L6 18M6 6l12 12" /></g>
  ),
  arrowUp: (
    <g><path d="M12 19V5M5 12l7-7 7 7" /></g>
  ),
  arrowL: (
    <g><path d="M19 12H5M12 19l-7-7 7-7" /></g>
  ),
  more: (
    <g>
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="5"  cy="12" r="1.4" fill="currentColor" stroke="none" />
    </g>
  ),
  lock: (
    <g>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </g>
  ),
  wifi: (
    <g>
      <path d="M5 12.55a11 11 0 0 1 14 0" />
      <path d="M8.5 16.1a6 6 0 0 1 7 0" />
      <circle cx="12" cy="19.5" r="0.8" fill="currentColor" stroke="none" />
    </g>
  ),
};

const ICON_NAMES = [
  ['plus', 'Add'],
  ['bell', 'Notify'],
  ['chat', 'Message'],
  ['edit', 'Edit'],
  ['search', 'Search'],
  ['flame', 'Streak'],
  ['spark', 'AI'],
  ['caret', 'Disclose'],
  ['check', 'Confirm'],
  ['close', 'Dismiss'],
  ['arrowUp', 'Send'],
  ['arrowL', 'Back'],
  ['more', 'Overflow'],
  ['lock', 'Locked'],
  ['wifi', 'Signal'],
];

function Icon({ name, size = 22, color, stroke = ICON_STROKE }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flex: 'none' }}>
      {I[name]}
    </svg>
  );
}

/* ── Hero: the full grid ───────────────────────────────────── */
function IconsGrid() {
  return (
    <Specimen
      eyebrow="06.1 · The set"
      title="Fifteen icons."
      body="A complete UI set drawn at 24px on a 1.5 stroke. Outline only — the brand never uses filled glyphs except for the streak flame, sentence dots, and unread badges."
      dark padded h={620} w={780} style={{ alignItems: 'stretch' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1,
        background: B.frame, border: '1px solid ' + B.frame, borderRadius: 12,
        overflow: 'hidden', width: '100%',
      }}>
        {ICON_NAMES.map(([name, label]) => (
          <div key={name} style={{
            background: B.paper, padding: '24px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: B.ink,
          }}>
            <Icon name={name} size={28} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ fontFamily: F.sans, fontSize: 12, color: B.ink, fontWeight: 500 }}>{label}</div>
              <MonoTag size={8.5} color={B.inkDim} tracking={1.2}>{name}</MonoTag>
            </div>
          </div>
        ))}
      </div>
    </Specimen>
  );
}

/* ── Sizes ─────────────────────────────────────────────────── */
function IconSizes() {
  const sizes = [
    { s: 14, l: 'Status bar' },
    { s: 16, l: 'Inline' },
    { s: 18, l: 'Header' },
    { s: 22, l: 'Tab bar' },
    { s: 32, l: 'Hero' },
    { s: 44, l: 'Decorative' },
  ];
  return (
    <Specimen
      eyebrow="06.2 · Sizes"
      title="Six step ladder."
      body="The icons live at six sizes — keep them strict. Status bar 14, inline 16, header 18, tab bar 22, hero 32, decorative 44."
      dark padded h={420} w={780}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 30, color: B.ink }}>
        {sizes.map(({ s, l }) => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="spark" size={s} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <MonoTag size={9} color={B.inkDim} tracking={1.4}>{l}</MonoTag>
              <MonoTag size={9} color={B.ink} tracking={1.4}>{s}px</MonoTag>
            </div>
          </div>
        ))}
      </div>
    </Specimen>
  );
}

/* ── Stroke spec ───────────────────────────────────────────── */
function IconStroke() {
  return (
    <Specimen
      eyebrow="06.3 · Stroke"
      title="1.5 always."
      body="Stroke weight is fixed at 1.5 across every icon and every size. Caps and joins are round. Never scale stroke proportionally — the icons read consistently across the scale."
      dark padded h={420} w={620}>
      <div style={{ display: 'flex', gap: 36, alignItems: 'center', color: B.ink }}>
        {[1, 1.5, 2].map((w, i) => (
          <div key={w} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
            <Icon name="bell" size={64} stroke={w} color={i === 1 ? B.ink : B.inkDim} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <MonoTag size={9} color={i === 1 ? B.warn : B.inkDim} tracking={1.4}>
                {i === 1 ? '★ correct' : `${w}px`}
              </MonoTag>
              <MonoTag size={9} color={B.inkDim} tracking={1.4}>stroke {w}</MonoTag>
            </div>
          </div>
        ))}
      </div>
    </Specimen>
  );
}

/* ── In use (a tab bar) ────────────────────────────────────── */
function IconsInUse() {
  const tabs = [
    { name: 'edit',   l: 'Today',    active: true  },
    { name: 'search', l: 'History',  active: false },
    { name: 'chat',   l: 'Circle',   active: false },
    { name: 'spark',  l: 'Insights', active: false },
    { name: 'more',   l: 'Settings', active: false },
  ];
  return (
    <Specimen
      eyebrow="06.4 · In use"
      title="The bottom rail."
      body="Five icons in the tab bar — active gets ink-bright with a 4px dot underneath. Inactive sits at 55% opacity."
      dark padded h={300} w={780}>
      <div style={{
        width: 360, background: B.paper, border: '1px solid ' + B.frame, borderRadius: 28,
        padding: '14px 18px 22px', display: 'flex', justifyContent: 'space-between',
      }}>
        {tabs.map(({ name, l, active }) => (
          <div key={name} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            color: active ? B.inkBright : B.inkDim, opacity: active ? 1 : 0.55,
          }}>
            <Icon name={name} size={22} stroke={active ? 1.6 : 1.5} />
            <div style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: 0.1 }}>{l}</div>
            {active ? <div style={{ width: 4, height: 4, borderRadius: 2, background: B.inkBright, marginTop: 1 }} /> : null}
          </div>
        ))}
      </div>
    </Specimen>
  );
}

const ICONS_ITEMS = [
  { id: 'ic-grid',   w: 804, h: 804, Render: IconsGrid },
  { id: 'ic-sizes',  w: 804, h: 604, Render: IconSizes },
  { id: 'ic-stroke', w: 644, h: 604, Render: IconStroke },
  { id: 'ic-use',    w: 804, h: 484, Render: IconsInUse },
];

Object.assign(window, { ICONS_ITEMS, Icon });

/* proto-shell.jsx — Three Sentences interactive prototype.
   Hi-fi noir aesthetic, shared primitives, navigation context, persistent state. */

/* ── Design tokens ───────────────────────────────────────────── */
const INK        = '#ebe7dc';
const INK_BRIGHT = '#ffffff';
const INK_DIM    = '#75726a';
const INK_FADE   = '#36363a';
const PAPER      = '#0e0e10';
const PAPER_BG   = '#060608';
const FRAME      = '#1e1e22';
const SURFACE    = '#15151a';
const SURFACE_HI = '#1c1c22';
const ACCENT     = '#ffffff';
const WARN       = '#f6c177';

const SANS  = "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif";
const SERIF = "'Newsreader', 'Iowan Old Style', 'Times New Roman', serif";
const MONO  = "'IBM Plex Mono', ui-monospace, monospace";

const PHONE_W = 360;
const PHONE_H = 760;

/* ── Icons ───────────────────────────────────────────────────── */
const I = {
  plus:    (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>),
  bell:    (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 7a4 4 0 0 1 8 0v4l1.5 2h-11L4 11V7Zm2.5 8a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>),
  chat:    (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7l-3 3v-3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>),
  edit:    (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2L6 12H4v-2l7.5-7.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>),
  search:  (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.3" /><path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>),
  flame:   (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2c0 3 3 3.5 3 6.5a3 3 0 0 1-6 0c0-1.5 1-2.5 1.5-3 0 2 1.5 2.5 1.5 2.5C8.75 6 7.5 4.5 8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>),
  spark:   (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M12 4l-2 2M6 10l-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>),
  caret:   (<svg width="10" height="14" viewBox="0 0 10 14" fill="none"><path d="M3 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  check:   (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  close:   (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>),
  arrowUp: (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  arrowL:  (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  more:    (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="3" cy="8" r="1.2" fill="currentColor"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="13" cy="8" r="1.2" fill="currentColor"/></svg>),
  lock:    (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3.5" y="7" width="9" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3"/></svg>),
  wifi:    (<svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 3.5a9 9 0 0 1 12 0M3 5.5a6 6 0 0 1 8 0M5 7.5a3 3 0 0 1 4 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><circle cx="7" cy="9" r="0.8" fill="currentColor" /></svg>),
};

const TAB_ICONS = {
  today: (<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M15 3l4 4-11 11H4v-4L15 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M14 4l4 4" stroke="currentColor" strokeWidth="1.4" /></svg>),
  history: (<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M3 9h16" stroke="currentColor" strokeWidth="1.4" /><path d="M7 3v4M15 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>),
  social: (<svg width="24" height="22" viewBox="0 0 24 22" fill="none"><circle cx="9" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.4" /><circle cx="16.5" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.4" /><path d="M2.5 18.5C2.5 16 5.5 14 9 14s6.5 2 6.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M16 14c2.5 0 5.5 1.4 5.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>),
  insights: (<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="12" width="3.5" height="7" rx="0.7" stroke="currentColor" strokeWidth="1.4" /><rect x="9.25" y="8" width="3.5" height="11" rx="0.7" stroke="currentColor" strokeWidth="1.4" /><rect x="15.5" y="3" width="3.5" height="16" rx="0.7" stroke="currentColor" strokeWidth="1.4" /></svg>),
  settings: (<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="2.6" stroke="currentColor" strokeWidth="1.4" /><path d="M11 2v2.8M11 17.2V20M3.5 11H1.5M20.5 11h-2M6 6l-1.6-1.6M17.6 17.6L16 16M6 16l-1.6 1.6M17.6 4.4L16 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>),
};

/* ── Tiny helpers ────────────────────────────────────────────── */
const Row = ({ children, gap = 8, align = 'center', justify = 'flex-start', style = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: align, justifyContent: justify, gap, ...style }}>{children}</div>
);
const Col = ({ children, gap = 8, style = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>
);

/* ── Persistent state context ─────────────────────────────────── */
const STORAGE_KEY = 'ts-proto-v1';

/* Seed entries: 28 days of June leading into "today" (Jun 18) */
const TODAY = { y: 2026, m: 5, d: 18 }; // June 18 2026 (Tue)
const TODAY_KEY = '2026-06-18';

function dKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function fmtDate(y, m, d) {
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dow = new Date(y, m, d).getDay();
  return { dow: DAYS[dow], month: MONTHS[m], day: d, year: y };
}
function fmtShort(y, m, d) {
  const x = fmtDate(y, m, d);
  return `${x.dow} · ${x.month.slice(0,3)} ${x.day}`;
}

const SEED_ENTRIES = (() => {
  // Pre-written sentences (3 each) for days 1..17, with a couple missing
  const lib = [
    ['The morning rain blurred the city into watercolour.', 'I walked the long way to the office to feel the cold.', 'A stranger held the door for me and said good morning like she meant it.'],
    ['The first coffee was bitter and I drank it slowly anyway.', 'I noticed how quiet the floor is before nine.', 'I sent a difficult email and felt lighter the instant it left.'],
    ['Lunch with Mara — she said I look less tired this week.', 'Spent twenty minutes sketching in the margin of my notebook.', 'Reread an old letter from my brother and laughed in the elevator.'],
    ['Skipped the gym; walked instead.', 'Realized I have been holding my shoulders up around my ears.', 'Slept eight hours for the first time in I cannot remember.'],
    ['The kettle hissed before I could touch my phone.', 'I caught the rain stopping mid-afternoon and stood in the doorway.', 'Closed the laptop at six and did not open it again.'],
    ['A bad meeting that I survived.', 'A short walk that made it forgivable.', 'A long conversation with my mother that mattered.'],
    null, // missed
    ['Read forty pages of the new novel.', 'No screens after dinner.', 'Slept with the window open.'],
    ['Practice run, slow but steady.', 'My knees held up.', 'Felt the small joy of returning home tired.'],
    ['The light through the kitchen window at four in the afternoon.', 'I noticed it before checking the time.', 'I let myself stand still for a minute.'],
    ['Lost my temper briefly.', 'Apologized within the hour.', 'Sat with the embarrassment instead of explaining it away.'],
    ['Cooked a real dinner.', 'Used the good plates.', 'Lit one candle for no occasion.'],
    null, // missed
    ['The dentist was kinder than I deserved.', 'A friend cancelled and I felt mostly relief.', 'I went to bed early without guilt.'],
    ['I almost reached for the phone in the elevator and did not.', 'Wrote a single page by hand.', 'Made it to Friday with something left over.'],
    ['Saturday market — bought peaches and a small lemon.', 'Read in the park with the sun on my face.', 'Talked to a child about a pigeon.'],
    ['Sunday slow.', 'Long bath, no plans.', 'Mended the seam on my favourite shirt.'],
  ];
  const out = {};
  for (let d = 1; d <= 17; d++) {
    const s = lib[d - 1];
    if (s) out[dKey(2026, 5, d)] = { sentences: s, submittedAt: `21:${10 + d}` };
  }
  return out;
})();

const SEED_PROMPTS = [
  'What did you notice today that you usually don\u2019t?',
  'Where did you feel most yourself today?',
  'What did you let go of without grieving?',
  'Who deserves a thank you you have not sent?',
  'What did your hands do today besides type?',
];

const SEED_FRIENDS = [
  { id: 'maya',   name: 'Maya Howell',    handle: '@maya_h',    streak: 21, lastMsg: 'Walked to work in the rain today.', unread: 2, avatar: '#c8b6a6' },
  { id: 'jules',  name: 'Jules Park',     handle: '@jules.p',   streak: 7,  lastMsg: 'I read your June 14 entry…',         unread: 1, avatar: '#a3b6c8' },
  { id: 'ren',    name: 'Ren Okafor',     handle: '@ren_o',     streak: 64, lastMsg: 'Reread Berger last night.',          unread: 0, avatar: '#b6c8a6' },
  { id: 'iris',   name: 'Iris Sandoval',  handle: '@iris.s',    streak: 4,  lastMsg: 'See you Friday.',                     unread: 0, avatar: '#c8a6b8' },
  { id: 'theo',   name: 'Theo Lin',       handle: '@theo_l',    streak: 31, lastMsg: 'The kettle bit got me.',              unread: 0, avatar: '#c8c2a6' },
  { id: 'noor',   name: 'Noor Halabi',    handle: '@noor.h',    streak: 12, lastMsg: 'Sending a small thing.',              unread: 0, avatar: '#a6c8c2' },
];
const SEED_REQUESTS = [
  { id: 'sam',  name: 'Sam Cole',     handle: '@samcole',     mutual: '3 mutuals',  avatar: '#b6a6c8' },
  { id: 'aida', name: 'Aida Reyes',   handle: '@aidareyes',   mutual: '1 mutual',   avatar: '#c8b6c2' },
];
const SEED_SUGGESTED = [
  { id: 'kai',  name: 'Kai Holloway',  handle: '@kai_h',       mutual: '5 mutuals',  avatar: '#bfa6c8' },
  { id: 'lin',  name: 'Lin Sato',      handle: '@linsato',     mutual: '2 mutuals',  avatar: '#a6c0c8' },
];

const SEED_CHAT_MAYA = [
  { from: 'them', text: 'I read your June 14 entry. The dentist line stayed with me.', t: '8:42 AM' },
  { from: 'me',   text: 'He was so gentle I almost cried. Thanks for noticing.', t: '8:44 AM' },
  { from: 'them', text: 'How did the rest of the day land?', t: '8:45 AM' },
  { from: 'me',   text: 'Quiet. I walked the long way home and bought peaches.', t: '8:46 AM' },
  { from: 'them', text: 'Send a picture of the peaches.', t: '8:47 AM' },
];

const defaultState = () => ({
  // App flow
  flow: 'splash',        // splash | login | signup | profile | interests | onboard | app
  onboardStep: 0,
  tab: 'today',          // today | history | social | insights | settings
  modal: null,           // null | 'historyEntry:{date}' | 'chat:{id}' | 'reflect' | 'milestone' | 'crisis' | 'reflect-off' | 'profile' | 'requests' | 'conversations'
  // User
  user: { name: 'Maya Howell', handle: '@maya_h', interests: ['mindfulness','art','reading'], bio: 'On a quiet practice. Reading Berger. Walking more.' },
  // Today
  draft: '',
  entries: SEED_ENTRIES, // keyed by 'YYYY-MM-DD'
  // Friends
  friends: SEED_FRIENDS,
  requests: SEED_REQUESTS,
  suggested: SEED_SUGGESTED,
  // Settings
  prefs: {
    aiReflection: true,
    notifications: true,
    dailyPrompt: true,
    reminderTime: '8:00 PM',
    crisisDetection: true,
    online: true,
  },
  // Chat
  chats: { maya: SEED_CHAT_MAYA },
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const stored = JSON.parse(raw);
    // Merge with defaults so additions stay safe
    return { ...defaultState(), ...stored, prefs: { ...defaultState().prefs, ...(stored.prefs || {}) } };
  } catch (e) {
    return defaultState();
  }
}

const AppCtx = React.createContext(null);

function AppProvider({ children }) {
  const [state, setStateRaw] = React.useState(loadState);

  // Persist
  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  const set = React.useCallback((patch) => {
    setStateRaw((s) => {
      const next = typeof patch === 'function' ? patch(s) : { ...s, ...patch };
      return next;
    });
  }, []);

  const reset = React.useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    setStateRaw(defaultState());
  }, []);

  /* derived */
  const streak = React.useMemo(() => computeStreak(state.entries), [state.entries]);
  const todayEntry = state.entries[TODAY_KEY] || null;
  const totalEntries = Object.keys(state.entries).length;

  const value = { state, set, reset, streak, todayEntry, totalEntries };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
const useApp = () => React.useContext(AppCtx);

/* Sentence parsing — split on . ! ? newline; treat trimmed segments as sentences */
function countSentences(text) {
  if (!text) return 0;
  // Split on sentence enders; only count segments that end with a terminator OR a newline
  const parts = text.match(/[^.!?\n]+[.!?]+|[^.!?\n]+\n/g) || [];
  return parts.map((s) => s.trim()).filter(Boolean).length;
}
function splitSentences(text) {
  if (!text) return [];
  const parts = text.match(/[^.!?\n]+[.!?]+|[^.!?\n]+\n/g) || [];
  return parts.map((s) => s.trim()).filter(Boolean);
}

/* Streak: walk backwards from today through consecutive entries */
function computeStreak(entries) {
  let streak = 0;
  const d = new Date(TODAY.y, TODAY.m, TODAY.d);
  // If today not written, start from yesterday
  if (!entries[dKey(d.getFullYear(), d.getMonth(), d.getDate())]) d.setDate(d.getDate() - 1);
  while (entries[dKey(d.getFullYear(), d.getMonth(), d.getDate())]) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/* ── Phone frame ──────────────────────────────────────────────── */
function PhoneFrame({ children }) {
  return (
    <div className="pt-phone" style={{
      width: PHONE_W, height: PHONE_H,
      borderRadius: 50,
      border: `1px solid ${FRAME}`,
      background: PAPER,
      color: INK,
      position: 'relative',
      fontFamily: SANS,
      fontSize: 14,
      lineHeight: 1.4,
      overflow: 'hidden',
      boxShadow: '0 60px 120px -40px rgba(0,0,0,0.95), 0 30px 60px -30px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.025)',
      display: 'flex', flexDirection: 'column',
    }}>
      {children}
    </div>
  );
}

function StatusBar({ online = true }) {
  return (
    <div style={{
      height: 50, padding: '16px 28px 0',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: INK, letterSpacing: -0.2 }}>9:41</div>
      <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 108, height: 30, borderRadius: 16, background: '#000' }} />
      <Row gap={6} align="center" style={{ color: INK }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          {[3, 5, 7, 9].map((h, i) => <rect key={i} x={i * 3.8} y={11 - h} width="2.8" height={h} rx="0.4" fill="currentColor" />)}
        </svg>
        {online ? I.wifi : (
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 3.5a9 9 0 0 1 12 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.25" />
            <path d="M3 1.5L12 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <div style={{ width: 24, height: 12, borderRadius: 3, border: `1px solid ${INK}`, padding: 1.5 }}>
            <div style={{ width: '80%', height: '100%', background: INK, borderRadius: 1 }} />
          </div>
          <div style={{ width: 1.5, height: 4, background: INK, borderRadius: 1, opacity: 0.6 }} />
        </div>
      </Row>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div style={{
      position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)',
      width: 120, height: 5, background: INK, opacity: 0.5, borderRadius: 3, pointerEvents: 'none', zIndex: 50,
    }} />
  );
}

/* ── Tab bar ──────────────────────────────────────────────────── */
function TabBar() {
  const { state, set } = useApp();
  const order = ['today', 'history', 'social', 'insights', 'settings'];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderTop: `1px solid ${FRAME}`,
      padding: '14px 28px 30px',
      flexShrink: 0,
      background: PAPER,
    }}>
      {order.map((k) => {
        const isActive = state.tab === k;
        return (
          <button key={k} onClick={() => set({ tab: k, modal: null })} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
            color: isActive ? INK_BRIGHT : INK_DIM,
            opacity: isActive ? 1 : 0.55,
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 4,
          }}>
            <div style={{ transform: 'scale(1.05)', display: 'flex' }}>{TAB_ICONS[k]}</div>
            <span style={{
              width: 4, height: 4, borderRadius: '50%',
              background: isActive ? INK_BRIGHT : 'transparent',
            }} />
          </button>
        );
      })}
    </div>
  );
}

/* ── Header (sub-screens within tabs) ─────────────────────────── */
function PageHeader({ title, sub, large = false, right = null, back = null }) {
  if (large) {
    return (
      <Col gap={6} style={{ padding: '10px 24px 16px', flexShrink: 0 }}>
        {sub ? <div style={{ fontFamily: MONO, fontSize: 11, color: INK_DIM, letterSpacing: 1.6, textTransform: 'uppercase' }}>{sub}</div> : null}
        <Row justify="space-between" align="center">
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: INK, letterSpacing: -0.6, lineHeight: 1.05 }}>{title}</div>
          {right ? <div style={{ color: INK, display: 'flex' }}>{right}</div> : null}
        </Row>
      </Col>
    );
  }
  return (
    <Row justify="space-between" align="center" style={{ padding: '10px 18px 14px', borderBottom: `1px solid ${FRAME}`, flexShrink: 0 }}>
      <button onClick={back} disabled={!back} style={{
        width: 28, color: INK, lineHeight: 1, background: 'transparent', border: 'none',
        cursor: back ? 'pointer' : 'default', padding: 0, display: 'flex', alignItems: 'center',
        opacity: back ? 1 : 0,
      }}>{I.arrowL}</button>
      <Col gap={2} style={{ alignItems: 'center' }}>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK, letterSpacing: -0.1 }}>{title}</div>
        {sub ? <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1, textTransform: 'uppercase' }}>{sub}</div> : null}
      </Col>
      <div style={{ width: 28, textAlign: 'right', color: INK, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </Row>
  );
}

/* ── Pill button ──────────────────────────────────────────────── */
function Btn({ children, onClick, fill = false, ghost = false, dim = false, disabled = false, w = '100%', h = 50, style = {} }) {
  let bg = 'transparent', fg = INK, border = INK;
  if (fill)  { bg = INK_BRIGHT; fg = '#0a0a0a'; border = INK_BRIGHT; }
  if (ghost) { bg = 'transparent'; fg = INK; border = FRAME; }
  if (dim || disabled) { bg = 'transparent'; fg = INK_DIM; border = INK_FADE; }
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      width: w, height: h,
      borderRadius: 999,
      border: `1px solid ${border}`,
      background: bg,
      color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SANS, fontSize: 15, fontWeight: 500, lineHeight: 1, letterSpacing: 0.3,
      padding: '4px 18px',
      whiteSpace: 'nowrap',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'transform 120ms ease, opacity 120ms ease',
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}>
      {children}
    </button>
  );
}

/* ── Chip ─────────────────────────────────────────────────────── */
function Chip({ children, onClick, on = false, mono = true }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 999,
      border: `1px solid ${on ? INK : FRAME}`,
      background: on ? INK : 'transparent',
      color: on ? '#0a0a0a' : INK_DIM,
      fontFamily: mono ? MONO : SANS,
      fontSize: mono ? 10 : 12,
      letterSpacing: mono ? 1.2 : 0.2,
      textTransform: mono ? 'uppercase' : 'none',
      cursor: 'pointer',
      fontWeight: 500,
    }}>{children}</button>
  );
}

/* ── Avatar ───────────────────────────────────────────────────── */
function Avatar({ color = '#c8b6a6', size = 42, name = '' }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 60%, #000))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#0e0e10', fontFamily: SANS,
      fontSize: size * 0.38, fontWeight: 600, letterSpacing: -0.3,
      flexShrink: 0,
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
    }}>{initials}</div>
  );
}

/* ── Toggle switch ────────────────────────────────────────────── */
function Switch({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 44, height: 26, borderRadius: 999,
      background: on ? INK_BRIGHT : SURFACE,
      border: `1px solid ${on ? INK_BRIGHT : FRAME}`,
      position: 'relative', cursor: 'pointer', padding: 0,
      transition: 'all 180ms ease',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: on ? '#0a0a0a' : INK_DIM,
        transition: 'left 180ms ease, background 180ms ease',
      }} />
    </button>
  );
}

/* ── Sentence count dots ──────────────────────────────────────── */
function CountDots({ filled, total = 3, size = 9, color }) {
  return (
    <Row gap={9} align="center">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: size, height: size, borderRadius: '50%',
          background: i < filled ? (color || INK_BRIGHT) : 'transparent',
          border: i < filled ? 'none' : `1px solid ${INK_FADE}`,
          display: 'inline-block',
          transition: 'background 180ms ease',
        }} />
      ))}
    </Row>
  );
}

/* ── Streak pill ──────────────────────────────────────────────── */
function StreakPill({ count, bright = false }) {
  const c = bright ? INK_BRIGHT : INK;
  return (
    <Row gap={8} align="center" style={{
      padding: '6px 14px', border: `1px solid ${bright ? INK_BRIGHT : FRAME}`, borderRadius: 999,
      fontFamily: MONO, fontSize: 12, letterSpacing: 0.6,
    }}>
      <span style={{ color: bright ? INK_BRIGHT : INK_DIM, display: 'inline-flex' }}>{I.flame}</span>
      <span style={{ color: c, fontWeight: 500 }}>{count}</span>
    </Row>
  );
}

/* ── Toast ────────────────────────────────────────────────────── */
function Toast({ text }) {
  if (!text) return null;
  return (
    <div style={{
      position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
      background: SURFACE_HI, border: `1px solid ${FRAME}`,
      padding: '10px 16px', borderRadius: 999, color: INK,
      fontFamily: MONO, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
      animation: 'pt-toast-in 240ms ease-out both',
      zIndex: 200, whiteSpace: 'nowrap',
      boxShadow: '0 12px 30px -10px rgba(0,0,0,0.6)',
    }}>{text}</div>
  );
}

/* ── Screen wrapper with fade-in ─────────────────────────────── */
function ScreenFade({ children, k }) {
  return (
    <div key={k} style={{
      flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
      animation: 'pt-screen-in 280ms ease-out both',
    }}>{children}</div>
  );
}

/* ── Modal sheet ──────────────────────────────────────────────── */
function ModalSheet({ children, onClose, full = true }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      zIndex: 100, display: 'flex', flexDirection: 'column',
      animation: 'pt-fade-in 180ms ease-out both',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        marginTop: full ? 0 : 'auto',
        background: PAPER, flex: full ? 1 : 'unset',
        borderTopLeftRadius: full ? 0 : 22,
        borderTopRightRadius: full ? 0 : 22,
        borderTop: full ? 'none' : `1px solid ${FRAME}`,
        display: 'flex', flexDirection: 'column', minHeight: 0,
      }}>
        {children}
      </div>
    </div>
  );
}

/* ── Brand mark (3 dots in rounded tile) ──────────────────────── */
function MarkDot({ size = 48 }) {
  const r = size / 9;
  const gap = size / 8;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: INK_BRIGHT,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap, flexShrink: 0,
    }}>
      {[0,1,2].map((i) => (
        <span key={i} style={{ width: r * 2, height: r * 2, borderRadius: '50%', background: '#0a0a0a' }} />
      ))}
    </div>
  );
}

/* ── Skel (loading skeleton) ──────────────────────────────────── */
function Skel({ w = '100%', h = 12, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: 4, background: SURFACE, animation: 'pt-skel 1400ms ease-in-out infinite', ...style }} />;
}

/* ── Export to window ─────────────────────────────────────────── */
Object.assign(window, {
  INK, INK_BRIGHT, INK_DIM, INK_FADE, PAPER, PAPER_BG, FRAME, SURFACE, SURFACE_HI, ACCENT, WARN,
  SANS, SERIF, MONO, PHONE_W, PHONE_H,
  I, TAB_ICONS, Row, Col,
  AppCtx, AppProvider, useApp,
  PhoneFrame, StatusBar, HomeIndicator, TabBar, PageHeader,
  Btn, Chip, Avatar, Switch, CountDots, StreakPill, Toast, ScreenFade, ModalSheet, MarkDot, Skel,
  TODAY, TODAY_KEY, dKey, fmtDate, fmtShort,
  countSentences, splitSentences, SEED_PROMPTS,
});

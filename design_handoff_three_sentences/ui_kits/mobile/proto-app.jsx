/* proto-app.jsx — top-level App. Composes flow, tab routing, modals, dev panel. */

function PhoneHost() {
  const { state, set } = useApp();
  const [toast, setToast] = React.useState('');
  const [showReset, setShowReset] = React.useState(false);
  const showToast = (text) => {
    setToast(text);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(''), 2400);
  };

  // Tab content
  let body;
  if (state.flow === 'splash')    body = <ScreenSplash />;
  else if (state.flow === 'login')    body = <ScreenLogin />;
  else if (state.flow === 'signup')   body = <ScreenSignup />;
  else if (state.flow === 'profile')  body = <ScreenProfile />;
  else if (state.flow === 'interests')body = <ScreenInterests />;
  else if (state.flow === 'onboard')  body = <ScreenOnboard />;
  else {
    // app — bottom tabs
    if (state.tab === 'today')         body = <ScreenToday toast={showToast} />;
    else if (state.tab === 'history')  body = <ScreenHistory />;
    else if (state.tab === 'social')   body = <ScreenSocial />;
    else if (state.tab === 'insights') body = <ScreenInsights />;
    else if (state.tab === 'settings') body = <ScreenSettings openReset={() => setShowReset(true)} />;
  }

  const inApp = state.flow === 'app';
  const showTabs = inApp;

  // Modal routing
  let modalEl = null;
  if (state.modal) {
    if (state.modal === 'reflect')          modalEl = <ReflectModal />;
    else if (state.modal === 'reflect-off') modalEl = <ReflectOffModal />;
    else if (state.modal === 'crisis')      modalEl = <CrisisModal />;
    else if (state.modal === 'conversations') modalEl = <ConversationsModal />;
    else if (state.modal === 'profile')     modalEl = <ProfileModal />;
    else if (state.modal === 'invite')      modalEl = <InviteModal />;
    else if (state.modal.startsWith('chat:')) {
      modalEl = <ChatModal friendId={state.modal.slice(5)} />;
    }
    else if (state.modal.startsWith('entry:')) {
      modalEl = <EntryModal dateKey={state.modal.slice(6)} />;
    }
    else if (state.modal.startsWith('milestone:')) {
      modalEl = <MilestoneModal count={parseInt(state.modal.slice(10), 10)} />;
    }
  }

  return (
    <PhoneFrame>
      {/* offline banner (above status bar) */}
      {inApp && !state.prefs.online ? (
        <div style={{
          background: WARN, color: '#0a0a0a',
          padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: 500,
          flexShrink: 0,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0a0a0a' }} />
          <span>Offline · drafts saved locally</span>
        </div>
      ) : null}

      <StatusBar online={state.prefs.online} />

      <ScreenFade k={`${state.flow}-${state.tab}`}>
        {body}
      </ScreenFade>

      {showTabs ? <TabBar /> : null}

      {modalEl}

      {showReset ? <ResetModal onClose={() => setShowReset(false)} /> : null}

      <Toast text={toast} />

      <HomeIndicator />
    </PhoneFrame>
  );
}

/* ── Dev panel (outside the phone) ────────────────────────────── */
function DevPanel({ collapsed, setCollapsed }) {
  const { state, set, reset } = useApp();

  const flows = [
    ['splash',    'Splash'],
    ['login',     'Login'],
    ['signup',    'Signup'],
    ['profile',   'Profile setup'],
    ['interests', 'Interests'],
    ['onboard',   'Onboarding'],
    ['app',       'Main app'],
  ];
  const tabs = ['today', 'history', 'social', 'insights', 'settings'];
  const modals = [
    ['reflect',         'Reflect (AI)'],
    ['reflect-off',     'Reflect · off'],
    ['crisis',          'Crisis resources'],
    ['conversations',   'Conversations'],
    ['chat:maya',       'Chat · Maya'],
    ['profile',         'Profile'],
    ['invite',          'Invite'],
    ['entry:2026-06-15','Entry · Jun 15'],
    ['milestone:7',     'Milestone · 7'],
    ['milestone:30',    'Milestone · 30'],
    ['milestone:363',   'Milestone · 363'],
  ];

  if (collapsed) {
    return (
      <button onClick={() => setCollapsed(false)} style={{
        position: 'fixed', top: 20, right: 20, zIndex: 500,
        background: SURFACE_HI, border: `1px solid ${FRAME}`,
        color: INK, padding: '8px 14px', borderRadius: 999,
        fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: INK_BRIGHT }} />
        Dev
      </button>
    );
  }

  const sectionStyle = { fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 14, marginBottom: 6 };
  const btnStyle = (active) => ({
    padding: '6px 11px', borderRadius: 999,
    background: active ? INK_BRIGHT : 'transparent',
    color: active ? '#0a0a0a' : INK,
    border: `1px solid ${active ? INK_BRIGHT : FRAME}`,
    fontFamily: MONO, fontSize: 10, letterSpacing: 0.9, textTransform: 'uppercase',
    cursor: 'pointer', whiteSpace: 'nowrap',
  });

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 500,
      width: 240, maxHeight: 'calc(100vh - 40px)',
      background: 'rgba(14, 14, 16, 0.92)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${FRAME}`, borderRadius: 16,
      padding: '14px 14px 16px',
      color: INK, fontFamily: SANS,
      overflowY: 'auto', overflowX: 'hidden',
      boxShadow: '0 24px 50px -20px rgba(0,0,0,0.8)',
    }} className="pt-scroll">
      <Row justify="space-between" align="center">
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1.6, color: INK_BRIGHT, textTransform: 'uppercase', fontWeight: 500 }}>Demo Panel</div>
        <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', color: INK_DIM, cursor: 'pointer', padding: 4, display: 'flex' }}>{I.close}</button>
      </Row>
      <div style={{ fontFamily: SANS, fontSize: 12, color: INK_DIM, marginTop: 4, lineHeight: 1.4 }}>
        Jump to any state. Changes persist.
      </div>

      <div style={sectionStyle}>Flow</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {flows.map(([k, l]) => (
          <button key={k} style={btnStyle(state.flow === k)} onClick={() => set({ flow: k, modal: null, onboardStep: k === 'onboard' ? 0 : state.onboardStep })}>{l}</button>
        ))}
      </div>

      {state.flow === 'app' ? (
        <>
          <div style={sectionStyle}>Tab</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {tabs.map((k) => (
              <button key={k} style={btnStyle(state.tab === k)} onClick={() => set({ tab: k, modal: null })}>{k}</button>
            ))}
          </div>

          <div style={sectionStyle}>Modals</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {modals.map(([k, l]) => (
              <button key={k} style={btnStyle(state.modal === k)} onClick={() => set({ modal: k })}>{l}</button>
            ))}
          </div>

          <div style={sectionStyle}>Today state</div>
          <Col gap={5}>
            <button style={btnStyle(false)} onClick={() => {
              set((s) => {
                const next = { ...s.entries };
                delete next[TODAY_KEY];
                return { ...s, entries: next, draft: '', tab: 'today', modal: null };
              });
            }}>Reset today (empty)</button>
            <button style={btnStyle(false)} onClick={() => {
              set((s) => ({
                ...s,
                entries: {
                  ...s.entries,
                  [TODAY_KEY]: { sentences: [
                    'The deal closed before sunrise, and the office stayed quiet long after.',
                    'I caught myself listening to the kettle hum instead of refreshing the inbox.',
                    'For the first time in weeks I left at six and did not look back.',
                  ], submittedAt: '9:14 PM' },
                },
                draft: '',
                tab: 'today', modal: null,
              }));
            }}>Mark today submitted</button>
          </Col>

          <div style={sectionStyle}>Network</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={btnStyle(state.prefs.online)} onClick={() => set((s) => ({ ...s, prefs: { ...s.prefs, online: true } }))}>Online</button>
            <button style={btnStyle(!state.prefs.online)} onClick={() => set((s) => ({ ...s, prefs: { ...s.prefs, online: false } }))}>Offline</button>
          </div>
        </>
      ) : null}

      <div style={sectionStyle}>Danger zone</div>
      <button onClick={reset} style={{
        ...btnStyle(false),
        color: WARN, borderColor: 'rgba(246, 193, 119, 0.4)',
        width: '100%',
      }}>Reset everything</button>
    </div>
  );
}

/* ── Root layout ──────────────────────────────────────────────── */
function App() {
  const [devCollapsed, setDevCollapsed] = React.useState(() => {
    try { return localStorage.getItem('ts-dev-collapsed') === '1'; } catch (e) { return false; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('ts-dev-collapsed', devCollapsed ? '1' : '0'); } catch (e) {}
  }, [devCollapsed]);

  // Scale phone to fit viewport
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const update = () => {
      const margin = 80;
      const sx = (window.innerWidth - 320) / PHONE_W;  // leave room for dev panel
      const sy = (window.innerHeight - margin) / PHONE_H;
      const s = Math.min(1, sx, sy);
      setScale(Math.max(0.5, s));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <AppProvider>
      <div style={{
        width: '100vw', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* corner sigil */}
        <div style={{
          position: 'fixed', top: 22, left: 24, display: 'flex', alignItems: 'center', gap: 12, zIndex: 10,
        }}>
          <MarkDot size={26} />
          <Col gap={2}>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: INK, letterSpacing: -0.3 }}>Three Sentences</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: INK_DIM, letterSpacing: 2, textTransform: 'uppercase' }}>Interactive prototype</div>
          </Col>
        </div>

        {/* phone */}
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 200ms ease',
        }}>
          <PhoneHost />
        </div>

        {/* dev panel */}
        <DevPanel collapsed={devCollapsed} setCollapsed={setDevCollapsed} />

        {/* footer hint */}
        <div style={{
          position: 'fixed', bottom: 20, left: 24,
          fontFamily: MONO, fontSize: 9, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase',
          maxWidth: 360, lineHeight: 1.6, zIndex: 10,
        }}>
          Tap into Today, write 3 sentences (use periods to count),<br />submit. Persists across refresh.
        </div>
      </div>
    </AppProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

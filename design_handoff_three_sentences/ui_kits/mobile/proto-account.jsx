/* proto-account.jsx — settings, profile modal, milestone modal. */

function ScreenSettings({ openReset }) {
  const { state, set, reset } = useApp();
  const p = state.prefs;
  const setPref = (k, v) => set((s) => ({ ...s, prefs: { ...s.prefs, [k]: v } }));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader large title="Settings" />
      <div className="pt-scroll" style={{ flex: 1, padding: '0 24px 18px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>

        {/* Profile card */}
        <button onClick={() => set({ modal: 'profile' })} style={{
          padding: '14px 16px', background: SURFACE, borderRadius: 14,
          border: `1px solid ${FRAME}`, color: INK, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
          marginBottom: 8,
        }}>
          <Avatar color="#c8b6a6" name={state.user.name} size={50} />
          <Col gap={3} style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: INK }}>{state.user.name}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 0.6 }}>{state.user.handle}</div>
          </Col>
          <span style={{ color: INK_DIM, display: 'inline-flex', transform: 'scale(1.2)' }}>{I.caret}</span>
        </button>

        <SectionLabel>Practice</SectionLabel>
        <Toggle label="Daily prompts" sub="A gentle question each morning" on={p.dailyPrompt} onChange={(v) => setPref('dailyPrompt', v)} />
        <Toggle label="AI reflection" sub="Weekly read across your entries" on={p.aiReflection} onChange={(v) => setPref('aiReflection', v)} />

        <SectionLabel>Notifications</SectionLabel>
        <Toggle label="Daily reminder" sub={p.reminderTime} on={p.notifications} onChange={(v) => setPref('notifications', v)} />

        <SectionLabel>Safety</SectionLabel>
        <Toggle label="Crisis detection" sub="Surface resources when sentiment is dark" on={p.crisisDetection} onChange={(v) => setPref('crisisDetection', v)} />

        <SectionLabel>Account</SectionLabel>
        <Row gap={6}>
          <RowItem label="Export my journal" />
        </Row>
        <RowItem label="Privacy & encryption" />
        <RowItem label="Toggle offline mode" right={<Switch on={!p.online} onChange={(v) => setPref('online', !v)} />} clickable={false} />
        <RowItem label="Reset prototype" warn onClick={() => openReset()} />
        <RowItem label="Sign out" warn onClick={() => { reset(); }} />

        <div style={{
          fontFamily: MONO, fontSize: 9, color: INK_DIM, textAlign: 'center',
          letterSpacing: 1.2, textTransform: 'uppercase', lineHeight: 1.6,
          padding: '20px 0 8px',
        }}>
          Three Sentences · v1.0.0<br />Be better. Do better.
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: MONO, fontSize: 10, color: INK_DIM,
      letterSpacing: 1.4, textTransform: 'uppercase',
      padding: '16px 0 4px',
    }}>{children}</div>
  );
}

function Toggle({ label, sub, on, onChange }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 12,
      background: SURFACE, border: `1px solid ${FRAME}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Col gap={3} style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: INK }}>{label}</div>
        {sub ? <div style={{ fontFamily: MONO, fontSize: 9, color: INK_DIM, letterSpacing: 0.8, textTransform: 'uppercase' }}>{sub}</div> : null}
      </Col>
      <Switch on={on} onChange={onChange} />
    </div>
  );
}

function RowItem({ label, warn = false, onClick, right, clickable = true }) {
  return (
    <button onClick={onClick} disabled={!onClick} style={{
      padding: '14px 16px', borderRadius: 12, border: `1px solid ${FRAME}`,
      background: 'transparent', color: warn ? WARN : INK,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
      fontFamily: SANS, fontSize: 14,
    }}>
      <span>{label}</span>
      {right || (clickable ? <span style={{ color: INK_DIM, display: 'inline-flex', transform: 'scale(1.1)' }}>{I.caret}</span> : null)}
    </button>
  );
}

/* ── Profile modal ────────────────────────────────────────────── */
function ProfileModal() {
  const { state, set, streak, totalEntries } = useApp();
  return (
    <ModalSheet onClose={() => set({ modal: null })}>
      <PageHeader title="Profile" back={() => set({ modal: null })} right={
        <Row gap={12}>
          <button style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer', padding: 0, display: 'flex' }}>{I.edit}</button>
          <button onClick={() => set({ modal: null })} style={{ background: 'none', border: 'none', color: INK_DIM, cursor: 'pointer', padding: 0, display: 'flex' }}>{I.close}</button>
        </Row>
      } />
      <div className="pt-scroll" style={{ flex: 1, padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
        <Col gap={10} style={{ alignItems: 'center' }}>
          <Avatar color="#c8b6a6" name={state.user.name} size={92} />
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: INK, letterSpacing: -0.4 }}>{state.user.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: INK_DIM, letterSpacing: 1 }}>{state.user.handle}</div>
        </Col>

        <Row gap={0} justify="space-around" style={{ padding: '14px 0', borderTop: `1px solid ${FRAME}`, borderBottom: `1px solid ${FRAME}` }}>
          {[
            [totalEntries, 'Entries'],
            [streak, 'Streak'],
            [state.friends.length, 'Circle'],
          ].map(([v, l], i) => (
            <Col key={i} gap={3} style={{ alignItems: 'center' }}>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 26, color: INK, letterSpacing: -0.5, lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: INK_DIM, letterSpacing: 1.2, textTransform: 'uppercase' }}>{l}</div>
            </Col>
          ))}
        </Row>

        <Col gap={8}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase' }}>Bio</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: INK, lineHeight: 1.55 }}>
            {state.user.bio || 'No bio yet.'}
          </div>
        </Col>

        <Col gap={8}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase' }}>Interests</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {state.user.interests.map((t) => (
              <span key={t} style={{
                padding: '6px 12px', borderRadius: 999,
                border: `1px solid ${FRAME}`, color: INK_DIM,
                fontFamily: SANS, fontSize: 12,
              }}>{t}</span>
            ))}
          </div>
        </Col>
      </div>
    </ModalSheet>
  );
}

/* ── Milestone modal ──────────────────────────────────────────── */
function MilestoneModal({ count }) {
  const { set } = useApp();
  const titles = { 7: 'A first week.', 30: 'Days unbroken.', 100: 'A hundred days.', 363: 'Three hundred sixty-three.' };
  const subs = {
    7: 'You showed up seven days in a row. Quietly remarkable.',
    30: 'You showed up thirty days in a row. The shape of a practice has emerged.',
    100: 'A hundred days of three sentences. Something has been built.',
    363: 'You reached the goal. Two short of perfection — which was the point.',
  };
  return (
    <div onClick={() => set({ modal: null })} style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'pt-fade-in 220ms ease-out both',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: PAPER, border: `1px solid ${INK_BRIGHT}`,
        borderRadius: 24, padding: '32px 28px 24px',
        display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center',
        width: '100%', maxWidth: 320,
        boxShadow: '0 30px 60px -10px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)',
      }}>
        <MarkDot size={40} />
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, color: INK, letterSpacing: -3, lineHeight: 1 }}>{count}</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: INK_DIM, letterSpacing: 2.4, textTransform: 'uppercase' }}>Days unbroken</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: INK, textAlign: 'center', letterSpacing: -0.3, marginTop: 6 }}>
          {titles[count] || `${count} days.`}
        </div>
        <div style={{ fontSize: 14, color: INK_DIM, textAlign: 'center', lineHeight: 1.5, maxWidth: 240 }}>
          {subs[count] || 'You returned today. Again.'}
        </div>
        <Row gap={10} style={{ width: '100%', marginTop: 10 }}>
          <Btn ghost onClick={() => set({ modal: null })}>Share</Btn>
          <Btn fill onClick={() => set({ modal: null })}>Keep going</Btn>
        </Row>
      </div>
    </div>
  );
}

/* ── Reset confirm modal ──────────────────────────────────────── */
function ResetModal({ onClose }) {
  const { reset } = useApp();
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'pt-fade-in 220ms ease-out both',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: PAPER, border: `1px solid ${FRAME}`,
        borderRadius: 20, padding: '24px 24px 20px',
        display: 'flex', flexDirection: 'column', gap: 14,
        width: '100%', maxWidth: 320,
      }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: INK }}>Reset prototype?</div>
        <div style={{ fontSize: 13, color: INK_DIM, lineHeight: 1.5 }}>
          Clears all entries, friends, and settings — and sends you back to the splash screen. For demo purposes only.
        </div>
        <Row gap={10} style={{ marginTop: 6 }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn fill onClick={() => { reset(); onClose(); }}>Reset</Btn>
        </Row>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenSettings, ProfileModal, MilestoneModal, ResetModal });

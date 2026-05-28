/* proto-insights.jsx — practice overview + reflect modal (AI weekly read). */

function ScreenInsights() {
  const { state, set, streak, totalEntries } = useApp();

  // Compute longest streak
  const longest = React.useMemo(() => {
    const dates = Object.keys(state.entries).sort();
    if (dates.length === 0) return 0;
    let max = 1, cur = 1;
    for (let i = 1; i < dates.length; i++) {
      const a = new Date(dates[i - 1]);
      const b = new Date(dates[i]);
      const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
      if (diff === 1) { cur += 1; max = Math.max(max, cur); }
      else cur = 1;
    }
    return Math.max(max, streak);
  }, [state.entries, streak]);

  const promptText = SEED_PROMPTS[TODAY.d % SEED_PROMPTS.length];
  const aiOn = state.prefs.aiReflection;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader large title="Your practice" sub="Insights" />

      <div className="pt-scroll" style={{ flex: 1, padding: '0 24px 18px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

        {/* Streak hero */}
        <div style={{
          padding: '20px 20px',
          background: SURFACE,
          borderRadius: 16,
          border: `1px solid ${FRAME}`,
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: INK, letterSpacing: -1.8, lineHeight: 1 }}>{streak}</div>
          <Col gap={4} style={{ flex: 1 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase' }}>Current streak</div>
            <div style={{ fontSize: 13, color: INK, lineHeight: 1.5 }}>
              {streak >= longest
                ? 'You are at your personal best.'
                : `${longest - streak} more days and you tie your personal best.`}
            </div>
          </Col>
        </div>

        {/* Three small stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            [longest, 'Longest'],
            [totalEntries, 'Entries'],
            ['363', 'Goal'],
          ].map(([v, l], i) => (
            <Col key={i} gap={4} style={{
              alignItems: 'center', padding: '14px 8px',
              border: `1px solid ${FRAME}`, borderRadius: 12,
            }}>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 22, color: INK, letterSpacing: -0.4, lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: INK_DIM, letterSpacing: 1.2, textTransform: 'uppercase' }}>{l}</div>
            </Col>
          ))}
        </div>

        {/* Daily prompt */}
        {state.prefs.dailyPrompt ? (
          <div style={{
            padding: '16px 18px',
            background: SURFACE,
            borderRadius: 12,
            borderLeft: `2px solid ${INK_BRIGHT}`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>Today's prompt</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 15, color: INK, lineHeight: 1.45 }}>
              {promptText}
            </div>
          </div>
        ) : null}

        {/* AI reflection card */}
        <button onClick={() => set({ modal: aiOn ? 'reflect' : 'reflect-off' })} style={{
          padding: '16px 18px', border: `1px solid ${FRAME}`, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', color: INK, cursor: 'pointer',
          width: '100%', textAlign: 'left',
        }}>
          <Col gap={4}>
            <Row gap={8} align="center">
              <span style={{ color: aiOn ? INK : INK_DIM, display: 'inline-flex' }}>{I.spark}</span>
              <div style={{ fontSize: 14, fontWeight: 500, color: INK }}>AI reflection</div>
            </Row>
            <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1, textTransform: 'uppercase' }}>
              {aiOn ? '7 entries this week' : 'Off — opt in to enable'}
            </div>
          </Col>
          <span style={{ color: INK_DIM, display: 'inline-flex', transform: 'scale(1.3)' }}>{I.caret}</span>
        </button>

        {/* Principle */}
        <div style={{
          padding: '16px 18px', borderRadius: 12, border: `1px dashed ${INK_FADE}`,
        }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 }}>Principle</div>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 14, color: INK, lineHeight: 1.5 }}>
            Show up. Do the work. Let go of perfection.
          </div>
        </div>

        {/* Crisis link */}
        <button onClick={() => set({ modal: 'crisis' })} style={{
          background: 'transparent', border: 'none', color: INK_DIM,
          padding: '14px 0 4px', cursor: 'pointer',
          fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', textAlign: 'center',
        }}>
          In distress? <span style={{ color: INK, textDecoration: 'underline', textUnderlineOffset: 3 }}>See resources</span>
        </button>
      </div>
    </div>
  );
}

/* ── Reflect modal (AI weekly read) ──────────────────────────── */
function ReflectModal() {
  const { set } = useApp();
  const [range, setRange] = React.useState('7d');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [range]);

  const reads = {
    '7d': {
      theme: 'Letting go, on your own terms.',
      observation: 'Across seven entries you returned twice to a kettle and once to a sunrise. Three quiet moments where you stopped before reaching for your phone. Each was a small refusal — small, but a refusal.',
      question: 'What did the kettle give you that the inbox could not?',
    },
    '30d': {
      theme: 'A month of returning to slowness.',
      observation: 'You wrote about walking eleven times, about reading nine, about your mother three. The word "quiet" appears seven times across thirty entries. Most of your best days began with you closing the laptop first.',
      question: 'When was the last time silence felt like a friend?',
    },
    '90d': {
      theme: 'Building a quieter shape to your days.',
      observation: 'Over three months the meetings have receded and the walks have grown. You wrote less about closing deals and more about closing the door at six. Something is happening that you have not named yet.',
      question: 'If you had to name it, what would you call it?',
    },
  };
  const r = reads[range];

  return (
    <ModalSheet onClose={() => set({ modal: null })}>
      <PageHeader title="Reflect" sub="AI weekly read" back={() => set({ modal: null })} right={<button onClick={() => set({ modal: null })} style={{ background: 'none', border: 'none', color: INK_DIM, cursor: 'pointer', padding: 0, display: 'flex' }}>{I.close}</button>} />

      <div className="pt-scroll" style={{ flex: 1, padding: '18px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
        <Row gap={8}>
          {[['7d','7 days'], ['30d','30 days'], ['90d','90 days']].map(([k, l]) => (
            <Chip key={k} on={range === k} onClick={() => setRange(k)}>{l}</Chip>
          ))}
        </Row>

        {loading ? (
          <Col gap={12} style={{ padding: '8px 0' }}>
            <Row gap={10} align="center">
              <span style={{ color: INK_BRIGHT, display: 'inline-flex', animation: 'pt-pulse 1200ms ease-in-out infinite' }}>{I.spark}</span>
              <div style={{ fontFamily: MONO, fontSize: 11, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase' }}>Reading {range === '7d' ? '7' : range === '30d' ? '30' : '90'} entries…</div>
            </Row>
            <Skel w="60%" h={28} />
            <Skel w="100%" h={120} />
            <Skel w="100%" h={88} />
          </Col>
        ) : (
          <Col gap={16}>
            <Col gap={6}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase' }}>Theme</div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: INK, letterSpacing: -0.3, lineHeight: 1.25 }}>{r.theme}</div>
            </Col>
            <div style={{ padding: '18px 18px', background: SURFACE, borderRadius: 12 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 }}>Observation</div>
              <div style={{ fontSize: 14, color: INK, lineHeight: 1.6 }}>{r.observation}</div>
            </div>
            <div style={{ padding: '20px 20px', background: SURFACE, borderRadius: 12, borderLeft: `2px solid ${INK_BRIGHT}` }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: INK_BRIGHT, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>A question to sit with</div>
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 16, color: INK, lineHeight: 1.45 }}>{r.question}</div>
            </div>
          </Col>
        )}

        <div style={{ flex: 1 }} />

        <div style={{
          fontFamily: MONO, fontSize: 9, color: INK_DIM, textAlign: 'center',
          letterSpacing: 1.4, textTransform: 'uppercase', lineHeight: 1.6,
          paddingTop: 14, borderTop: `1px solid ${FRAME}`,
        }}>
          AI patterns may be wrong. Use with care.<br />
          <button onClick={() => set({ modal: 'crisis' })} style={{ background: 'none', border: 'none', color: INK, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer', fontFamily: MONO, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase' }}>Crisis? Tap for resources.</button>
        </div>
      </div>
    </ModalSheet>
  );
}

/* ── Reflection-off modal ─────────────────────────────────────── */
function ReflectOffModal() {
  const { set } = useApp();
  return (
    <ModalSheet onClose={() => set({ modal: null })}>
      <PageHeader title="Reflect" back={() => set({ modal: null })} right={<button onClick={() => set({ modal: null })} style={{ background: 'none', border: 'none', color: INK_DIM, cursor: 'pointer', padding: 0, display: 'flex' }}>{I.close}</button>} />
      <Col gap={20} style={{ flex: 1, padding: '40px 28px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <span style={{ color: INK, opacity: 0.5, transform: 'scale(2.2)', display: 'inline-block' }}>{I.spark}</span>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: INK, letterSpacing: -0.4 }}>Reflection is off.</div>
        <div style={{ fontSize: 14, color: INK_DIM, lineHeight: 1.55, maxWidth: 280 }}>
          We can find quiet patterns across your entries.<br />Nothing leaves the device unless you opt in.
        </div>
        <div style={{
          width: '100%', padding: '14px 18px', borderRadius: 12,
          background: SURFACE, border: `1px solid ${FRAME}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          textAlign: 'left',
        }}>
          <Col gap={3}>
            <div style={{ fontSize: 14, color: INK }}>Enable AI reflection</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: INK_DIM, letterSpacing: 1, textTransform: 'uppercase' }}>Encrypted in transit</div>
          </Col>
          <Switch on={false} onChange={() => {}} />
        </div>
        <Btn fill w={200} onClick={() => {
          set((s) => ({ ...s, prefs: { ...s.prefs, aiReflection: true }, modal: 'reflect' }));
        }}>Turn it on</Btn>
      </Col>
    </ModalSheet>
  );
}

/* ── Crisis resources ─────────────────────────────────────────── */
function CrisisModal() {
  const { set } = useApp();
  const lines = [
    ['988', 'Suicide & Crisis Lifeline · 24/7'],
    ['Text HOME to 741741', 'Crisis Text Line'],
    ['findahelpline.com', 'International — by country'],
  ];
  return (
    <ModalSheet onClose={() => set({ modal: null })}>
      <PageHeader title="Resources" back={() => set({ modal: null })} right={<button onClick={() => set({ modal: null })} style={{ background: 'none', border: 'none', color: INK_DIM, cursor: 'pointer', padding: 0, display: 'flex' }}>{I.close}</button>} />
      <Col gap={14} style={{ flex: 1, padding: '20px 24px 24px' }}>
        <div style={{ padding: '18px 18px', background: SURFACE, borderRadius: 12, borderLeft: `2px solid ${WARN}` }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: WARN, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>You are not alone</div>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 14, color: INK, lineHeight: 1.5 }}>
            You don't have to be alone in this. Help is available, free, and confidential.
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 4 }}>Speak to someone now</div>
        {lines.map(([label, sub], i) => (
          <div key={i} style={{
            padding: '14px 16px', borderRadius: 12, border: `1px solid ${FRAME}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
          }}>
            <Col gap={3}>
              <div style={{ fontSize: 15, fontWeight: 500, color: INK }}>{label}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 0.8, textTransform: 'uppercase' }}>{sub}</div>
            </Col>
            <span style={{ color: INK_DIM, display: 'inline-flex', transform: 'scale(1.2)' }}>{I.caret}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: MONO, fontSize: 9, color: INK_DIM, textAlign: 'center', lineHeight: 1.6, letterSpacing: 0.8, textTransform: 'uppercase' }}>
          Three Sentences is not a substitute<br />for professional care.
        </div>
      </Col>
    </ModalSheet>
  );
}

Object.assign(window, { ScreenInsights, ReflectModal, ReflectOffModal, CrisisModal });

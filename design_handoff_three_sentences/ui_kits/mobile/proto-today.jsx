/* proto-today.jsx — the daily writing screen.
   Live sentence counter, submit gating, submitted/locked state, milestone trigger. */

function ScreenToday({ toast }) {
  const { state, set, todayEntry, streak } = useApp();
  const t = fmtDate(TODAY.y, TODAY.m, TODAY.d);
  const taRef = React.useRef(null);

  // If today already submitted: locked view
  if (todayEntry) {
    return <TodaySubmitted entry={todayEntry} streak={streak} />;
  }

  const count = countSentences(state.draft);
  const canSubmit = count === 3;
  const tooMany = count > 3;
  const sentences = splitSentences(state.draft);

  const submit = () => {
    if (!canSubmit) return;
    const todayKey = TODAY_KEY;
    set((s) => {
      const newEntries = {
        ...s.entries,
        [todayKey]: { sentences: sentences.slice(0, 3), submittedAt: '9:14 PM' },
      };
      // Check for milestone (any of 7, 30, 100, 363)
      const newStreak = computeStreak(newEntries);
      const milestone = [7, 30, 100, 363].includes(newStreak);
      return { ...s, entries: newEntries, draft: '', modal: milestone ? `milestone:${newStreak}` : null };
    });
    toast('Streak +1 · Locked');
  };

  const insertExample = () => {
    set({ draft: 'The deal closed before sunrise, and the office stayed quiet long after.\nI caught myself listening to the kettle hum instead of refreshing the inbox.\nFor the first time in weeks I left at six and did not look back.' });
    setTimeout(() => taRef.current && taRef.current.focus(), 50);
  };

  const promptText = state.prefs.dailyPrompt ? SEED_PROMPTS[TODAY.d % SEED_PROMPTS.length] : null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader large title="Today" sub={`${t.dow} · ${t.month} ${t.day}`} right={<StreakPill count={streak} />} />

      <div style={{ flex: 1, padding: '0 24px 18px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
        {promptText ? (
          <div style={{ padding: '10px 14px', borderLeft: `2px solid ${INK_FADE}`, fontFamily: SANS, fontSize: 13, color: INK_DIM, lineHeight: 1.5 }}>
            {promptText}
          </div>
        ) : null}

        {/* The writing surface */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <textarea
            ref={taRef}
            value={state.draft}
            onChange={(e) => set({ draft: e.target.value })}
            placeholder="Three sentences. What happened?"
            autoFocus
            spellCheck={false}
            className="pt-scroll"
            style={{
              flex: 1, width: '100%', minHeight: 0,
              fontFamily: SERIF, fontSize: 18, lineHeight: 1.6,
              color: INK, letterSpacing: -0.1,
              padding: 0,
            }}
          />
          {state.draft.length === 0 ? (
            <button onClick={insertExample} style={{
              position: 'absolute', bottom: 8, right: 0,
              background: 'transparent', border: `1px solid ${FRAME}`, color: INK_DIM,
              padding: '5px 10px', borderRadius: 999, cursor: 'pointer',
              fontFamily: MONO, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase',
            }}>Try an example</button>
          ) : null}
        </div>

        {/* Counter strip */}
        <Row justify="space-between" align="center" style={{ paddingTop: 14, borderTop: `1px solid ${FRAME}` }}>
          <CountDots filled={Math.min(count, 3)} color={tooMany ? WARN : INK_BRIGHT} />
          <div style={{
            fontFamily: MONO, fontSize: 11,
            color: tooMany ? WARN : (count === 3 ? INK_BRIGHT : INK_DIM),
            letterSpacing: 1.4, textTransform: 'uppercase',
          }}>
            {tooMany ? `${count} / 3 · too many` : count === 3 ? '3 / 3 · ready' : `${count} / 3 · ${3 - count} more`}
          </div>
        </Row>

        {tooMany ? (
          <div style={{ fontFamily: SANS, fontSize: 12, color: INK_DIM, textAlign: 'center', marginTop: -8, letterSpacing: 0.2 }}>
            The constraint is the point. Cut one.
          </div>
        ) : null}

        <Btn fill={canSubmit} ghost={!canSubmit} disabled={!canSubmit} onClick={submit}>
          {canSubmit ? 'Submit' : 'Submit'}
        </Btn>
      </div>
    </div>
  );
}

/* ── Submitted (locked) state ─────────────────────────────────── */
function TodaySubmitted({ entry, streak }) {
  const { set } = useApp();
  const t = fmtDate(TODAY.y, TODAY.m, TODAY.d);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader large title="Done." sub={`${t.dow} · ${t.month} ${t.day}`} right={<StreakPill count={streak} bright />} />

      <div className="pt-scroll" style={{ flex: 1, padding: '0 24px 18px', display: 'flex', flexDirection: 'column', gap: 18, minHeight: 0, overflowY: 'auto' }}>

        {/* The day's entry */}
        <div style={{
          padding: '20px 20px 22px',
          background: SURFACE,
          borderRadius: 16,
          borderLeft: `2px solid ${INK_BRIGHT}`,
          fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: INK, letterSpacing: -0.1,
        }}>
          {entry.sentences.map((s, i) => (
            <span key={i}>{s}{i < entry.sentences.length - 1 ? ' ' : ''}</span>
          ))}
        </div>

        <Row gap={10} align="center" justify="center">
          <span style={{ color: INK_BRIGHT, display: 'inline-flex' }}>{I.check}</span>
          <div style={{ fontFamily: MONO, fontSize: 11, color: INK_DIM, letterSpacing: 1.6, textTransform: 'uppercase' }}>
            Submitted {entry.submittedAt} · Locked
          </div>
        </Row>

        {/* AI reflection peek */}
        <button onClick={() => set({ modal: 'reflect' })} style={{
          padding: '16px 18px', borderRadius: 14, border: `1px solid ${FRAME}`,
          background: 'transparent', color: INK, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', textAlign: 'left',
        }}>
          <Col gap={4}>
            <Row gap={8} align="center">
              <span style={{ color: INK_BRIGHT, display: 'inline-flex' }}>{I.spark}</span>
              <div style={{ fontSize: 14, fontWeight: 500, color: INK }}>This week's reflection</div>
            </Row>
            <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1, textTransform: 'uppercase' }}>
              7 entries · ready to read
            </div>
          </Col>
          <span style={{ color: INK_DIM, display: 'inline-flex', transform: 'scale(1.3)' }}>{I.caret}</span>
        </button>

        {/* Streak ladder */}
        <div style={{ padding: '14px 18px', borderRadius: 14, border: `1px solid ${FRAME}` }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 }}>Next milestone</div>
          <Row align="center" gap={14}>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: INK, lineHeight: 1, letterSpacing: -1 }}>{streak}</div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 5, background: SURFACE, borderRadius: 999, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${Math.min(100, (streak / 30) * 100)}%`, background: INK_BRIGHT,
                  borderRadius: 999, transition: 'width 600ms ease',
                }} />
              </div>
              <Row justify="space-between" style={{ marginTop: 6, fontFamily: MONO, fontSize: 9, color: INK_DIM, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                <span>Today</span>
                <span>30 days unbroken</span>
              </Row>
            </div>
          </Row>
        </div>

        <div style={{
          fontFamily: MONO, fontSize: 10, color: INK_DIM, textAlign: 'center',
          letterSpacing: 1.4, textTransform: 'uppercase',
          paddingTop: 8, marginTop: 'auto',
        }}>
          Done is better than perfect.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenToday, TodaySubmitted });

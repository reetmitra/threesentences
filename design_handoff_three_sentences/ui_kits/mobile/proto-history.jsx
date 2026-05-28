/* proto-history.jsx — calendar grid, month nav, tap a day to read its entry. */

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function ScreenHistory() {
  const { state, set, todayEntry, totalEntries } = useApp();
  const [view, setView] = React.useState({ y: TODAY.y, m: TODAY.m });

  const monthLabel = `${MONTHS[view.m]} ${view.y}`;
  const firstDow = new Date(view.y, view.m, 1).getDay(); // 0..6
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  const prev = () => setView((v) => v.m === 0 ? { y: v.y - 1, m: 11 } : { ...v, m: v.m - 1 });
  const next = () => setView((v) => v.m === 11 ? { y: v.y + 1, m: 0 } : { ...v, m: v.m + 1 });

  const isFuture = (d) => {
    if (view.y > TODAY.y) return true;
    if (view.y === TODAY.y && view.m > TODAY.m) return true;
    if (view.y === TODAY.y && view.m === TODAY.m && d > TODAY.d) return true;
    return false;
  };
  const isToday = (d) => view.y === TODAY.y && view.m === TODAY.m && d === TODAY.d;

  // build 42-cell calendar
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);

  // Stats this month
  let writtenCount = 0, emptyCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (isFuture(d) || isToday(d)) continue;
    if (state.entries[dKey(view.y, view.m, d)]) writtenCount += 1;
    else emptyCount += 1;
  }
  const elapsed = writtenCount + emptyCount;
  const pct = elapsed > 0 ? Math.round((writtenCount / elapsed) * 100) : 0;

  if (totalEntries === 0 && !todayEntry) {
    return <HistoryEmpty />;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader large title="History" sub={`${totalEntries} entries`} right={<span style={{ color: INK, opacity: 0.7 }}>{I.search}</span>} />

      <div className="pt-scroll" style={{ flex: 1, padding: '0 24px 18px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, overflowY: 'auto' }}>
        <Row justify="space-between" align="center" style={{ padding: '4px 0' }}>
          <button onClick={prev} style={{ background: 'none', border: 'none', color: INK_DIM, cursor: 'pointer', padding: 4, display: 'flex', transform: 'scaleX(-1) scale(1.3)' }}>{I.caret}</button>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 18, color: INK, letterSpacing: -0.2 }}>{monthLabel}</div>
          <button onClick={next} style={{ background: 'none', border: 'none', color: INK_DIM, cursor: 'pointer', padding: 4, display: 'flex', transform: 'scale(1.3)' }}>{I.caret}</button>
        </Row>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 7, fontFamily: MONO, fontSize: 10, color: INK_DIM, textAlign: 'center', letterSpacing: 1.2 }}>
          {['S','M','T','W','T','F','S'].map((d, i) => <div key={i}>{d}</div>)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 7 }}>
          {cells.map((d, i) => {
            if (d === null) return <div key={i} style={{ aspectRatio: '1 / 1' }} />;
            const future = isFuture(d);
            const today = isToday(d);
            const key = dKey(view.y, view.m, d);
            const written = !!state.entries[key];
            return (
              <button key={i}
                disabled={future || (!written && !today)}
                onClick={() => {
                  if (written) set({ modal: `entry:${key}` });
                  else if (today) set({ tab: 'today', modal: null });
                }}
                style={{
                  aspectRatio: '1 / 1', borderRadius: 8,
                  border: today ? `1.5px solid ${INK_BRIGHT}` : (written ? 'none' : `1px solid ${future ? 'transparent' : FRAME}`),
                  background: written ? INK : 'transparent',
                  color: written ? '#0a0a0a' : (future ? 'transparent' : INK_DIM),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: MONO, fontSize: 11, fontWeight: 500,
                  cursor: written || today ? 'pointer' : 'default',
                  padding: 0, transition: 'transform 100ms ease',
                }}>{d}</button>
            );
          })}
        </div>

        <Row gap={14} justify="center" style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
          <Row gap={5} align="center"><span style={{ width: 11, height: 11, background: INK, borderRadius: 2 }} /><span>written</span></Row>
          <Row gap={5} align="center"><span style={{ width: 11, height: 11, border: `1px solid ${FRAME}`, borderRadius: 2 }} /><span>empty</span></Row>
          <Row gap={5} align="center"><span style={{ width: 11, height: 11, border: `1px solid ${INK_BRIGHT}`, borderRadius: 2 }} /><span>today</span></Row>
        </Row>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', borderTop: `1px solid ${FRAME}`, padding: '16px 0 4px' }}>
          {[
            [writtenCount, `of ${elapsed || 0}`],
            [`${pct}%`, 'this month'],
            [totalEntries, 'all-time'],
          ].map(([v, l], i) => (
            <Col key={i} gap={3} style={{ flex: 1, alignItems: 'center' }}>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 24, color: INK, letterSpacing: -0.5, lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: INK_DIM, letterSpacing: 1.2, textTransform: 'uppercase' }}>{l}</div>
            </Col>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────── */
function HistoryEmpty() {
  const { set } = useApp();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader large title="History" />
      <Col gap={20} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: '0 26px', textAlign: 'center' }}>
        <MarkDot size={44} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: INK, letterSpacing: -0.5 }}>Begin.</div>
        <div style={{ fontSize: 14, color: INK_DIM, lineHeight: 1.55, maxWidth: 260 }}>
          Your history is empty. Write your first three sentences today and the calendar starts.
        </div>
        <Btn fill w={200} onClick={() => set({ tab: 'today' })}>Write today</Btn>
      </Col>
    </div>
  );
}

/* ── Entry detail modal ───────────────────────────────────────── */
function EntryModal({ dateKey }) {
  const { state, set } = useApp();
  const entry = state.entries[dateKey];
  if (!entry) return null;
  const [y, m, d] = dateKey.split('-').map(Number);
  const dd = fmtDate(y, m - 1, d);
  const text = entry.sentences.join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;

  return (
    <ModalSheet onClose={() => set({ modal: null })}>
      <PageHeader title={`${dd.dow} · ${dd.month} ${dd.day}`} back={() => set({ modal: null })} right={<button onClick={() => set({ modal: null })} style={{ background: 'none', border: 'none', color: INK_DIM, cursor: 'pointer', padding: 0, display: 'flex' }}>{I.close}</button>} />
      <div className="pt-scroll" style={{ flex: 1, padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
        <div style={{
          padding: '22px 22px 24px',
          background: SURFACE,
          borderRadius: 16,
          borderLeft: `2px solid ${INK_BRIGHT}`,
          fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: INK, letterSpacing: -0.1,
        }}>
          {entry.sentences.map((s, i) => (
            <React.Fragment key={i}>
              {s}{i < entry.sentences.length - 1 ? ' ' : ''}
            </React.Fragment>
          ))}
        </div>
        <Row gap={10} style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          <span>{entry.submittedAt}</span>
          <span>·</span>
          <span>{words} words</span>
          <span>·</span>
          <span>Locked</span>
        </Row>

        <button onClick={() => set({ modal: 'reflect' })} style={{
          padding: '16px 18px', borderRadius: 14, border: `1px solid ${FRAME}`,
          background: 'transparent', color: INK, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', textAlign: 'left',
        }}>
          <Row gap={8} align="center">
            <span style={{ color: INK_BRIGHT, display: 'inline-flex' }}>{I.spark}</span>
            <div style={{ fontSize: 14, fontWeight: 500, color: INK }}>Reflect on this week</div>
          </Row>
          <span style={{ color: INK_DIM, display: 'inline-flex', transform: 'scale(1.3)' }}>{I.caret}</span>
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ fontFamily: MONO, fontSize: 9, color: INK_DIM, textAlign: 'center', letterSpacing: 1.2, textTransform: 'uppercase', lineHeight: 1.6 }}>
          Entries are permanent.<br />No edits, no deletions.
        </div>
      </div>
    </ModalSheet>
  );
}

Object.assign(window, { ScreenHistory, HistoryEmpty, EntryModal });

/* landing-sections-b.jsx — Features (tabbed phone), 363, Principles, AI Reflection, Trust. */

const { useState: bS, useEffect: bE, useRef: bR } = React;

/* ── Features (tabbed phone previews) ───────────────────── */
function FeaturesSection() {
  const tabs = [
    { id: 'today',    label: 'Today' },
    { id: 'history',  label: 'History' },
    { id: 'insights', label: 'Insights' },
    { id: 'circle',   label: 'The Circle' },
  ];
  const [active, setActive] = bS('today');
  const copy = {
    today:    { h: 'A quiet shape for a loud year.', l: 'The whole UI is just three sentences and a submit button. The cursor lands in the textarea the moment the app opens.' },
    history:  { h: 'Your year on a single page.',     l: 'A bone-white dot for every day you wrote. Empty days are outlined, not red. Tap any written day to read it back.' },
    insights: { h: 'Streaks, slowly.',                 l: 'The number you actually care about — the current streak — sits above every other stat. The rest is calm furniture.' },
    circle:   { h: 'A private circle of nine.',        l: 'Invite-only friends who write daily too. End-to-end encrypted chat. No follower counts, no feed, no notifications.' },
  };
  return (
    <Section id="features" py={180} bg={LP_PAPER_2}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <Eyebrow style={{ marginBottom: 28 }}>Inside the app</Eyebrow>
          <H2>Four surfaces. Nothing else.</H2>
        </div>
      </Reveal>
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 72, flexWrap: 'wrap',
      }}>
        {tabs.map(t => {
          const isActive = active === t.id;
          return (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              padding: '10px 20px', borderRadius: 999,
              background: isActive ? LP_INK_BRIGHT : 'transparent',
              color: isActive ? '#0a0a0a' : LP_INK_DIM,
              border: `1px solid ${isActive ? LP_INK_BRIGHT : LP_FRAME}`,
              fontFamily: LP_MONO, fontSize: 11, fontWeight: 500,
              letterSpacing: 1.8, textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 200ms ease',
              whiteSpace: 'nowrap',
            }}>{t.label}</button>
          );
        })}
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
      }} className="features-grid">
        <div key={active} style={{ animation: 'pt-fade-in 400ms ease both' }}>
          <H2 style={{ fontSize: 'clamp(28px, 3vw, 44px)', letterSpacing: -0.8, marginBottom: 28 }}>
            {copy[active].h}
          </H2>
          <Lead style={{ color: LP_INK, maxWidth: 500 }}>{copy[active].l}</Lead>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MiniPhone width={340} height={700}>
            {active === 'today'    && <FeatureScreenToday/>}
            {active === 'history'  && <FeatureScreenHistory/>}
            {active === 'insights' && <FeatureScreenInsights/>}
            {active === 'circle'   && <FeatureScreenCircle/>}
          </MiniPhone>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .features-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </Section>
  );
}

/* ── Feature screen: Today (mid-typing) ────────────────── */
function FeatureScreenToday() {
  return (
    <div style={{
      height: '100%', padding: '12px 22px 16px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div>
        <Meta size={10} ls={1.4} style={{ display: 'block', marginBottom: 4, whiteSpace: 'nowrap' }}>Tue · Jun 18</Meta>
        <div style={{ fontFamily: LP_SANS, fontWeight: 600, fontSize: 26, letterSpacing: -0.5, lineHeight: 1, color: LP_INK, whiteSpace: 'nowrap' }}>
          Today
        </div>
      </div>
      <div style={{
        padding: '12px 14px', borderLeft: `2px solid ${LP_INK_FADE}`,
        fontFamily: LP_SANS, fontSize: 13, color: LP_INK_DIM, lineHeight: 1.5,
      }}>
        What did you let go of without grieving?
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          fontFamily: LP_SERIF, fontSize: 17, lineHeight: 1.6, color: LP_INK, letterSpacing: -0.1,
        }}>
          The first coffee was bitter and I drank it slowly anyway.
          I noticed how quiet the floor is before nine.
          <span style={{ display: 'inline-block', width: 7, height: 18, background: LP_INK,
                          marginLeft: 1, verticalAlign: '-2px', animation: 'lp-cursor 1s steps(1) infinite' }}/>
        </div>
      </div>
      <div style={{
        paddingTop: 14, borderTop: `1px solid ${LP_FRAME}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <MiniDots filled={2} total={3} size={9}/>
        <Meta size={11} ls={1.4} color={LP_INK_DIM}>2 / 3 · 1 more</Meta>
      </div>
      <div style={{
        width: '100%', height: 48, borderRadius: 999,
        border: `1px solid ${LP_INK_FADE}`, color: LP_INK_DIM,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: LP_SANS, fontSize: 14, fontWeight: 500, letterSpacing: 0.3,
      }}>Submit</div>
    </div>
  );
}

/* ── Feature screen: History ───────────────────────────── */
function FeatureScreenHistory() {
  // Pre-baked 5×7 grid; some filled, some empty
  const filled = new Set([1,2,3,4,5,7,8,10,11,14,15,16,17,21,22,23,24,28]);
  const today = 18;
  return (
    <div style={{
      height: '100%', padding: '20px 22px 16px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div>
        <Meta size={10} ls={1.4} style={{ display: 'block', marginBottom: 4 }}>History · 184 entries</Meta>
        <div style={{
          fontFamily: LP_SANS, fontWeight: 600, fontSize: 26, letterSpacing: -0.5, lineHeight: 1, color: LP_INK,
        }}>Your year</div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 0',
      }}>
        <div style={{ width: 18, height: 18, color: LP_INK_DIM, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</div>
        <div style={{ fontFamily: LP_SANS, fontWeight: 500, fontSize: 16, color: LP_INK, letterSpacing: -0.2 }}>
          June 2026
        </div>
        <div style={{ width: 18, height: 18, color: LP_INK_DIM, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5,
        fontFamily: LP_MONO, fontSize: 9, color: LP_INK_DIM, textAlign: 'center', letterSpacing: 1.2,
      }}>
        {['S','M','T','W','T','F','S'].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
        {Array.from({ length: 35 }).map((_, i) => {
          // June starts Mon (DOW 1); pad first cell
          const d = i - 0; // start on Sun=0
          const dayNum = d;
          const isWritten = filled.has(dayNum);
          const isToday = dayNum === today;
          return (
            <div key={i} style={{
              aspectRatio: '1 / 1', borderRadius: 6,
              border: isToday ? `1.5px solid ${LP_INK_BRIGHT}` : (isWritten ? 'none' : `1px solid ${LP_FRAME}`),
              background: isWritten ? LP_INK : 'transparent',
              color: isWritten ? '#0a0a0a' : (dayNum > 30 || dayNum < 1 ? 'transparent' : LP_INK_DIM),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: LP_MONO, fontSize: 9, fontWeight: 500,
            }}>{dayNum > 0 && dayNum <= 30 ? dayNum : ''}</div>
          );
        })}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12,
        fontFamily: LP_MONO, fontSize: 9, color: LP_INK_DIM, letterSpacing: 1, textTransform: 'uppercase',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 9, height: 9, background: LP_INK, borderRadius: 2 }}/>written</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 9, height: 9, border: `1px solid ${LP_FRAME}`, borderRadius: 2 }}/>empty</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 9, height: 9, border: `1px solid ${LP_INK_BRIGHT}`, borderRadius: 2 }}/>today</span>
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{
        borderTop: `1px solid ${LP_FRAME}`, paddingTop: 12,
        display: 'flex', justifyContent: 'space-between',
      }}>
        {[['18', 'of 30'], ['60%', 'this month'], ['184', 'all-time']].map(([v, l]) => (
          <div key={l} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: LP_SERIF, fontStyle: 'italic', fontSize: 22, color: LP_INK, letterSpacing: -0.4, lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: LP_MONO, fontSize: 8, color: LP_INK_DIM, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Feature screen: Insights ──────────────────────────── */
function FeatureScreenInsights() {
  return (
    <div style={{
      height: '100%', padding: '20px 22px 16px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div>
        <Meta size={10} ls={1.4} style={{ display: 'block', marginBottom: 4 }}>Insights</Meta>
        <div style={{
          fontFamily: LP_SANS, fontWeight: 600, fontSize: 26, letterSpacing: -0.5, lineHeight: 1, color: LP_INK,
        }}>Your practice</div>
      </div>
      <div style={{
        padding: 18, background: LP_SURFACE, borderRadius: 16, border: `1px solid ${LP_FRAME}`,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontFamily: LP_SERIF, fontStyle: 'italic', fontSize: 56, color: LP_INK, letterSpacing: -1.6, lineHeight: 1 }}>13</div>
        <div style={{ flex: 1 }}>
          <Meta size={9} ls={1.4} style={{ display: 'block', marginBottom: 4 }}>Current streak</Meta>
          <div style={{ fontSize: 12, color: LP_INK, lineHeight: 1.5 }}>
            Five more days and you tie your personal best.
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[['21', 'Longest'], ['184', 'Entries'], ['363', 'Goal']].map(([v, l]) => (
          <div key={l} style={{
            border: `1px solid ${LP_FRAME}`, borderRadius: 12,
            padding: '12px 6px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: LP_SERIF, fontStyle: 'italic', fontSize: 20, color: LP_INK, letterSpacing: -0.4, lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: LP_MONO, fontSize: 8, color: LP_INK_DIM, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <PromptStack/>
    </div>
  );
}

/* Cycling prompt stack — active card gets bright left border, cycles every 1800ms */
function PromptStack() {
  const prompts = [
    { e: "Today's prompt",         q: 'What did you let go of without grieving?' },
    { e: "Yesterday's reflection",  q: 'Where did you feel most yourself?' },
    { e: 'Pattern this week',       q: 'Three entries mention waking before six.' },
    { e: "30-day theme",            q: 'A month of returning to slowness.' },
  ];
  const [active, setActive] = bS(0);
  bE(() => {
    const id = setInterval(() => setActive(a => (a + 1) % prompts.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {prompts.map((p, i) => {
        const isActive = i === active;
        return (
          <div key={i} style={{
            padding: '12px 14px',
            borderLeft: `2px solid ${isActive ? LP_INK_BRIGHT : LP_INK_FADE}`,
            background: LP_SURFACE, borderRadius: 8,
            opacity: isActive ? 1 : 0.55,
            transition: 'opacity 400ms ease, border-color 400ms ease',
          }}>
            <Meta size={9} ls={1.2} color={isActive ? LP_INK_BRIGHT : LP_INK_DIM}
                  style={{ display: 'block', marginBottom: 4 }}>{p.e}</Meta>
            <div style={{
              fontFamily: LP_SANS, fontWeight: 500,
              fontSize: isActive ? 13 : 12, color: LP_INK, lineHeight: 1.4,
              transition: 'font-size 400ms ease',
            }}>{p.q}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Feature screen: The Circle (cycles between 3 sub-views) ─── */
function FeatureScreenCircle() {
  const [view, setView] = bS(0); // 0: list, 1: DM, 2: group
  bE(() => {
    const id = setInterval(() => setView(v => (v + 1) % 3), 5000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {[CircleListView, CircleDMView, CircleGroupView].map((V, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          opacity: view === i ? 1 : 0,
          transform: view === i ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 600ms ease, transform 600ms cubic-bezier(0.16,1,0.3,1)',
          pointerEvents: view === i ? 'auto' : 'none',
        }}>
          <V/>
        </div>
      ))}
      {/* Pager */}
      <div style={{
        position: 'absolute', bottom: 16, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 6, zIndex: 10,
      }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: view === i ? 14 : 4, height: 4, borderRadius: 2,
            background: view === i ? LP_INK_BRIGHT : LP_INK_FADE,
            transition: 'all 300ms ease',
          }}/>
        ))}
      </div>
    </div>
  );
}

function CircleListView() {
  return (
    <div style={{
      height: '100%', padding: '12px 22px 32px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{
          fontFamily: LP_SANS, fontWeight: 600, fontSize: 26, letterSpacing: -0.5, lineHeight: 1, color: LP_INK,
        }}>The Circle</div>
        <div style={{ color: LP_INK_DIM, fontSize: 18 }}>+</div>
      </div>
      <div style={{
        height: 38, borderRadius: 10, border: `1px solid ${LP_FRAME}`,
        background: LP_SURFACE, padding: '0 12px',
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: LP_SANS, fontSize: 13, color: LP_INK_DIM,
      }}>
        <span style={{ fontSize: 14 }}>⌕</span>
        <span>Find by @handle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {[
          { n: 'Maya Howell',  h: '@maya_h',  l: 'Walked to work in the rain today.', s: 21, u: 2, c: '#c8b6a6' },
          { n: 'Jules Park',   h: '@jules.p', l: 'I read your June 14 entry…',         s: 7,  u: 1, c: '#a3b6c8' },
          { n: 'Ren Okafor',   h: '@ren_o',   l: 'Reread Berger last night.',          s: 64, u: 0, c: '#b6c8a6' },
          { n: 'Iris Sandoval',h: '@iris.s',  l: 'See you Friday.',                    s: 4,  u: 0, c: '#c8a6b8' },
          { n: 'Theo Lin',     h: '@theo_l',  l: 'The kettle bit got me.',             s: 31, u: 0, c: '#c8c2a6' },
        ].map((f, i) => (
          <div key={f.h} style={{
            padding: '10px 0', display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: i < 4 ? `1px solid ${LP_FRAME}` : 'none',
          }}>
            <CircleAvatar name={f.n} color={f.c} size={36}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: LP_INK }}>{f.n}</span>
                <Meta size={9} ls={0.6}>{f.h}</Meta>
              </div>
              <div style={{ fontSize: 11, color: LP_INK_DIM, lineHeight: 1.3, marginTop: 2,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.l}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <Meta size={9} ls={0.6}>{f.s}</Meta>
              {f.u > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: LP_INK_BRIGHT }}/>}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        fontFamily: LP_MONO, fontSize: 9, color: LP_INK_DIM, letterSpacing: 1.2, textTransform: 'uppercase',
        textAlign: 'center', borderTop: `1px solid ${LP_FRAME}`, paddingTop: 10,
      }}>
        End-to-end encrypted
      </div>
    </div>
  );
}

function CircleDMView() {
  const msgs = [
    { from: 'them', text: 'I read your June 14 entry. The dentist line stayed with me.' },
    { from: 'me',   text: 'He was so gentle I almost cried. Thanks for noticing.' },
    { from: 'them', text: 'How did the rest of the day land?' },
    { from: 'me',   text: 'Quiet. I walked the long way home and bought peaches.' },
    { from: 'them', text: 'Send a picture of the peaches.' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 18px 12px', borderBottom: `1px solid ${LP_FRAME}`, gap: 8,
      }}>
        <div style={{ color: LP_INK_DIM, fontSize: 18, width: 18 }}>‹</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CircleAvatar name="Maya Howell" color="#c8b6a6" size={28}/>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: LP_INK }}>@maya_h</div>
            <Meta size={9} ls={1}>Active now</Meta>
          </div>
        </div>
        <div style={{ color: LP_INK_DIM, fontSize: 16, width: 18, textAlign: 'right' }}>⋯</div>
      </div>
      {/* Messages */}
      <div style={{ flex: 1, padding: '14px 16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start',
            gap: 6, alignItems: 'flex-end',
          }}>
            {m.from === 'them' && <CircleAvatar name="MH" color="#c8b6a6" size={20}/>}
            <div style={{
              maxWidth: '72%',
              padding: '7px 11px',
              borderRadius: m.from === 'me' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: m.from === 'me' ? LP_INK_BRIGHT : LP_SURFACE,
              color: m.from === 'me' ? '#0a0a0a' : LP_INK,
              fontSize: 12, lineHeight: 1.4,
              border: m.from === 'them' ? `1px solid ${LP_FRAME}` : 'none',
            }}>{m.text}</div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px 32px', borderTop: `1px solid ${LP_FRAME}`,
      }}>
        <div style={{
          flex: 1, height: 34, borderRadius: 17, border: `1px solid ${LP_FRAME}`,
          background: LP_SURFACE, padding: '0 14px',
          display: 'flex', alignItems: 'center',
          fontFamily: LP_SANS, fontSize: 12, color: LP_INK_DIM,
        }}>Message…</div>
        <div style={{
          width: 34, height: 34, borderRadius: 17, background: LP_INK_BRIGHT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#0a0a0a', fontSize: 14,
        }}>↑</div>
      </div>
    </div>
  );
}

function CircleGroupView() {
  const msgs = [
    { from: 'jules', name: 'Jules', text: 'Saturday morning check-in?' },
    { from: 'me',    name: 'me',    text: 'In. 9am at the usual spot.' },
    { from: 'ren',   name: 'Ren',   text: 'I read all three of yours this week. Quiet writing.' },
    { from: 'maya',  name: 'Maya',  text: 'Same. The kettle line.' },
  ];
  const colors = { jules: '#a3b6c8', ren: '#b6c8a6', maya: '#c8b6a6', me: '#c8c2a6' };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 18px 12px', borderBottom: `1px solid ${LP_FRAME}`, gap: 8,
      }}>
        <div style={{ color: LP_INK_DIM, fontSize: 18, width: 18 }}>‹</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Stacked avatars */}
          <div style={{ position: 'relative', width: 36, height: 28 }}>
            <div style={{ position: 'absolute', left: 0,  top: 0 }}><CircleAvatar name="JP" color="#a3b6c8" size={20}/></div>
            <div style={{ position: 'absolute', left: 8,  top: 4 }}><CircleAvatar name="RO" color="#b6c8a6" size={20}/></div>
            <div style={{ position: 'absolute', left: 16, top: 0 }}><CircleAvatar name="MH" color="#c8b6a6" size={20}/></div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: LP_INK }}>Sunday Circle</div>
            <Meta size={9} ls={1}>4 members</Meta>
          </div>
        </div>
        <div style={{ color: LP_INK_DIM, fontSize: 16, width: 18, textAlign: 'right' }}>⋯</div>
      </div>
      <div style={{ flex: 1, padding: '14px 16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start',
            gap: 6, alignItems: 'flex-end',
          }}>
            {m.from !== 'me' && <CircleAvatar name={m.name[0]+m.name[1]} color={colors[m.from]} size={20}/>}
            <div>
              {m.from !== 'me' && (
                <Meta size={9} ls={0.6} style={{ display: 'block', marginBottom: 2, marginLeft: 4 }}>{m.name}</Meta>
              )}
              <div style={{
                maxWidth: 220,
                padding: '7px 11px',
                borderRadius: m.from === 'me' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: m.from === 'me' ? LP_INK_BRIGHT : LP_SURFACE,
                color: m.from === 'me' ? '#0a0a0a' : LP_INK,
                fontSize: 12, lineHeight: 1.4,
                border: m.from === 'them' || m.from !== 'me' ? `1px solid ${LP_FRAME}` : 'none',
              }}>{m.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px 32px', borderTop: `1px solid ${LP_FRAME}`,
      }}>
        <div style={{
          flex: 1, height: 34, borderRadius: 17, border: `1px solid ${LP_FRAME}`,
          background: LP_SURFACE, padding: '0 14px',
          display: 'flex', alignItems: 'center',
          fontFamily: LP_SANS, fontSize: 12, color: LP_INK_DIM,
        }}>Message the circle…</div>
        <div style={{
          width: 34, height: 34, borderRadius: 17, background: LP_INK_BRIGHT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#0a0a0a', fontSize: 14,
        }}>↑</div>
      </div>
    </div>
  );
}

/* Local avatar — reused by all 3 Circle sub-views */
function CircleAvatar({ name, color, size = 36 }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 60%, #000))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#0e0e10', fontFamily: LP_SANS, fontWeight: 600,
      fontSize: size * 0.36, letterSpacing: -0.3,
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

/* ── 363 ─────────────────────────────────────────────────── */
function The363Section() {
  const [ref, seen] = useInView(0.2);
  const [n, setN] = bS(0);
  bE(() => {
    if (!seen) return;
    let cancelled = false;
    let cur = 0;
    const tick = () => {
      if (cancelled) return;
      cur = Math.min(363, cur + 3);
      setN(cur);
      if (cur < 363) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
  }, [seen]);
  return (
    <Section id="363" py={200} style={{ overflow: 'hidden' }}>
      <div ref={ref} style={{ position: 'relative', textAlign: 'center' }}>
        {/* 363 watermark — italic Newsreader allowed at massive scale */}
        <div aria-hidden style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          fontFamily: LP_SERIF, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(220px, 32vw, 520px)',
          color: LP_INK, opacity: 0.03, letterSpacing: -12, lineHeight: 1,
          pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
        }}>363</div>
        <div style={{ position: 'relative' }}>
          <Eyebrow style={{ marginBottom: 32, display: 'block' }}>Not 365.</Eyebrow>
          {/* Animated counter — italic Newsreader (numeral) */}
          <div style={{
            fontFamily: LP_SERIF, fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(100px, 18vw, 220px)',
            color: LP_INK, letterSpacing: -8, lineHeight: 0.95,
            fontVariantNumeric: 'tabular-nums', marginBottom: 40,
          }}>{String(n).padStart(3, '0')}</div>
          <H2 style={{ marginBottom: 0 }}>
            <span style={{ color: LP_INK_DIM }}>You cannot be perfect.</span>{' '}
            <span style={{ color: LP_INK }}>But you can be relentless.</span>
          </H2>
          <Lead style={{ color: LP_INK_DIM, maxWidth: 580, margin: '32px auto 0' }}>
            Three Sentences asks for 363 days a year — not 365. Two days of grace, built in.
            Miss a day, return without shame. Empty days are not failures.
          </Lead>
        </div>
      </div>
    </Section>
  );
}

/* ── Principles (2×2) ───────────────────────────────────── */
function PrinciplesSection() {
  const items = [
    { n: '01', t: 'Permanence.', b: 'Once submitted, an entry cannot be edited or deleted. Your words stand as written, capturing how you felt in that moment.' },
    { n: '02', t: 'Privacy.',    b: 'End-to-end encrypted chat. AI features are opt-in. Nothing leaves the device unless you turn it on.' },
    { n: '03', t: 'Presence.',   b: 'No notification badges that guilt-trip you into opening the app. The practice asks for sixty seconds. That is all.' },
    { n: '04', t: 'People.',     b: 'Invite-only friends. No follower counts, no feed, no comments. A circle small enough to actually know.' },
  ];
  return (
    <Section py={160} bg={LP_PAPER_2}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <Eyebrow style={{ marginBottom: 28 }}>What we believe</Eyebrow>
          <H2>Four principles. We hold them like a hand on a railing.</H2>
        </div>
      </Reveal>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, gridAutoRows: '1fr',
      }} className="principles-grid">
        {items.map((p, i) => (
          <Reveal key={p.n} delay={i * 80}>
            <div style={{
              padding: '56px 52px',
              border: `1px solid ${LP_FRAME}`, borderRadius: 20,
              background: 'rgba(255,255,255,0.012)',
              height: '100%',
            }}>
              <Meta size={11} ls={2.4} style={{ marginBottom: 24, display: 'block' }}>{p.n}</Meta>
              <H3 style={{ marginBottom: 20 }}>{p.t}</H3>
              <P style={{ color: LP_INK_DIM, lineHeight: 1.65 }}>{p.b}</P>
            </div>
          </Reveal>
        ))}
      </div>
      <style>{`@media (max-width: 900px) { .principles-grid { grid-template-columns: 1fr !important; } }`}</style>
    </Section>
  );
}

/* ── AI Reflection ──────────────────────────────────────── */
function AISection() {
  const [range, setRange] = bS('7d');
  const reads = {
    '7d':  { theme: 'Letting go, on your own terms.',
             obs:   'Across seven entries you returned twice to a kettle and once to a sunrise. Three quiet moments where you stopped before reaching for your phone.',
             q:     'What did the kettle give you that the inbox could not?' },
    '30d': { theme: 'A month of returning to slowness.',
             obs:   'You wrote about walking eleven times, about reading nine, about your mother three. The word "quiet" appears seven times across thirty entries.',
             q:     'When was the last time silence felt like a friend?' },
    '90d': { theme: 'Building a quieter shape to your days.',
             obs:   'Over three months the meetings have receded and the walks have grown. Something is happening that you have not named yet.',
             q:     'If you had to name it, what would you call it?' },
  };
  const r = reads[range];
  return (
    <Section py={160}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
      }} className="ai-grid">
        <Reveal>
          <Eyebrow style={{ marginBottom: 28 }}>Optional · always opt-in</Eyebrow>
          <H2 style={{ marginBottom: 32 }}>
            AI that finds patterns<br/>
            <span style={{ color: LP_INK_DIM }}>without rewriting you.</span>
          </H2>
          <Lead style={{ color: LP_INK, marginBottom: 36, maxWidth: 480 }}>
            Once a week, optionally, an AI reads back across 7, 30, or 90 days of your entries.
            It surfaces a theme. It asks a question. It never tells you what to feel.
          </Lead>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['7d','7 days'], ['30d','30 days'], ['90d','90 days']].map(([k, l]) => {
              const isActive = range === k;
              return (
                <button key={k} onClick={() => setRange(k)} style={{
                  padding: '10px 20px', borderRadius: 999,
                  background: isActive ? LP_INK : 'transparent',
                  color: isActive ? '#0a0a0a' : LP_INK_DIM,
                  border: `1px solid ${isActive ? LP_INK : LP_FRAME}`,
                  fontFamily: LP_MONO, fontSize: 11, fontWeight: 500,
                  letterSpacing: 1.4, textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 200ms ease',
                  whiteSpace: 'nowrap',
                }}>{l}</button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div key={range}
               style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'pt-fade-in 400ms ease both' }}>
            <div style={{
              padding: '22px 24px', borderRadius: 16,
              background: LP_SURFACE, border: `1px solid ${LP_FRAME}`,
            }}>
              <Meta size={10} ls={1.4} style={{ display: 'block', marginBottom: 10 }}>Theme</Meta>
              <H3 style={{ fontSize: 22, letterSpacing: -0.3, fontWeight: 600 }}>{r.theme}</H3>
            </div>
            <div style={{
              padding: '22px 24px', borderRadius: 16,
              background: LP_SURFACE, border: `1px solid ${LP_FRAME}`,
            }}>
              <Meta size={10} ls={1.4} style={{ display: 'block', marginBottom: 10 }}>Observation</Meta>
              <P style={{ color: LP_INK, lineHeight: 1.6 }}>{r.obs}</P>
            </div>
            <div style={{
              padding: '22px 24px', borderRadius: 16,
              background: LP_SURFACE, borderLeft: `2px solid ${LP_INK_BRIGHT}`,
              border: `1px solid ${LP_FRAME}`, borderLeftWidth: 2, borderLeftColor: LP_INK_BRIGHT,
            }}>
              <Meta size={10} ls={1.6} color={LP_INK_BRIGHT} style={{ display: 'block', marginBottom: 10 }}>
                A question to sit with
              </Meta>
              <P style={{ color: LP_INK, fontSize: 17, fontWeight: 500, lineHeight: 1.45 }}>{r.q}</P>
            </div>
            <Meta size={10} ls={1.4} style={{ textAlign: 'center', marginTop: 8 }}>
              AI patterns may be wrong. Use with care. Crisis resources always available.
            </Meta>
          </div>
        </Reveal>
      </div>
      <style>{`@media (max-width: 900px) { .ai-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </Section>
  );
}

/* ── Trust ──────────────────────────────────────────────── */
function TrustSection() {
  const quotes = [
    { q: 'I stopped journaling three times before this. The constraint is the only thing that has worked.',
      a: 'Early beta tester, London' },
    { q: 'It is the most-used app on my phone and I never think about it. Which is the entire point.',
      a: 'Designer, New York' },
    { q: 'A year in, I have 312 entries and the streak does not feel like an obligation. It feels like a ritual.',
      a: 'Founder, Singapore' },
  ];
  return (
    <Section py={160} bg={LP_PAPER_2}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <Eyebrow style={{ marginBottom: 28 }}>What they say</Eyebrow>
          <H2>Quiet endorsements.</H2>
        </div>
      </Reveal>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
      }} className="trust-grid">
        {quotes.map((qq, i) => (
          <Reveal key={i} delay={i * 120}>
            <div style={{
              padding: '36px 32px',
              border: `1px solid ${LP_FRAME}`, borderRadius: 20,
              background: 'rgba(255,255,255,0.012)',
              height: '100%', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                fontFamily: LP_SERIF, fontStyle: 'italic',
                fontSize: 72, color: LP_INK, opacity: 0.12,
                lineHeight: 0.6, marginBottom: -16,
              }}>“</div>
              <p style={{
                fontFamily: LP_SANS, fontWeight: 500,
                fontSize: 18, color: LP_INK, lineHeight: 1.5,
                margin: 0, flex: 1,
              }}>{qq.q}</p>
              <div style={{ marginTop: 32 }}>
                <div style={{ width: 32, height: 1, background: LP_INK_FADE, marginBottom: 14 }}/>
                <P style={{ color: LP_INK_DIM, fontSize: 12 }}>{qq.a}</P>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <style>{`@media (max-width: 900px) { .trust-grid { grid-template-columns: 1fr !important; } }`}</style>
    </Section>
  );
}

Object.assign(window, {
  FeaturesSection, FeatureScreenToday, FeatureScreenHistory, FeatureScreenInsights, FeatureScreenCircle,
  CircleListView, CircleDMView, CircleGroupView, CircleAvatar,
  PromptStack, The363Section, PrinciplesSection, AISection, TrustSection,
});

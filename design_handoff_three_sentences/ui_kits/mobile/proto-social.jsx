/* proto-social.jsx — The Circle (friends + requests), conversations, chat. */

function ScreenSocial() {
  const { state, set } = useApp();
  const [tab, setTab] = React.useState('friends'); // friends | requests
  const [query, setQuery] = React.useState('');

  const filteredFriends = state.friends.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.handle.toLowerCase().includes(query.toLowerCase())
  );

  if (state.friends.length === 0) return <SocialEmpty />;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader large title="The Circle" right={
        <Row gap={14}>
          <button onClick={() => set({ modal: 'conversations' })} style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer', padding: 0, display: 'flex' }}>{I.chat}</button>
          <button onClick={() => set({ modal: 'invite' })} style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer', padding: 0, display: 'flex' }}>{I.plus}</button>
        </Row>
      } />

      <Col gap={14} style={{ padding: '0 24px 6px', flexShrink: 0 }}>
        <div style={{
          height: 42, borderRadius: 12, border: `1px solid ${FRAME}`,
          background: SURFACE, padding: '0 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ color: INK_DIM, display: 'inline-flex' }}>{I.search}</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find by @handle"
            style={{ flex: 1, fontSize: 14, color: INK, background: 'transparent' }}
          />
        </div>

        <Row gap={8}>
          <Chip on={tab === 'friends'} onClick={() => setTab('friends')}>Friends · {state.friends.length}</Chip>
          <Chip on={tab === 'requests'} onClick={() => setTab('requests')}>Requests · {state.requests.length}</Chip>
        </Row>
      </Col>

      <div className="pt-scroll" style={{ flex: 1, padding: '14px 24px 18px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {tab === 'friends' ? (
          filteredFriends.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: INK_DIM, fontFamily: SANS, fontSize: 13 }}>
              No one by that name.
            </div>
          ) : filteredFriends.map((f) => (
            <FriendRow key={f.id} friend={f} onChat={() => set({ modal: `chat:${f.id}` })} />
          ))
        ) : (
          <RequestsList />
        )}
      </div>
    </div>
  );
}

function FriendRow({ friend, onChat }) {
  return (
    <button onClick={onChat} style={{
      padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: `1px solid ${FRAME}`,
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: INK, width: '100%', textAlign: 'left',
    }}>
      <Avatar color={friend.avatar} name={friend.name} size={44} />
      <Col gap={3} style={{ flex: 1, minWidth: 0 }}>
        <Row align="center" gap={8}>
          <div style={{ fontSize: 15, fontWeight: 500, color: INK }}>{friend.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 0.6 }}>{friend.handle}</div>
        </Row>
        <div style={{
          fontSize: 12, color: INK_DIM, lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{friend.lastMsg}</div>
      </Col>
      <Col gap={4} style={{ alignItems: 'flex-end' }}>
        <Row gap={4} align="center" style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 0.6 }}>
          <span style={{ display: 'inline-flex' }}>{I.flame}</span>
          <span>{friend.streak}</span>
        </Row>
        {friend.unread > 0 ? (
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: INK_BRIGHT }} />
        ) : null}
      </Col>
    </button>
  );
}

/* ── Requests ─────────────────────────────────────────────────── */
function RequestsList() {
  const { state, set } = useApp();

  const accept = (id) => {
    set((s) => {
      const req = s.requests.find((r) => r.id === id);
      if (!req) return s;
      const newFriend = { ...req, streak: 1, lastMsg: 'Just connected.', unread: 0 };
      return {
        ...s,
        friends: [newFriend, ...s.friends],
        requests: s.requests.filter((r) => r.id !== id),
      };
    });
  };
  const reject = (id) => {
    set((s) => ({ ...s, requests: s.requests.filter((r) => r.id !== id) }));
  };
  const add = (id) => {
    set((s) => {
      const sug = s.suggested.find((r) => r.id === id);
      if (!sug) return s;
      return {
        ...s,
        suggested: s.suggested.filter((r) => r.id !== id),
        requests: [...s.requests, { ...sug, mutual: 'Pending' }],
      };
    });
  };

  return (
    <Col gap={4}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase', padding: '6px 0 8px' }}>Incoming</div>
      {state.requests.length === 0 ? (
        <div style={{ padding: '14px 0', color: INK_DIM, fontFamily: SANS, fontSize: 13 }}>
          No incoming requests.
        </div>
      ) : state.requests.map((r) => (
        <div key={r.id} style={{
          padding: '12px 14px', background: SURFACE, borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
        }}>
          <Avatar color={r.avatar} name={r.name} size={40} />
          <Col gap={3} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: INK }}>{r.name}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 0.6 }}>{r.handle} · {r.mutual}</div>
          </Col>
          <Row gap={6}>
            <button onClick={() => accept(r.id)} style={{
              width: 36, height: 30, borderRadius: 999,
              background: INK_BRIGHT, color: '#0a0a0a', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>{I.check}</button>
            <button onClick={() => reject(r.id)} style={{
              width: 36, height: 30, borderRadius: 999,
              background: 'transparent', color: INK_DIM, border: `1px solid ${FRAME}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>{I.close}</button>
          </Row>
        </div>
      ))}

      <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase', padding: '14px 0 8px' }}>Suggested</div>
      {state.suggested.map((s) => (
        <div key={s.id} style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${FRAME}` }}>
          <Avatar color={s.avatar} name={s.name} size={34} />
          <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: INK }}>{s.name}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 0.6 }}>{s.handle} · {s.mutual}</div>
          </Col>
          <button onClick={() => add(s.id)} style={{
            padding: '6px 14px', borderRadius: 999,
            background: 'transparent', color: INK, border: `1px solid ${FRAME}`,
            fontFamily: MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', cursor: 'pointer',
          }}>Add</button>
        </div>
      ))}
    </Col>
  );
}

/* ── Empty social state ───────────────────────────────────────── */
function SocialEmpty() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader large title="The Circle" />
      <Col gap={20} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: '0 26px', textAlign: 'center' }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: INK, letterSpacing: -0.4 }}>A private circle.</div>
        <div style={{ fontSize: 14, color: INK_DIM, lineHeight: 1.55, maxWidth: 260 }}>
          No friends yet. Three Sentences is invite-only — your circle stays small on purpose.
        </div>
        <Btn fill w={220}>Invite by @handle</Btn>
      </Col>
    </div>
  );
}

/* ── Conversations modal ──────────────────────────────────────── */
function ConversationsModal() {
  const { state, set } = useApp();
  const withMessages = state.friends; // for the prototype, all friends are in convo list
  return (
    <ModalSheet onClose={() => set({ modal: null })}>
      <PageHeader title="Messages" sub="End-to-end encrypted" back={() => set({ modal: null })} right={<button onClick={() => set({ modal: null })} style={{ background: 'none', border: 'none', color: INK_DIM, cursor: 'pointer', padding: 0, display: 'flex' }}>{I.close}</button>} />
      <div className="pt-scroll" style={{ flex: 1, padding: '8px 24px 24px', overflowY: 'auto' }}>
        {withMessages.map((f) => (
          <FriendRow key={f.id} friend={f} onChat={() => set({ modal: `chat:${f.id}` })} />
        ))}
      </div>
    </ModalSheet>
  );
}

/* ── Chat modal ───────────────────────────────────────────────── */
function ChatModal({ friendId }) {
  const { state, set } = useApp();
  const friend = state.friends.find((f) => f.id === friendId);
  const [input, setInput] = React.useState('');
  const [failed, setFailed] = React.useState(false);
  const scrollRef = React.useRef(null);

  const msgs = state.chats[friendId] || [{ from: 'them', text: `Hi! I'm ${friend ? friend.name.split(' ')[0] : 'there'}.`, t: '9:01 AM' }];

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs.length]);

  if (!friend) {
    return (
      <ModalSheet onClose={() => set({ modal: null })}>
        <Col style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <div style={{ color: INK_DIM }}>Conversation not found.</div>
          <Btn ghost onClick={() => set({ modal: null })}>Close</Btn>
        </Col>
      </ModalSheet>
    );
  }

  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();
    const t = '9:48 AM';

    if (!state.prefs.online) {
      // simulate failure when offline
      setFailed(true);
      return;
    }

    set((s) => ({
      ...s,
      chats: { ...s.chats, [friendId]: [...(s.chats[friendId] || []), { from: 'me', text, t }] },
      friends: s.friends.map((f) => f.id === friendId ? { ...f, unread: 0, lastMsg: text } : f),
    }));
    setInput('');
    setFailed(false);

    // simulate auto-reply
    setTimeout(() => {
      const replies = ['Mm.', 'Thank you for that.', 'I needed to hear it.', 'Tell me more later.', 'Same here.'];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      set((s) => ({
        ...s,
        chats: { ...s.chats, [friendId]: [...(s.chats[friendId] || []), { from: 'them', text: reply, t: '9:49 AM' }] },
      }));
    }, 1400);
  };

  return (
    <ModalSheet onClose={() => set({ modal: null })}>
      <Row align="center" justify="space-between" style={{ padding: '8px 18px 12px', borderBottom: `1px solid ${FRAME}` }}>
        <button onClick={() => set({ modal: null })} style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer', padding: 4, display: 'flex' }}>{I.arrowL}</button>
        <Row gap={10} align="center">
          <Avatar color={friend.avatar} name={friend.name} size={30} />
          <Col gap={1} style={{ alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: INK }}>{friend.handle}</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: INK_DIM, letterSpacing: 1, textTransform: 'uppercase' }}>Active now</div>
          </Col>
        </Row>
        <button style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer', padding: 4, display: 'flex' }}>{I.more}</button>
      </Row>

      <div ref={scrollRef} className="pt-scroll" style={{ flex: 1, padding: '16px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start',
            gap: 6, alignItems: 'flex-end',
          }}>
            {m.from === 'them' ? <Avatar color={friend.avatar} name={friend.name} size={22} /> : null}
            <div style={{
              maxWidth: '72%',
              padding: '9px 13px',
              borderRadius: m.from === 'me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.from === 'me' ? INK_BRIGHT : SURFACE,
              color: m.from === 'me' ? '#0a0a0a' : INK,
              fontSize: 14, lineHeight: 1.4,
              border: m.from === 'them' ? `1px solid ${FRAME}` : 'none',
            }}>{m.text}</div>
          </div>
        ))}
        {failed ? (
          <Col gap={4} style={{ alignItems: 'flex-end' }}>
            <div style={{
              maxWidth: '72%', padding: '9px 13px',
              borderRadius: '16px 16px 4px 16px',
              border: `1px solid ${WARN}`, background: 'transparent', color: INK,
              fontSize: 14, lineHeight: 1.4,
            }}>{input}</div>
            <button onClick={() => { setFailed(false); send(); }} style={{
              background: 'transparent', border: 'none', color: WARN, cursor: 'pointer',
              fontFamily: MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 5, padding: 0,
            }}>
              <span style={{ display: 'inline-flex' }}>{I.close}</span> Failed · tap to retry
            </button>
          </Col>
        ) : null}
      </div>

      <Row gap={8} align="center" style={{ padding: '12px 18px 20px', borderTop: `1px solid ${FRAME}` }}>
        <div style={{
          flex: 1, height: 38, borderRadius: 19, border: `1px solid ${FRAME}`,
          background: SURFACE, padding: '0 14px',
          display: 'flex', alignItems: 'center',
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="Message…"
            style={{ flex: 1, fontSize: 14, color: INK, background: 'transparent' }}
          />
        </div>
        <button onClick={send} disabled={!input.trim()} style={{
          width: 38, height: 38, borderRadius: 19,
          background: input.trim() ? INK_BRIGHT : SURFACE,
          color: input.trim() ? '#0a0a0a' : INK_DIM,
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: input.trim() ? 'pointer' : 'default',
        }}>{I.arrowUp}</button>
      </Row>
    </ModalSheet>
  );
}

/* ── Invite modal ─────────────────────────────────────────────── */
function InviteModal() {
  const { set } = useApp();
  const [handle, setHandle] = React.useState('');
  const [sent, setSent] = React.useState(false);
  return (
    <ModalSheet onClose={() => set({ modal: null })} full={false}>
      <div style={{ padding: '24px 26px 30px' }}>
        <Row justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18, color: INK }}>Invite to your circle</div>
          <button onClick={() => set({ modal: null })} style={{ background: 'none', border: 'none', color: INK_DIM, cursor: 'pointer', padding: 4, display: 'flex' }}>{I.close}</button>
        </Row>
        {sent ? (
          <Col gap={14} style={{ alignItems: 'center', padding: '20px 0' }}>
            <span style={{ color: INK_BRIGHT, transform: 'scale(1.6)', display: 'inline-flex' }}>{I.check}</span>
            <div style={{ fontSize: 14, color: INK, textAlign: 'center' }}>Request sent to {handle}.</div>
            <Btn fill onClick={() => set({ modal: null })}>Done</Btn>
          </Col>
        ) : (
          <Col gap={14}>
            <div style={{ fontSize: 13, color: INK_DIM, lineHeight: 1.5 }}>
              Three Sentences is invite-only. Send a request to someone you trust with your practice.
            </div>
            <Field label="Username" value={handle} onChange={(v) => setHandle(v.startsWith('@') ? v : '@' + v.replace(/^@*/, ''))} placeholder="@handle" />
            <Btn fill disabled={handle.length < 4} onClick={() => setSent(true)}>Send request</Btn>
          </Col>
        )}
      </div>
    </ModalSheet>
  );
}

Object.assign(window, { ScreenSocial, SocialEmpty, ConversationsModal, ChatModal, InviteModal });

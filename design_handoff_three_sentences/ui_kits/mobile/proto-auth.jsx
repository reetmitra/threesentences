/* proto-auth.jsx — splash, login, signup, profile setup, interests, 4-step onboarding. */

/* ── 00 Splash ──────────────────────────────────────────────── */
function ScreenSplash() {
  const { set } = useApp();
  const [done, setDone] = React.useState(false);
  const DOT = 22, GAP = 36;

  React.useEffect(() => {
    const t = setTimeout(() => setDone(true), 2400);
    return () => clearTimeout(t);
  }, []);

  const dot = (anim, delay) => ({
    width: DOT, height: DOT, borderRadius: '50%', background: INK_BRIGHT,
    animation: `pt-${anim} 1200ms cubic-bezier(.34,1.5,.64,1) ${delay}ms both`,
  });

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.06), transparent 55%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 40,
      }}>
        <div style={{ display: 'flex', gap: GAP, alignItems: 'center' }}>
          <span style={dot('juggle-l', 0)} />
          <span style={dot('juggle-c', 140)} />
          <span style={dot('juggle-r', 280)} />
        </div>
        <div style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 38, fontWeight: 400, letterSpacing: -0.7, color: INK,
          textAlign: 'center',
          animation: 'pt-fade-up 800ms ease-out 950ms both',
        }}>
          Three&nbsp;Sentences
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
          color: INK_DIM, fontWeight: 500, textAlign: 'center',
          animation: 'pt-fade-up 800ms ease-out 1350ms both',
        }}>
          Be&nbsp;better. Do&nbsp;better.
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 90, left: 24, right: 24,
        opacity: done ? 1 : 0,
        transition: 'opacity 400ms ease',
        pointerEvents: done ? 'auto' : 'none',
      }}>
        <Col gap={10}>
          <Btn fill onClick={() => set({ flow: 'login' })}>Sign in</Btn>
          <Btn ghost onClick={() => set({ flow: 'signup' })}>Create an account</Btn>
        </Col>
      </div>
    </div>
  );
}

/* ── 01 Login ───────────────────────────────────────────────── */
function ScreenLogin() {
  const { set } = useApp();
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const valid = /\S+@\S+\.\S+/.test(email) && pw.length >= 4;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Row align="center" style={{ padding: '8px 22px' }}>
        <button onClick={() => set({ flow: 'splash' })} style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer', padding: 0, display: 'flex' }}>{I.arrowL}</button>
      </Row>
      <Col gap={18} style={{ flex: 1, justifyContent: 'center', padding: '0 26px' }}>
        <Col gap={14} style={{ alignItems: 'center', marginBottom: 12 }}>
          <MarkDot size={44} />
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: INK, letterSpacing: -0.5 }}>Welcome back.</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase' }}>Sign in to continue</div>
        </Col>
        <Field label="Email" value={email} onChange={setEmail} placeholder="you@somewhere.com" type="email" />
        <Field label="Password" value={pw} onChange={setPw} placeholder="••••••••" type="password" />
        <Btn fill disabled={!valid} onClick={() => { set({ flow: 'app', tab: 'today' }); }}>
          Sign in
        </Btn>
        <Row justify="center" gap={6} style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          <span style={{ flex: 1, height: 1, background: FRAME }} />
          <span>or</span>
          <span style={{ flex: 1, height: 1, background: FRAME }} />
        </Row>
        <Btn ghost onClick={() => set({ flow: 'app', tab: 'today' })}>
          <span style={{ marginRight: 8, fontSize: 16 }}></span> Continue with Apple
        </Btn>
        <Row justify="center" gap={6} style={{ fontSize: 13, marginTop: 4 }}>
          <span style={{ color: INK_DIM }}>No account?</span>
          <button onClick={() => set({ flow: 'signup' })} style={{
            background: 'none', border: 'none', color: INK, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer', fontSize: 13, padding: 0,
          }}>Create one</button>
        </Row>
      </Col>
    </div>
  );
}

/* ── 02 Signup ──────────────────────────────────────────────── */
function ScreenSignup() {
  const { set } = useApp();
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const valid = /\S+@\S+\.\S+/.test(email) && pw.length >= 6 && pw === pw2;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Row align="center" style={{ padding: '8px 22px' }}>
        <button onClick={() => set({ flow: 'splash' })} style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer', padding: 0, display: 'flex' }}>{I.arrowL}</button>
      </Row>
      <Col gap={16} style={{ flex: 1, justifyContent: 'center', padding: '0 26px' }}>
        <Col gap={12} style={{ alignItems: 'center' }}>
          <MarkDot size={40} />
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: INK, letterSpacing: -0.4 }}>Begin the practice.</div>
        </Col>
        <Field label="Email" value={email} onChange={setEmail} placeholder="you@somewhere.com" type="email" />
        <Field label="Password" value={pw} onChange={setPw} placeholder="At least 6 characters" type="password" />
        <Field label="Confirm" value={pw2} onChange={setPw2} placeholder="Repeat password" type="password"
               warn={pw2.length > 0 && pw !== pw2 ? 'Passwords do not match' : null} />
        <Btn fill disabled={!valid} onClick={() => set({ flow: 'profile' })}>Create account</Btn>
        <div style={{ fontFamily: MONO, fontSize: 9, color: INK_DIM, textAlign: 'center', letterSpacing: 0.8, lineHeight: 1.5, textTransform: 'uppercase' }}>
          By creating an account you agree<br />to the terms &amp; private journal policy.
        </div>
      </Col>
    </div>
  );
}

/* ── Reusable form field ─────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, type = 'text', warn = null }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <Col gap={6}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase' }}>{label}</div>
      <div style={{
        height: 44, borderRadius: 10,
        border: `1px solid ${focus ? INK : (warn ? WARN : FRAME)}`,
        background: SURFACE, padding: '0 14px',
        display: 'flex', alignItems: 'center',
        transition: 'border 160ms ease',
      }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={placeholder}
          style={{ width: '100%', fontSize: 14, color: INK, background: 'transparent' }}
        />
      </div>
      {warn ? <div style={{ fontFamily: MONO, fontSize: 9, color: WARN, letterSpacing: 1.2, textTransform: 'uppercase' }}>{warn}</div> : null}
    </Col>
  );
}

/* ── 03 Profile setup ────────────────────────────────────────── */
function ScreenProfile() {
  const { state, set } = useApp();
  const [name, setName] = React.useState(state.user.name || '');
  const [handle, setHandle] = React.useState(state.user.handle || '');
  const valid = name.trim().length >= 2 && /^@?[\w.]{3,}$/.test(handle);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Profile" sub="Step 1 of 3" />
      <Col gap={18} style={{ flex: 1, padding: '20px 26px' }}>
        <Row justify="center">
          <button style={{
            width: 92, height: 92, borderRadius: '50%',
            border: `1px dashed ${INK_FADE}`, background: 'rgba(255,255,255,0.02)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: INK_DIM, fontFamily: MONO, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            <Col gap={4} style={{ alignItems: 'center' }}>
              <div style={{ fontSize: 16, color: INK }}>{I.plus}</div>
              <span>photo</span>
            </Col>
          </button>
        </Row>
        <Field label="Display name" value={name} onChange={setName} placeholder="Your name" />
        <Field label="Username" value={handle} onChange={(v) => setHandle(v.startsWith('@') ? v : '@' + v.replace(/^@*/, ''))} placeholder="@handle" />
        <div style={{ flex: 1 }} />
        <Btn fill disabled={!valid} onClick={() => {
          set((s) => ({ ...s, user: { ...s.user, name: name.trim(), handle: handle.startsWith('@') ? handle : '@' + handle }, flow: 'interests' }));
        }}>Continue</Btn>
      </Col>
    </div>
  );
}

/* ── 04 Interests ────────────────────────────────────────────── */
function ScreenInterests() {
  const { state, set } = useApp();
  const TAGS = ['mindfulness', 'fitness', 'work', 'family', 'art', 'music', 'reading', 'learning', 'travel', 'cooking', 'nature', 'craft', 'writing', 'parenting', 'spirituality'];
  const [picked, setPicked] = React.useState(state.user.interests || []);
  const toggle = (t) => setPicked((p) => p.includes(t) ? p.filter((x) => x !== t) : (p.length < 3 ? [...p, t] : p));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="What matters?" sub="Step 2 of 3 — pick three" />
      <Col gap={20} style={{ flex: 1, padding: '20px 26px' }}>
        <div style={{ fontFamily: SANS, fontSize: 14, color: INK_DIM, lineHeight: 1.5 }}>
          Used to nudge gently. Never to advertise.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TAGS.map((t) => (
            <Chip key={t} on={picked.includes(t)} onClick={() => toggle(t)} mono={false}>{t}</Chip>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Row justify="center" gap={6} style={{ fontFamily: MONO, fontSize: 10, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase' }}>
          <span>{picked.length} / 3 selected</span>
        </Row>
        <Btn fill disabled={picked.length !== 3} onClick={() => {
          set((s) => ({ ...s, user: { ...s.user, interests: picked }, flow: 'onboard', onboardStep: 0 }));
        }}>Continue</Btn>
      </Col>
    </div>
  );
}

/* ── 05 Onboarding (4 steps) ─────────────────────────────────── */
function ScreenOnboard() {
  const { state, set } = useApp();
  const step = state.onboardStep;
  const total = 4;

  const next = () => {
    if (step < total - 1) set({ onboardStep: step + 1 });
    else set({ flow: 'app', tab: 'today' });
  };
  const skip = () => set({ flow: 'app', tab: 'today' });

  const slides = [
    {
      key: 'philosophy',
      body: (
        <Col gap={20} style={{ alignItems: 'center' }}>
          <MarkDot size={54} />
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 36, color: INK, textAlign: 'center', letterSpacing: -0.7, lineHeight: 1.1 }}>Three&nbsp;Sentences</div>
          <div style={{ fontSize: 15, color: INK_DIM, textAlign: 'center', maxWidth: 260, lineHeight: 1.55 }}>
            A journaling practice on a single truth.<br />You cannot be perfect, but you can be relentless.
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: INK, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 500, marginTop: 4 }}>
            Be&nbsp;better. Do&nbsp;better.
          </div>
        </Col>
      ),
    },
    {
      key: 'three',
      body: (
        <Col gap={18} style={{ alignItems: 'center' }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: INK, textAlign: 'center', letterSpacing: -0.5 }}>
            Three. No more, no less.
          </div>
          <div style={{ fontSize: 14, color: INK_DIM, textAlign: 'center', maxWidth: 260 }}>
            Each day, write exactly three sentences about your day.
          </div>
          <div style={{
            padding: '20px 22px', borderRadius: 14, background: SURFACE,
            border: `1px solid ${FRAME}`,
            fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: INK,
            width: '100%',
          }}>
            The rain stopped just after lunch.
            I walked the long way to the post office.
            <span style={{ color: INK_DIM }}> A small kindness from a stranger.</span>
          </div>
          <CountDots filled={3} />
        </Col>
      ),
    },
    {
      key: 'permanent',
      body: (
        <Col gap={18} style={{ alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, border: `1px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK }}>
            {I.lock}
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: INK, textAlign: 'center', letterSpacing: -0.5 }}>
            Presence over perfection.
          </div>
          <div style={{ fontSize: 14, color: INK_DIM, textAlign: 'center', maxWidth: 260, lineHeight: 1.55 }}>
            Once submitted, your entry cannot be edited.<br />Your words stand.
          </div>
        </Col>
      ),
    },
    {
      key: 'days',
      body: (
        <Col gap={18} style={{ alignItems: 'center' }}>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 56, color: INK, textAlign: 'center', letterSpacing: -1.5, lineHeight: 1 }}>363 / 365</div>
          <div style={{ fontSize: 14, color: INK_DIM, textAlign: 'center', maxWidth: 260, lineHeight: 1.55 }}>
            Miss a day, return without shame.<br />Empty days are not failures.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, width: 220, marginTop: 6 }}>
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} style={{
                aspectRatio: '1 / 1', borderRadius: 4,
                background: [3, 9, 17, 22].includes(i) ? 'transparent' : INK,
                border: [3, 9, 17, 22].includes(i) ? `1px dashed ${INK_FADE}` : 'none',
                opacity: [3, 9, 17, 22].includes(i) ? 0.5 : 0.92,
              }} />
            ))}
          </div>
        </Col>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Row justify="space-between" align="center" style={{
        padding: '14px 22px',
        fontFamily: MONO, fontSize: 11, color: INK_DIM, letterSpacing: 1.4, textTransform: 'uppercase',
      }}>
        <span>{String(step + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        {step < total - 1 ? (
          <button onClick={skip} style={{ background: 'none', border: 'none', color: INK_DIM, fontFamily: MONO, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', cursor: 'pointer' }}>Skip</button>
        ) : <span />}
      </Row>
      <ScreenFade k={`onb-${step}`}>
        <div style={{ flex: 1, padding: '20px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {slides[step].body}
        </div>
      </ScreenFade>
      <Col gap={14} style={{ padding: '0 26px 30px' }}>
        <Row gap={6} justify="center">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} style={{
              width: i === step ? 22 : 6, height: 6, borderRadius: 999,
              background: i === step ? INK_BRIGHT : INK_FADE,
              transition: 'width 240ms ease, background 240ms ease',
            }} />
          ))}
        </Row>
        <Btn fill onClick={next}>{step === total - 1 ? 'Begin practice' : 'Continue'}</Btn>
      </Col>
    </div>
  );
}

Object.assign(window, {
  ScreenSplash, ScreenLogin, ScreenSignup, ScreenProfile, ScreenInterests, ScreenOnboard,
});

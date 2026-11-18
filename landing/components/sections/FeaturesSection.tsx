"use client";

import { useState, useEffect } from "react";
import {
  LP_INK,
  LP_INK_BRIGHT,
  LP_INK_DIM,
  LP_INK_FADE,
  LP_PAPER_2,
  LP_SURFACE,
  LP_FRAME,
  LP_SANS,
  LP_SERIF,
  LP_MONO,
  Reveal,
  Eyebrow,
  H2,
  Lead,
  MiniDots,
  MiniPhone,
} from "@/components/lp";
import { PhoneCheckinPreview, PhonePatternsPreview } from "@/components/sections/featurePreviews";

/* ─── Phone preview: Today ───────────────────────────────────────────────── */

function PhoneTodayPreview() {
  return (
    <div
      style={{
        flex: 1,
        padding: "0 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{ paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <div
          style={{
            fontFamily: LP_MONO,
            fontSize: 10,
            color: LP_INK_DIM,
            letterSpacing: 1.8,
            textTransform: "uppercase",
          }}
        >
          Tue · Jun 18
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: LP_SERIF,
              fontStyle: "italic",
              fontSize: 32,
              color: LP_INK,
              letterSpacing: -0.5,
              lineHeight: 1,
            }}
          >
            Today
          </div>
          <div
            style={{
              padding: "4px 10px",
              border: `1.5px solid ${LP_FRAME}`,
              borderRadius: 999,
              fontFamily: LP_MONO,
              fontSize: 10,
              color: LP_INK,
            }}
          >
            🔥 12
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "10px 12px",
          borderLeft: `2px solid ${LP_INK_FADE}`,
          fontFamily: LP_SERIF,
          fontStyle: "italic",
          fontSize: 12,
          color: LP_INK_DIM,
          lineHeight: 1.4,
        }}
      >
        "What did you notice today?"
      </div>
      <div
        style={{
          flex: 1,
          fontFamily: LP_SERIF,
          fontSize: 15,
          lineHeight: 1.65,
          color: LP_INK,
        }}
      >
        The deal closed before sunrise, and the office stayed quiet long after. I
        caught myself listening to the kettle hum instead of refreshing the inbox.
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: 15,
            background: LP_INK_BRIGHT,
            verticalAlign: "text-bottom",
            marginLeft: 2,
            animation: "lp-cursor 900ms steps(2) infinite",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 12,
          borderTop: `1px solid ${LP_FRAME}`,
        }}
      >
        <MiniDots filled={2} size={7} />
        <div
          style={{
            fontFamily: LP_MONO,
            fontSize: 9,
            color: LP_INK_DIM,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          2 / 3 · one more
        </div>
      </div>
      <div
        style={{
          height: 38,
          borderRadius: 999,
          border: `1.5px solid ${LP_INK_FADE}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: LP_SANS,
          fontSize: 12,
          color: LP_INK_DIM,
          marginTop: 8,
          marginBottom: 14,
        }}
      >
        Submit
      </div>
    </div>
  );
}

/* ─── Phone preview: Social sub-views ────────────────────────────────────── */

function SocialCircleView() {
  const friends = [
    {
      name: "Maya Howell",
      handle: "@maya_h",
      streak: 21,
      color: "#c8b6a6",
      last: "Walked to work in the rain.",
      unread: 2,
    },
    {
      name: "Jules Park",
      handle: "@jules.p",
      streak: 7,
      color: "#a3b6c8",
      last: "I read your June 14 entry…",
      unread: 1,
    },
    {
      name: "Ren Okafor",
      handle: "@ren_o",
      streak: 64,
      color: "#b6c8a6",
      last: "Reread Berger last night.",
      unread: 0,
    },
    {
      name: "Iris Sandoval",
      handle: "@iris.s",
      streak: 4,
      color: "#c8a6b8",
      last: "See you Friday.",
      unread: 0,
    },
    {
      name: "Theo Lin",
      handle: "@theo_l",
      streak: 31,
      color: "#c8c2a6",
      last: "The kettle bit got me.",
      unread: 0,
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        padding: "0 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        height: "100%",
      }}
    >
      <div
        style={{ paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <div
          style={{
            fontFamily: LP_MONO,
            fontSize: 10,
            color: LP_INK_DIM,
            letterSpacing: 1.8,
            textTransform: "uppercase",
          }}
        >
          Friends · 8
        </div>
        <div
          style={{
            fontFamily: LP_SERIF,
            fontStyle: "italic",
            fontSize: 28,
            color: LP_INK,
            letterSpacing: -0.5,
            lineHeight: 1,
          }}
        >
          The Circle
        </div>
      </div>
      <div
        style={{
          height: 32,
          borderRadius: 8,
          border: `1px solid ${LP_FRAME}`,
          background: LP_SURFACE,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "0 10px",
          marginBottom: 2,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4" stroke={LP_INK_DIM} strokeWidth="1.4" />
          <path
            d="M10 10l4 4"
            stroke={LP_INK_DIM}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span style={{ fontSize: 11, color: LP_INK_DIM }}>Find by @handle</span>
      </div>
      {friends.map((f, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            paddingBottom: 8,
            borderBottom:
              i < friends.length - 1 ? `1px solid ${LP_FRAME}` : "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: f.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: LP_SERIF,
              fontStyle: "italic",
              fontSize: 13,
              color: "#0e0e10",
              flexShrink: 0,
            }}
          >
            {f.name[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ display: "flex", alignItems: "baseline", gap: 5 }}
            >
              <div
                style={{ fontSize: 12, fontWeight: 500, color: LP_INK }}
              >
                {f.name}
              </div>
              <div
                style={{
                  fontFamily: LP_MONO,
                  fontSize: 8,
                  color: LP_INK_DIM,
                  letterSpacing: 0.4,
                }}
              >
                {f.handle}
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                color: LP_INK_DIM,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {f.last}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 3,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontFamily: LP_MONO,
                fontSize: 9,
                color: LP_INK_DIM,
              }}
            >
              <span style={{ fontSize: 9 }}>🔥</span>
              {f.streak}
            </div>
            {f.unread > 0 ? (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: LP_INK_BRIGHT,
                }}
              />
            ) : null}
          </div>
        </div>
      ))}
      <div
        style={{
          marginTop: "auto",
          paddingBottom: 14,
          fontFamily: LP_MONO,
          fontSize: 8,
          color: LP_INK_FADE,
          textAlign: "center",
          letterSpacing: 1.2,
          textTransform: "uppercase",
        }}
      >
        Private by default
      </div>
    </div>
  );
}

function SocialDMView() {
  const messages = [
    {
      from: "them",
      text: "I read your June 14 entry. The dentist line stayed with me.",
      t: "8:42 AM",
    },
    { from: "me", text: "He was so gentle I almost cried. Thanks for noticing.", t: "8:44 AM" },
    { from: "them", text: "How did the rest of the day land?", t: "8:45 AM" },
    {
      from: "me",
      text: "Quiet. I walked the long way home and bought peaches.",
      t: "8:46 AM",
    },
    { from: "them", text: "Send a picture of the peaches.", t: "8:47 AM" },
  ];

  return (
    <div
      style={{
        flex: 1,
        padding: "0 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 4px 10px",
          borderBottom: `1px solid ${LP_FRAME}`,
        }}
      >
        <span style={{ color: LP_INK, fontSize: 16 }}>‹</span>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#c8b6a6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: LP_SERIF,
              fontStyle: "italic",
              fontSize: 10,
              color: "#0e0e10",
            }}
          >
            M
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <div style={{ fontSize: 12, fontWeight: 500, color: LP_INK }}>
              @maya_h
            </div>
            <div
              style={{
                fontFamily: LP_MONO,
                fontSize: 7,
                color: LP_INK_DIM,
                letterSpacing: 0.8,
                textTransform: "uppercase",
              }}
            >
              Active now
            </div>
          </div>
        </div>
        <span style={{ color: LP_INK_DIM, fontSize: 14 }}>···</span>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 7,
          overflow: "hidden",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.from === "me" ? "flex-end" : "flex-start",
              gap: 5,
              alignItems: "flex-end",
            }}
          >
            {m.from === "them" ? (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#c8b6a6",
                  flexShrink: 0,
                }}
              />
            ) : null}
            <div
              style={{
                maxWidth: "76%",
                padding: "6px 10px",
                borderRadius:
                  m.from === "me"
                    ? "12px 12px 3px 12px"
                    : "12px 12px 12px 3px",
                background: m.from === "me" ? LP_INK_BRIGHT : LP_SURFACE,
                color: m.from === "me" ? "#0a0a0a" : LP_INK,
                fontSize: 11,
                lineHeight: 1.35,
                border: m.from === "them" ? `1px solid ${LP_FRAME}` : "none",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          padding: "8px 0 16px",
          borderTop: `1px solid ${LP_FRAME}`,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 28,
            borderRadius: 14,
            border: `1px solid ${LP_FRAME}`,
            background: LP_SURFACE,
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            fontSize: 11,
            color: LP_INK_DIM,
          }}
        >
          Message…
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            background: LP_INK_BRIGHT,
            color: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ↑
        </div>
      </div>
    </div>
  );
}

function SocialGroupView() {
  const messages = [
    {
      from: "jules",
      name: "Jules",
      color: "#a3b6c8",
      text: "Rough morning. Wrote anyway.",
      t: "9:02 AM",
    },
    {
      from: "me",
      name: "You",
      color: "#c8b6a6",
      text: "Same. The third one was the hardest today.",
      t: "9:04 AM",
    },
    {
      from: "ren",
      name: "Ren",
      color: "#b6c8a6",
      text: "Mine was a kettle entry. Again.",
      t: "9:08 AM",
    },
    {
      from: "theo",
      name: "Theo",
      color: "#c8c2a6",
      text: "Three kettles in a week. There's a theme.",
      t: "9:10 AM",
    },
    {
      from: "jules",
      name: "Jules",
      color: "#a3b6c8",
      text: "Maybe the kettle is the journal.",
      t: "9:11 AM",
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        padding: "0 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 4px 10px",
          borderBottom: `1px solid ${LP_FRAME}`,
        }}
      >
        <span style={{ color: LP_INK, fontSize: 16 }}>‹</span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <div style={{ display: "flex", marginBottom: 2 }}>
            {["#a3b6c8", "#b6c8a6", "#c8c2a6"].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: c,
                  marginLeft: i ? -6 : 0,
                  border: `1.5px solid ${LP_PAPER_2}`,
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontFamily: LP_SERIF,
              fontStyle: "italic",
              fontSize: 12,
              color: LP_INK,
              lineHeight: 1,
            }}
          >
            Sunday Circle
          </div>
          <div
            style={{
              fontFamily: LP_MONO,
              fontSize: 7,
              color: LP_INK_DIM,
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            4 members
          </div>
        </div>
        <span style={{ color: LP_INK_DIM, fontSize: 14 }}>···</span>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          overflow: "hidden",
        }}
      >
        {messages.map((m, i) => {
          const mine = m.from === "me";
          const showHeader = i === 0 || messages[i - 1].from !== m.from;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: mine ? "flex-end" : "flex-start",
                gap: 5,
                alignItems: "flex-end",
              }}
            >
              {!mine ? (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: m.color,
                    flexShrink: 0,
                    opacity: showHeader ? 1 : 0,
                  }}
                />
              ) : null}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "76%",
                  gap: 2,
                }}
              >
                {!mine && showHeader ? (
                  <div
                    style={{
                      fontFamily: LP_MONO,
                      fontSize: 7,
                      color: LP_INK_DIM,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginLeft: 4,
                    }}
                  >
                    {m.name}
                  </div>
                ) : null}
                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: mine
                      ? "12px 12px 3px 12px"
                      : "12px 12px 12px 3px",
                    background: mine ? LP_INK_BRIGHT : LP_SURFACE,
                    color: mine ? "#0a0a0a" : LP_INK,
                    fontSize: 11,
                    lineHeight: 1.35,
                    border: !mine ? `1px solid ${LP_FRAME}` : "none",
                  }}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          padding: "8px 0 16px",
          borderTop: `1px solid ${LP_FRAME}`,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 28,
            borderRadius: 14,
            border: `1px solid ${LP_FRAME}`,
            background: LP_SURFACE,
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            fontSize: 11,
            color: LP_INK_DIM,
          }}
        >
          Message Sunday Circle…
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            background: LP_INK_BRIGHT,
            color: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ↑
        </div>
      </div>
    </div>
  );
}

/* ─── Phone preview: Social (animated switcher) ──────────────────────────── */

const SOCIAL_VIEWS = ["circle", "dm", "group"] as const;

function PhoneSocialPreview() {
  const [view, setView] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setView((v) => (v + 1) % SOCIAL_VIEWS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      {SOCIAL_VIEWS.map((v, i) => (
        <div
          key={v}
          style={{
            position: "absolute",
            inset: 0,
            opacity: view === i ? 1 : 0,
            transform: view === i ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 600ms ease, transform 600ms ease",
            pointerEvents: view === i ? "auto" : "none",
          }}
        >
          {v === "circle" && <SocialCircleView />}
          {v === "dm" && <SocialDMView />}
          {v === "group" && <SocialGroupView />}
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          bottom: 6,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 5,
        }}
      >
        {SOCIAL_VIEWS.map((_, i) => (
          <span
            key={i}
            style={{
              width: view === i ? 14 : 4,
              height: 4,
              borderRadius: 999,
              background: view === i ? LP_INK_BRIGHT : LP_INK_FADE,
              transition: "all 400ms ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────────────────── */

const FEATURES = [
  {
    tab: "Today",
    headline: "Write in a quiet room.",
    body: "A blinking cursor, today's date, and the rule of three. The counter watches without judging. Submit only becomes available at exactly three.",
    phone: <PhoneTodayPreview />,
  },
  {
    tab: "Check-in",
    headline: "Ten more seconds.",
    body: "After your three sentences: how was today, in one word, and up to three habits you are working on, yes or no. Skip any of it. Only you ever see it.",
    phone: <PhoneCheckinPreview />,
  },
  {
    tab: "Patterns",
    headline: "See the month you had.",
    body: "The calendar fills as you write, and a ring marks the days you kept all your habits. Mood as a quiet line, habits as a grid, over 7, 30 or 90 days. Tap any day to reread it.",
    phone: <PhonePatternsPreview />,
  },
  {
    tab: "The Circle",
    headline: "Small by design.",
    body: "Up to eight close friends. Private messages. No feeds, no likes, no following. Just people you trust with your practice.",
    phone: <PhoneSocialPreview />,
  },
] as const;

export function FeaturesSection() {
  const [active, setActive] = useState(0);

  return (
    <section
      id="features"
      className="lp-section" style={{ background: LP_PAPER_2, padding: "180px 0" }}
    >
      <div
        className="lp-wrap" style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 64px",
        }}
      >
        {/* Heading */}
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <Eyebrow>Inside the app</Eyebrow>
            <div style={{ height: 28 }} />
            <H2>A quiet shape for a loud year.</H2>
          </div>
        </Reveal>

        {/* Tab bar */}
        <Reveal delay={150}>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              marginBottom: 72,
              flexWrap: "wrap",
            }}
          >
            {FEATURES.map((f, i) => (
              <button
                key={f.tab}
                onClick={() => setActive(i)}
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: `1px solid ${active === i ? LP_INK_BRIGHT : LP_FRAME}`,
                  background: active === i ? LP_INK_BRIGHT : "transparent",
                  color: active === i ? "#0a0a0a" : LP_INK_DIM,
                  fontFamily: LP_MONO,
                  fontSize: 11,
                  letterSpacing: 1.8,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "all 200ms ease",
                }}
              >
                {f.tab}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Feature panels */}
        {FEATURES.map((f, i) => (
          <div
            key={f.tab}
            className="lp-grid"
            style={{
              display: i === active ? "grid" : "none",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
              animation: "lp-fade-in 400ms ease",
            }}
          >
            <div>
              <H2 style={{ fontSize: 52 }}>{f.headline}</H2>
              <Lead style={{ marginTop: 28, maxWidth: 500 }}>{f.body}</Lead>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <MiniPhone width={340} height={700}>{f.phone}</MiniPhone>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

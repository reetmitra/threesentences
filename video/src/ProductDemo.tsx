import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

// ─── DESIGN TOKENS (matched to app) ──────────────────────────────
const BG      = "#000000";
const SURFACE = "#121212";
const BORDER  = "#2A2A2A";
const TEXT     = "#FFFFFF";
const TEXT_SEC = "#A0A0A0";
const TEXT_MUTED = "#666666";

// ─── HELPERS ─────────────────────────────────────────────────────
const fi = (frame: number, from: number, dur = 20) =>
  interpolate(frame, [from, from + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const fo = (frame: number, from: number, dur = 20) =>
  interpolate(frame, [from, from + dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ─── SECTION 1 TIMING (frames relative to sequence start) ────────
// 0s   app starts appearing (tagline visible)
// 2s   app UI fades in
// 2.7s sentence 1 typing begins
// 5.3s sentence 1 done
// 5.8s sentence 2 begins
// 8.5s sentence 2 done
// 9.0s sentence 3 begins
// 11.7s sentence 3 done
// 12.2s submit button visible
// 12.7s click
// 13.0s loading
// 13.8s shrink to circle
// 14.5s checkmark
// 14.3s screen fades out
const T_APP_IN   = 60;
const T_S1_START = 80;
const T_S1_END   = 160;
const T_S2_START = 175;
const T_S2_END   = 255;
const T_S3_START = 270;
const T_S3_END   = 350;
const T_BTN_IN   = 360;
const T_BTN_CLK  = 375;
const T_LOADING  = 385;
const T_CIRCLE   = 415;
const T_CHECK    = 435;

const SENTENCES = [
  "I shipped the auth module and held deep focus for three hours.",
  "Felt scattered after lunch — I need to protect my afternoon block.",
  "Tomorrow I tackle the hardest task before opening my inbox.",
];

const getTyped = (frame: number, text: string, start: number): string => {
  const elapsed = frame - start;
  if (elapsed < 0) return "";
  const charsPerFrame = text.length / 80;
  return text.slice(0, Math.min(text.length, Math.floor(elapsed * charsPerFrame)));
};

// ─── TAGLINE ─────────────────────────────────────────────────────
const Tagline: React.FC<{ fadeOutAt: number }> = ({ fadeOutAt }) => {
  const frame = useCurrentFrame();

  const line1 = fi(frame, 0, 18);
  const line2 = fi(frame, 20, 18);
  const sub   = fi(frame, 40, 18);
  const masterOut = fo(frame, fadeOutAt, 25);
  const liftY = interpolate(frame, [fadeOutAt, fadeOutAt + 25], [0, -24], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: masterOut,
        transform: `translateY(${liftY}px)`,
      }}
    >
      <div style={{ fontFamily, textAlign: "center" }}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 300,
            color: TEXT,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            opacity: line1,
            transform: `translateY(${interpolate(line1, [0, 1], [28, 0])}px)`,
          }}
        >
          Three Sentences.
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 300,
            color: TEXT,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            opacity: line2,
            transform: `translateY(${interpolate(line2, [0, 1], [28, 0])}px)`,
            marginTop: 4,
          }}
        >
          Every day.
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 300,
            color: TEXT_SEC,
            letterSpacing: "0.08em",
            marginTop: 32,
            opacity: sub,
          }}
        >
          Be better, do better.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── SENTENCE ROW ─────────────────────────────────────────────────
const SentenceRow: React.FC<{
  index: number;
  typedText: string;
  isActive: boolean;
  isFuture: boolean;
}> = ({ index, typedText, isActive, isFuture }) => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 14) % 2 === 0;

  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${isActive ? "rgba(255,255,255,0.20)" : BORDER}`,
        borderRadius: 12,
        padding: "14px 16px 14px 44px",
        marginBottom: 10,
        position: "relative",
        minHeight: 54,
        display: "flex",
        alignItems: "center",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 12,
          fontWeight: 500,
          color: isActive ? TEXT_SEC : TEXT_MUTED,
          fontFamily: "monospace",
        }}
      >
        {index + 1}
      </span>
      <span
        style={{
          fontSize: 15,
          color: isFuture ? TEXT_MUTED : TEXT,
          lineHeight: 1.65,
          fontWeight: 400,
          letterSpacing: "-0.01em",
        }}
      >
        {isFuture ? "—" : typedText}
        {isActive && (
          <span
            style={{
              display: "inline-block",
              width: 1.5,
              height: "1em",
              background: TEXT,
              marginLeft: 2,
              opacity: blink ? 0.85 : 0,
              verticalAlign: "text-bottom",
            }}
          />
        )}
      </span>
    </div>
  );
};

// ─── DAILY ENTRY SCREEN ───────────────────────────────────────────
const DailyEntryScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const screenIn  = fi(frame, T_APP_IN, 25);
  const screenOut = fo(frame, 428, 22);
  const opacity   = screenIn * screenOut;

  const isActive = (i: number) =>
    frame >= [T_S1_START, T_S2_START, T_S3_START][i] &&
    frame < [T_S1_END, T_S2_END, T_S3_END][i];

  const isFuture = (i: number) =>
    frame < [T_S1_START, T_S2_START, T_S3_START][i];

  const typedTexts = [
    getTyped(frame, SENTENCES[0], T_S1_START),
    getTyped(frame, SENTENCES[1], T_S2_START),
    getTyped(frame, SENTENCES[2], T_S3_START),
  ];

  const counterValue =
    frame >= T_S3_START ? 3 :
    frame >= T_S2_START ? 2 :
    frame >= T_S1_START ? 1 : 0;

  // Counter pop spring at each increment
  const lastStart = counterValue > 0
    ? [T_S1_START, T_S2_START, T_S3_START][counterValue - 1]
    : 0;
  const counterBounce = counterValue > 0
    ? spring({ frame: frame - lastStart, fps, config: { damping: 8, stiffness: 300 } })
    : 1;
  const counterScale = 1 + (1 - counterBounce) * 0.18;

  // Submit button
  const btnOpacity = fi(frame, T_BTN_IN, 18);
  const btnClickScale =
    frame >= T_BTN_CLK && frame < T_LOADING
      ? interpolate(frame, [T_BTN_CLK, T_BTN_CLK + 6, T_BTN_CLK + 14], [1, 0.96, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  const shrinkProgress = spring({
    frame: frame - T_CIRCLE,
    fps,
    config: { damping: 25, stiffness: 120 },
  });
  const btnWidth  = frame >= T_CIRCLE ? interpolate(shrinkProgress, [0, 1], [480, 52]) : 480;
  const btnRadius = frame >= T_CIRCLE ? interpolate(shrinkProgress, [0, 1], [12, 26])  : 12;

  const showDoneText = frame < T_LOADING;
  const showLoading  = frame >= T_LOADING && frame < T_CIRCLE + 15;
  const showCheck    = frame >= T_CHECK;
  const checkOpacity = fi(frame, T_CHECK, 12);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div style={{ width: 480, fontFamily }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              color: TEXT_MUTED,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            FEB 22, 2026
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: TEXT,
              letterSpacing: "-0.02em",
            }}
          >
            Today's entry
          </div>
        </div>

        {/* Sentence rows */}
        {SENTENCES.map((_, i) => (
          <SentenceRow
            key={i}
            index={i}
            typedText={typedTexts[i]}
            isActive={isActive(i)}
            isFuture={isFuture(i)}
          />
        ))}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          {/* Counter */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 3,
              color: counterValue === 3 ? TEXT : TEXT_SEC,
              transform: `scale(${counterScale})`,
              transformOrigin: "left center",
            }}
          >
            {counterValue}/3
          </div>

          {/* Submit button */}
          <div
            style={{
              opacity: btnOpacity,
              transform: `scale(${btnClickScale})`,
            }}
          >
            <div
              style={{
                width: btnWidth,
                height: 52,
                borderRadius: btnRadius,
                background: TEXT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {showDoneText && (
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: BG,
                    letterSpacing: 0.5,
                  }}
                >
                  Done
                </span>
              )}

              {showLoading && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    position: "absolute",
                  }}
                >
                  {[0, 1, 2].map((dot) => {
                    const elapsed = frame - T_LOADING;
                    const bounce = Math.sin(elapsed * 0.25 - dot * 1.2);
                    return (
                      <div
                        key={dot}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          background: BG,
                          transform: `translateY(${bounce * 4}px)`,
                          opacity: elapsed > dot * 4 ? 0.8 : 0,
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {showCheck && (
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  style={{ opacity: checkOpacity, position: "absolute" }}
                >
                  <polyline
                    points="4,13 9,18 20,6"
                    fill="none"
                    stroke={BG}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── REFLECT SCREEN ───────────────────────────────────────────────
const REFLECT_TEXT =
  "Over the past 30 days, you've shown up consistently. " +
  "22 of 30 entries mention intentional mornings — your biggest growth area. " +
  "You're building real momentum. Keep protecting that first hour.";

const TIME_RANGES = ["7 days", "30 days", "90 days"];

const ReflectScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const screenIn  = fi(frame, 0, 28);
  const screenOut = fo(frame, 278, 22);
  const opacity   = screenIn * screenOut;

  // Time range buttons reveal
  const panelIn = fi(frame, 15, 20);
  // "30 days" gets selected at frame 55
  const selectedRange = frame >= 55 ? 1 : -1;

  // Generate button
  const genBtnIn    = fi(frame, 45, 18);
  const genBtnClick = frame >= 88;
  const genBtnScale = genBtnClick
    ? interpolate(frame, [88, 94, 100], [1, 0.96, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const showGenerating = frame >= 95 && frame < 130;

  // Reflection card
  const cardSpring  = spring({ frame: frame - 128, fps, config: { damping: 18, stiffness: 90 } });
  const cardY       = interpolate(cardSpring, [0, 1], [56, 0]);
  const cardOpacity = frame >= 128 ? fi(frame, 128, 22) : 0;

  // Text typewriter in card
  const textChars = frame >= 138
    ? Math.floor(interpolate(frame, [138, 230], [0, REFLECT_TEXT.length], {
        extrapolateRight: "clamp",
      }))
    : 0;
  const showCursor = textChars < REFLECT_TEXT.length && frame >= 138;
  const blink = Math.floor(frame / 12) % 2 === 0;

  const metaOpacity = fi(frame, 232, 15);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div style={{ width: 480, fontFamily }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: TEXT,
              letterSpacing: "-0.02em",
              marginBottom: 5,
            }}
          >
            Reflect
          </div>
          <div style={{ fontSize: 14, color: TEXT_SEC }}>
            AI-powered insights from your entries
          </div>
        </div>

        {/* Generate card */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 14,
            opacity: panelIn,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 500, color: TEXT, marginBottom: 4 }}>
            Generate Reflection
          </div>
          <div style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 16 }}>
            Select a time range to analyze
          </div>

          {/* Time range row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {TIME_RANGES.map((label, i) => {
              const sel = selectedRange === i;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 10,
                    background: sel ? TEXT : "transparent",
                    border: `1.5px solid ${sel ? TEXT : BORDER}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: sel ? 600 : 400,
                    color: sel ? BG : TEXT_SEC,
                    letterSpacing: 0.3,
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {/* Generate button */}
          <div
            style={{
              height: 48,
              borderRadius: 10,
              background: TEXT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 600,
              color: BG,
              letterSpacing: 0.3,
              opacity: genBtnIn,
              transform: `scale(${genBtnScale})`,
            }}
          >
            {showGenerating ? "Generating..." : "Generate Reflection"}
          </div>
        </div>

        {/* Reflection result card */}
        {frame >= 128 && (
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: 20,
              opacity: cardOpacity,
              transform: `translateY(${cardY}px)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 13, color: TEXT_SEC }}>
                Jan 23 – Feb 22, 2026
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: TEXT_SEC,
                  background: "#1E1E1E",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontWeight: 500,
                  letterSpacing: 0.3,
                }}
              >
                30 days
              </span>
            </div>

            <p
              style={{
                fontSize: 15,
                color: TEXT,
                lineHeight: 1.7,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {REFLECT_TEXT.slice(0, textChars)}
              {showCursor && (
                <span
                  style={{
                    display: "inline-block",
                    width: 1.5,
                    height: "1em",
                    background: TEXT,
                    marginLeft: 2,
                    opacity: blink ? 0.85 : 0,
                    verticalAlign: "text-bottom",
                  }}
                />
              )}
            </p>

            <div
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: `1px solid ${BORDER}`,
                fontSize: 12,
                color: TEXT_MUTED,
                opacity: metaOpacity,
              }}
            >
              Based on 28 entries · Generated by AI
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ─── SOCIAL SCREEN ────────────────────────────────────────────────
const FRIENDS = [
  { name: "Alex K.",   username: "@alexk",   streak: 47 },
  { name: "Jordan M.", username: "@jordanm", streak: 31 },
  { name: "Sam T.",    username: "@samt",    streak: 23 },
];

const SocialScreen: React.FC = () => {
  const frame = useCurrentFrame();

  const screenIn  = fi(frame, 0, 25);
  const screenOut = fo(frame, 68, 22);
  const opacity   = screenIn * screenOut;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div style={{ width: 480, fontFamily }}>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: TEXT,
              letterSpacing: "-0.02em",
              marginBottom: 5,
            }}
          >
            Your Circle
          </div>
          <div style={{ fontSize: 14, color: TEXT_SEC }}>
            Private accountability, built in.
          </div>
        </div>

        {FRIENDS.map((friend, i) => {
          const delay   = i * 12;
          const itemIn  = fi(frame, 14 + delay, 20);
          const slideY  = interpolate(frame, [14 + delay, 34 + delay], [22, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: 16,
                marginBottom: 10,
                opacity: itemIn,
                transform: `translateY(${slideY}px)`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: "#333333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  color: TEXT,
                  marginRight: 14,
                  flexShrink: 0,
                  fontFamily,
                }}
              >
                {friend.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 2 }}>
                  {friend.name}
                </div>
                <div style={{ fontSize: 13, color: TEXT_SEC }}>{friend.username}</div>
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: TEXT,
                  fontFamily: "monospace",
                  letterSpacing: 0.5,
                }}
              >
                {friend.streak}d 🔥
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── LOGO REVEAL ─────────────────────────────────────────────────
const THREE_PATH = [
  "M 165 130",
  "L 340 130",
  "C 375 130, 395 155, 395 185",
  "C 395 230, 375 265, 340 280",
  "C 315 290, 285 295, 270 298",
  "C 310 305, 365 330, 390 370",
  "C 415 410, 420 450, 415 480",
  "C 410 530, 380 565, 340 580",
  "C 300 595, 255 595, 220 585",
  "C 190 575, 165 555, 150 530",
].join(" ");

const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring  = spring({ frame, fps, config: { damping: 22, stiffness: 80 } });
  const logoScale   = interpolate(logoSpring, [0, 1], [0.65, 1]);
  const logoOpacity = fi(frame, 0, 18);

  const wordmarkOpacity = fi(frame, 18, 20);
  const ctaOpacity      = fi(frame, 35, 20);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          marginBottom: 20,
        }}
      >
        <svg viewBox="100 80 370 560" width={56} height={84} style={{ overflow: "visible" }}>
          <path
            d={THREE_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        style={{
          fontFamily,
          fontSize: 36,
          fontWeight: 300,
          color: TEXT,
          letterSpacing: "0.06em",
          opacity: wordmarkOpacity,
          marginBottom: 14,
        }}
      >
        three sentences.
      </div>

      <div
        style={{
          fontFamily,
          fontSize: 15,
          fontWeight: 400,
          color: TEXT_SEC,
          letterSpacing: "0.10em",
          opacity: ctaOpacity,
        }}
      >
        journal better. reflect deeper.
      </div>
    </AbsoluteFill>
  );
};

// ─── MAIN COMPOSITION ─────────────────────────────────────────────
// 30s × 30fps = 900 frames
// Section 1: Hook          → frames   0 – 449  (15s)
// Section 2: AI Reflections → frames 450 – 749  (10s)
// Section 3: Social         → frames 750 – 839  ( 3s)
// Section 4: Logo Reveal    → frames 840 – 899  ( 2s)
export const ProductDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>

      {/* ── SECTION 1 TAGLINE (disappears at frame ~95) ── */}
      <Sequence from={0} durationInFrames={115} layout="none">
        <Tagline fadeOutAt={70} />
      </Sequence>

      {/* ── SECTION 1 APP UI ── */}
      <Sequence from={0} durationInFrames={450} layout="none">
        <DailyEntryScreen />
      </Sequence>

      {/* ── SECTION 2: AI REFLECTIONS ── */}
      <Sequence from={450} durationInFrames={300} layout="none">
        <ReflectScreen />
      </Sequence>

      {/* ── SECTION 3: SOCIAL ── */}
      <Sequence from={750} durationInFrames={90} layout="none">
        <SocialScreen />
      </Sequence>

      {/* ── SECTION 4: LOGO REVEAL ── */}
      <Sequence from={840} durationInFrames={60} layout="none">
        <LogoReveal />
      </Sequence>

    </AbsoluteFill>
  );
};

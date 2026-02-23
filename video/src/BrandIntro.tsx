import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "700"],
  subsets: ["latin"],
});

// ─── SVG path matching Three.png ──────────────────────────────────
// Thin geometric "3": flat top bar, tight upper bowl, larger round
// lower bowl, open at bottom-left. Matches the brand mark exactly.
const THREE_PATH = [
  "M 165 130",           // top-left of the crossbar
  "L 340 130",           // flat top bar extends right
  "C 375 130, 395 155, 395 185", // top-right corner curves down
  "C 395 230, 375 265, 340 280", // upper bowl right side
  "C 315 290, 285 295, 270 298", // upper bowl curves to waist
  "C 310 305, 365 330, 390 370", // waist flares out to lower bowl
  "C 415 410, 420 450, 415 480", // lower bowl right side (larger)
  "C 410 530, 380 565, 340 580", // lower bowl curves down
  "C 300 595, 255 595, 220 585", // bottom arc
  "C 190 575, 165 555, 150 530", // open bottom-left end
].join(" ");

const PATH_LENGTH = 1550;

// ─── Outline trace animation ─────────────────────────────────────
const OutlineThree: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const TRACE_DURATION = Math.round(0.7 * fps);
  const TRACE_COUNT = 3;
  const TOTAL_TRACE = TRACE_DURATION * TRACE_COUNT;

  const clampedFrame = Math.min(frame, TOTAL_TRACE);
  const currentPass = Math.floor(clampedFrame / TRACE_DURATION);
  const loopFrame = clampedFrame % TRACE_DURATION;

  const drawProgress = interpolate(loopFrame, [0, TRACE_DURATION], [0, 1], {
    extrapolateRight: "clamp",
  });

  const dashOffset = PATH_LENGTH * (1 - drawProgress);

  const passOpacity = interpolate(currentPass, [0, TRACE_COUNT - 1], [0.2, 0.9], {
    extrapolateRight: "clamp",
  });

  const isDone = frame >= TOTAL_TRACE;

  const glow = isDone
    ? interpolate(Math.sin((frame - TOTAL_TRACE) * 0.06), [-1, 1], [0, 8])
    : 0;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        filter: glow > 0 ? `drop-shadow(0 0 ${glow}px rgba(255,255,255,0.25))` : "none",
      }}
    >
      <svg viewBox="100 80 370 560" width={200} height={300} style={{ overflow: "visible" }}>
        {/* Ghost traces from completed passes */}
        {!isDone &&
          Array.from({ length: currentPass }).map((_, i) => (
            <path
              key={i}
              d={THREE_PATH}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

        {/* Active tracing stroke */}
        {!isDone && (
          <path
            d={THREE_PATH}
            fill="none"
            stroke={`rgba(255,255,255,${passOpacity})`}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={PATH_LENGTH}
            strokeDashoffset={dashOffset}
          />
        )}

        {/* Final solid outline */}
        {isDone && (
          <path
            d={THREE_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
};

// ─── Typewriter: "three..." with dots timed 1s apart ──────────────
const TypewriterThree: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "three" fades in
  const textSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.5 * fps),
  });
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Dots appear 1s apart, starting 0.5s after "three" appears
  const dot1Frame = Math.round(0.5 * fps);
  const dot2Frame = Math.round(1.5 * fps);
  const dot3Frame = Math.round(2.5 * fps);

  const showDot1 = frame >= dot1Frame;
  const showDot2 = frame >= dot2Frame;
  const showDot3 = frame >= dot3Frame;

  // Blinking cursor
  const cursorBlink = Math.floor(frame / Math.round(0.45 * fps)) % 2 === 0;
  const hideCursor = frame >= dot3Frame + fps;

  return (
    <div
      style={{
        fontFamily,
        fontSize: 80,
        fontWeight: 300,
        letterSpacing: "0.05em",
        color: "white",
        textAlign: "center",
        opacity: textOpacity,
      }}
    >
      <span>three</span>
      <span style={{ opacity: showDot1 ? 1 : 0 }}>.</span>
      <span style={{ opacity: showDot2 ? 1 : 0 }}>.</span>
      <span style={{ opacity: showDot3 ? 1 : 0 }}>.</span>
      {!hideCursor && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "0.85em",
            backgroundColor: "white",
            marginLeft: 4,
            opacity: cursorBlink ? 0.5 : 0,
            verticalAlign: "baseline",
            position: "relative",
            top: "0.08em",
          }}
        />
      )}
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────
export const BrandIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ── TIMELINE (8s total) ──
  // 0.0s – 2.1s : "3" outlines 3x (0.7s each)
  // 2.1s – 2.8s : "3" holds with glow
  // 2.8s         : "3" fades out → "three" fades in
  // 3.3s         : first "."  + click
  // 4.3s         : second "." + click
  // 5.3s         : third "."  + click
  // 6.3s – 8.0s : hold → fade to black

  const TEXT_START = Math.round(2.8 * fps);
  const DOT1 = TEXT_START + Math.round(0.5 * fps);
  const DOT2 = DOT1 + fps;
  const DOT3 = DOT2 + fps;

  // Fade to black over last 1.5s
  const fadeOut = interpolate(
    frame,
    [durationInFrames - Math.round(1.5 * fps), durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // "3" outline crossfade out
  const outlineFade = interpolate(
    frame,
    [TEXT_START - Math.round(0.2 * fps), TEXT_START + Math.round(0.2 * fps)],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <AbsoluteFill style={{ opacity: fadeOut }}>
        {/* ── "3" outline tracing ── */}
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: outlineFade,
          }}
        >
          <OutlineThree />
        </AbsoluteFill>

        {/* ── "three..." typewriter ── */}
        <Sequence
          from={TEXT_START}
          durationInFrames={durationInFrames - TEXT_START}
          layout="none"
          premountFor={Math.round(0.5 * fps)}
        >
          <AbsoluteFill
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TypewriterThree />
          </AbsoluteFill>
        </Sequence>

        {/* ── Subtle click for each dot (3 variants for realism) ── */}
        <Sequence from={DOT1} layout="none">
          <Audio src={staticFile("click-1.wav")} volume={0.6} />
        </Sequence>
        <Sequence from={DOT2} layout="none">
          <Audio src={staticFile("click-2.wav")} volume={0.6} />
        </Sequence>
        <Sequence from={DOT3} layout="none">
          <Audio src={staticFile("click-3.wav")} volume={0.6} />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Frame-driven character reveal with blinking caret.
 * All animation driven by useCurrentFrame() — zero setTimeout/useEffect.
 *
 * Best practice (per remotion rules): use string slicing, not per-character opacity.
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const BLINK_FRAMES = 16;

/** Blinking pipe caret. */
const Caret: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame % BLINK_FRAMES,
    [0, BLINK_FRAMES / 2, BLINK_FRAMES],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <span style={{ opacity, marginLeft: 1, fontStyle: "normal" }}>|</span>
  );
};

export interface TypingLine {
  text: string;
  /** override style for this specific line once it's fully typed */
  doneStyle?: React.CSSProperties;
}

interface TypingTextProps {
  /** Lines to type in order */
  lines: TypingLine[];
  /** Local frame when typing begins */
  startFrame: number;
  /** Characters revealed per frame */
  charsPerFrame: number;
  /** Wrapper style */
  style?: React.CSSProperties;
  /** Style applied to all lines */
  lineStyle?: React.CSSProperties;
  /** Style applied only to the line currently being typed */
  activeLineStyle?: React.CSSProperties;
}

export const TypingText: React.FC<TypingTextProps> = ({
  lines,
  startFrame,
  charsPerFrame,
  style,
  lineStyle,
  activeLineStyle,
}) => {
  const frame = useCurrentFrame();

  const totalChars = lines.reduce((s, l) => s + l.text.length, 0);
  const elapsed = Math.max(0, frame - startFrame);
  const charsTyped = Math.min(
    Math.floor(elapsed * charsPerFrame),
    totalChars
  );

  // Distribute charsTyped across lines
  let remaining = charsTyped;
  const lineChars: number[] = lines.map((l) => {
    const take = Math.min(remaining, l.text.length);
    remaining -= take;
    return take;
  });

  // Which line is currently active (being typed)
  let activeIdx = lines.length - 1;
  for (let i = 0; i < lines.length; i++) {
    if (lineChars[i] < lines[i].text.length) {
      activeIdx = i;
      break;
    }
  }

  const isDone = charsTyped >= totalChars;

  return (
    <div style={style}>
      {lines.map((line, i) => {
        if (lineChars[i] === 0 && i !== 0) return null; // not started yet
        const text = line.text.slice(0, lineChars[i]);
        const isActive = i === activeIdx && !isDone;
        const isLineDone = lineChars[i] >= line.text.length;

        return (
          <div
            key={i}
            style={{
              ...lineStyle,
              ...(isLineDone ? line.doneStyle : undefined),
              ...(isActive ? activeLineStyle : undefined),
            }}
          >
            {text}
            {isActive && <Caret />}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Helper: returns composition-local frame at which each line finishes.
 */
export const getSentenceEndFrames = (
  lines: TypingLine[],
  startFrame: number,
  charsPerFrame: number
): number[] => {
  let cumChars = 0;
  return lines.map((l) => {
    cumChars += l.text.length;
    return startFrame + Math.ceil(cumChars / charsPerFrame);
  });
};

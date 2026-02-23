import React from "react";
import { useCurrentFrame } from "remotion";
import { randomChar } from "./helpers";

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface TextScrambleProps {
  text: string;
  startFrame: number;
  /** How many frames the full scramble takes to resolve */
  duration?: number;
  charset?: string;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Deterministic text scramble effect for Remotion.
 * Characters cycle through random letters before resolving left-to-right.
 */
export const TextScramble: React.FC<TextScrambleProps> = ({
  text,
  startFrame,
  duration = 30,
  charset = DEFAULT_CHARSET,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  if (elapsed < 0) return null;

  const chars = text.split("").map((char, i) => {
    if (char === " ") return " ";

    // Each character resolves at a staggered time
    const resolveAt = (i / text.length) * duration;

    if (elapsed >= resolveAt) {
      return char;
    }

    // Show a random character from the charset, seeded deterministically
    return randomChar(frame * 100 + i * 31, charset);
  });

  return (
    <span style={style} className={className}>
      {chars.join("")}
    </span>
  );
};

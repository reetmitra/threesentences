"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

interface TypewriterProps {
  text: string;
  speed?: number;
  initialDelay?: number;
  waitTime?: number;
  deleteSpeed?: number;
  loop?: boolean;
  showCursor?: boolean;
  hideCursorOnType?: boolean;
  cursorChar?: string;
  cursorClassName?: string;
  className?: string;
  cursorAnimationVariants?: Variants;
}

const defaultCursorVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.01,
      repeat: Infinity,
      repeatType: "reverse",
      repeatDelay: 0.4,
    },
  },
};

export function Typewriter({
  text,
  speed = 50,
  initialDelay = 0,
  waitTime = 1500,
  deleteSpeed = 30,
  loop = false,
  showCursor = true,
  hideCursorOnType = false,
  cursorChar = "|",
  cursorClassName = "ml-1",
  className,
  cursorAnimationVariants = defaultCursorVariants,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [phase, setPhase] = useState<"waiting" | "typing" | "waiting-delete" | "deleting" | "done">(
    "waiting"
  );

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let rafId: number;

    const scheduleTimeout = (fn: () => void, ms: number) => {
      timeoutId = setTimeout(fn, ms);
    };

    const startTyping = () => {
      setIsTyping(true);
      setPhase("typing");
      let index = 0;

      const typeNext = () => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
          timeoutId = setTimeout(typeNext, speed);
        } else {
          // Finished typing
          setIsTyping(false);
          if (loop) {
            setPhase("waiting-delete");
            scheduleTimeout(() => {
              setPhase("deleting");
              startDeleting(text.length);
            }, waitTime);
          } else {
            setPhase("done");
          }
        }
      };

      timeoutId = setTimeout(typeNext, speed);
    };

    const startDeleting = (fromLength: number) => {
      setIsTyping(true);
      let remaining = fromLength;

      const deleteNext = () => {
        if (remaining > 0) {
          remaining--;
          setDisplayText(text.slice(0, remaining));
          timeoutId = setTimeout(deleteNext, deleteSpeed);
        } else {
          setIsTyping(false);
          if (loop) {
            setPhase("typing");
            startTyping();
          } else {
            setPhase("done");
          }
        }
      };

      timeoutId = setTimeout(deleteNext, deleteSpeed);
    };

    // Kick off with initialDelay
    scheduleTimeout(startTyping, initialDelay);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
    // Only run once on mount — text/speed etc. are treated as stable props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cursorHidden = hideCursorOnType && isTyping;

  return (
    <span className={`inline whitespace-pre-wrap tracking-tight${className ? ` ${className}` : ""}`}>
      {displayText}
      {showCursor && (
        <motion.span
          className={cursorHidden ? `${cursorClassName} invisible` : cursorClassName}
          variants={cursorAnimationVariants}
          initial="initial"
          animate="animate"
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  );
}

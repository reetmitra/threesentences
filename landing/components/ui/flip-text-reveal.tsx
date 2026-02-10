'use client';

import { cn } from "@/lib/utils";
import { useState } from 'react';

interface FlipTextProps {
  word?: string;
  className?: string;
  showReplay?: boolean;
  titleClassName?: string;
}

export default function FlipTextReveal({
  word = "DIGITAL REALITY",
  className = "",
  showReplay = true,
  titleClassName = "",
}: FlipTextProps) {
  const [key, setKey] = useState(0);

  const replay = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className={cn("flip-container", className)}>

      <div key={key} className="text-wrapper">
        <h1 className={cn("title", titleClassName)} aria-label={word}>
          {word.split("").map((char, i) => (
            <span
              key={`${key}-${i}`}
              className="char"
              style={{ "--index": i } as React.CSSProperties}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
      </div>

      {showReplay && (
        <button className="replay-button" onClick={replay}>
          <span className="btn-text">Replay Action</span>
        </button>
      )}

      <style jsx>{`
        /* --- INVERTED THEME VARIABLES --- */
        .flip-container {
          --bg-color: transparent;
          --text-color: #ffffff;

          --btn-bg: #27272a;
          --btn-text: #ffffff;
          --btn-border: #3f3f46;
          --btn-hover: #52525b;
        }

        /* --- Layout --- */
        .flip-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          overflow: hidden;

          /* 3D Stage */
          perspective: 800px;
        }

        /* --- Typography --- */
        .title {
          font-size: 7rem;
          font-weight: 700;
          font-style: italic;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          line-height: 1;
          letter-spacing: -0.04em;
          transform-style: preserve-3d;
          padding-right: 0.08em; /* compensate italic skew for visual centering */
        }

        /* --- 3D Character Animation --- */
        .char {
          display: inline-block;
          color: var(--text-color);
          transform-origin: bottom center;

          opacity: 0;
          transform: rotateX(-90deg) translateY(20px);

          animation: flip-up 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          animation-delay: calc(0.06s * var(--index));
          will-change: transform, opacity;
        }

        /* --- Button --- */
        .replay-button {
          margin-top: 3.5rem;
          padding: 0.8rem 2rem;
          background-color: var(--btn-bg);
          color: var(--btn-text);
          border: 1px solid var(--btn-border);
          border-radius: 99px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .replay-button:hover {
          background-color: var(--btn-hover);
          transform: scale(1.05);
        }

        .replay-button:active {
          transform: scale(0.95);
        }

        /* --- Keyframes --- */
        @keyframes flip-up {
          0% {
            opacity: 0;
            transform: rotateX(-90deg) translateY(40px);
          }
          100% {
            opacity: 1;
            transform: rotateX(0deg) translateY(0);
          }
        }

        /* Responsive Text Sizing */
        @media (max-width: 640px) {
          .title { font-size: 4.5rem; }
        }
        @media (min-width: 641px) and (max-width: 768px) {
          .title { font-size: 6rem; }
        }
        @media (min-width: 769px) {
          .title { font-size: 8rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .char {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

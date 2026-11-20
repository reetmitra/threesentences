"use client";

import { useEffect, useRef, useState } from "react";
import { NIGHTS, SCENE_EVENTS, type HoverDetail } from "./night";

function hasWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    return !!(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    return false;
  }
}

/** The fixed canvas behind the whole page, plus the tooltip for the slip under the cursor. */
export function SceneStage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [tip, setTip] = useState<HoverDetail | null>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el || !hasWebGL()) return; // the page is complete without it
    let dispose: (() => void) | undefined;
    let cancelled = false;

    const start = () => {
      import("./yearScene")
        .then(({ createYearScene }) => {
          if (cancelled) return;
          dispose = createYearScene(el).dispose;
          el.dataset.ready = "true";
        })
        .catch(() => undefined);
    };

    // Let the headline paint first; the scene loads in the idle time after it.
    const hasIdle = "requestIdleCallback" in window;
    const handle = hasIdle ? window.requestIdleCallback(start, { timeout: 900 }) : window.setTimeout(start, 250);

    const onHover = (e: Event) => setTip((e as CustomEvent<HoverDetail | null>).detail);
    window.addEventListener(SCENE_EVENTS.hover, onHover);

    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      window.removeEventListener(SCENE_EVENTS.hover, onHover);
      dispose?.();
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} className="scene" aria-hidden="true" />
      {tip && (
        <div className="night-tip" style={{ left: tip.x + 16, top: tip.y + 18 }} aria-hidden="true">
          Night {tip.night} of {NIGHTS}
          <span>{tip.grace ? "a day of grace" : tip.kept ? "kept" : "not yet"}</span>
        </div>
      )}
    </>
  );
}


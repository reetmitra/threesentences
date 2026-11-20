"use client";

import { useEffect, useMemo, useState } from "react";
import { NIGHTS, SCENE_EVENTS, tonightIndex } from "@/components/scene/night";

const SENTENCE = /[^.!?…]+[.!?…]+["'”’)\]]*/g;

/** Terminated sentences only: the third full stop is what counts, as in the app. */
function countSentences(text: string): number {
  return (text.match(SENTENCE) ?? []).filter((s) => /\w/.test(s)).length;
}

const STATUS = ["Start with one", "Two more", "One more", "Ready", "One too many"];

/** The live thing: write three sentences and tonight's slip lights on the drum behind the page. */
export function WriteSlip() {
  const [text, setText] = useState("");
  const [kept, setKept] = useState(false);
  const [night, setNight] = useState<number | null>(null);
  const [today, setToday] = useState("");

  // Dates are read after mount so the server and browser markup agree.
  useEffect(() => {
    setNight(tonightIndex() + 1);
    setToday(new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
  }, []);

  const n = useMemo(() => countSentences(text), [text]);
  const ready = n === 3;
  const over = n > 3;

  const submit = () => {
    if (!ready) return;
    setKept(true);
    window.dispatchEvent(new CustomEvent(SCENE_EVENTS.keep));
  };

  return (
    <div className="slip write">
      <div className="slip-head">
        <span>{today || "Tonight"}</span>
        <span>{night ? `Night ${night} of ${NIGHTS}` : ""}</span>
      </div>
      <p className="prompt">What did you notice today that you usually don&apos;t?</p>

      {kept ? (
        <div className="write-locked" role="status">
          <p className="sentences">{text.trim()}</p>
          <p>
            <strong>Locked.</strong> Night {night} is kept. Tomorrow returns.
          </p>
          <div>
            <button
              type="button"
              className="btn btn-ink"
              onClick={() => {
                setKept(false);
                setText("");
              }}
            >
              Write another to try it again
            </button>
          </div>
        </div>
      ) : (
        <>
          <label htmlFor="three-sentences" className="sr-only">
            Your three sentences
          </label>
          <textarea
            id="three-sentences"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="The rain stopped just after lunch. I walked the long way to the post office. A small kindness from a stranger."
            rows={5}
            aria-describedby="three-counter"
          />
          <div className="write-foot">
            <div className="counter" id="three-counter" aria-live="polite">
              <span className="counter-dots" data-over={over} aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <i key={i} data-on={n > i} />
                ))}
              </span>
              <span>
                {Math.min(n, 99)} / 3 · {STATUS[Math.min(n, 4)]}
              </span>
            </div>
            <button type="button" className="btn btn-ink" disabled={!ready} onClick={submit}>
              Submit
            </button>
          </div>
          <p className="write-note">Submit unlocks at exactly three. Nothing you type here leaves this page.</p>
        </>
      )}
    </div>
  );
}

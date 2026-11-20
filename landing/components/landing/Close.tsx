"use client";

import { useWaitlist } from "./Waitlist";

/** One word is the button: the whole band opens the waitlist. */
export function Close() {
  const open = useWaitlist();
  return (
    <div data-stop="close" id="start">
      <a
        className="close"
        href="#start"
        role="button"
        onClick={(e) => {
          e.preventDefault();
          open();
        }}
      >
        <div className="close-top">
          <div>
            <h2>Start with today.</h2>
            <p className="close-line">
              Three Sentences is invite-only. We&apos;re opening early access in small waves to people who are serious about
              the practice.
            </p>
          </div>
          <svg className="close-arrow" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" aria-hidden="true">
            <path d="M12 36 36 12M16 12h20v20" />
          </svg>
        </div>
        <span className="close-word" aria-hidden="true">
          Request
        </span>
        <span className="sr-only">Request access</span>
      </a>
    </div>
  );
}

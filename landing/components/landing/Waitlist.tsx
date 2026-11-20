"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

const WaitlistContext = createContext<() => void>(() => undefined);

export const useWaitlist = () => useContext(WaitlistContext);

/** Holds the dialog; any RequestButton below it opens it. */
export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openIt = useCallback(() => setOpen(true), []);
  return (
    <WaitlistContext.Provider value={openIt}>
      {children}
      <WaitlistDialog open={open} onClose={() => setOpen(false)} />
    </WaitlistContext.Provider>
  );
}

export function RequestButton({ className = "btn", children = "Request access" }: { className?: string; children?: ReactNode }) {
  const open = useWaitlist();
  return (
    <button type="button" className={className} onClick={open}>
      {children}
    </button>
  );
}

function WaitlistDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const valid = /\S+@\S+\.\S+/.test(email);

  // Focus in, trap Tab, close on Escape, give the focus back.
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const scrollBar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBar}px`;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel.current) return;
      const items = panel.current.querySelectorAll<HTMLElement>("button, input, a[href]");
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      before?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setDone(false);
      setEmail("");
      setError(null);
      setBusy(false);
    }, 300);
    return () => clearTimeout(t);
  }, [open]);

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    const { error: failure } = await supabase.from("waitlist").insert([{ email: email.trim().toLowerCase() }]);
    setBusy(false);
    if (failure) {
      setError(failure.code === "23505" ? "This email is already on the waitlist." : "Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  };

  if (!open) return null;

  return (
    <div className="modal-back" onClick={onClose}>
      <div
        ref={panel}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="x" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="dots3" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        {done ? (
          <>
            <h2 id="waitlist-title">You&apos;re on the list.</h2>
            <p>We&apos;ll send you in when there&apos;s room. No rush, no spam: just a quiet note when your wave opens.</p>
            <p>
              <strong>Be better. Do better.</strong>
            </p>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            style={{ display: "grid", gap: 18 }}
          >
            <h2 id="waitlist-title">Request early access.</h2>
            <p>Invite only. We open in small waves. Enter your email and we&apos;ll find you when there&apos;s room.</p>
            <label htmlFor="waitlist-email" className="sr-only">
              Email address
            </label>
            <input
              id="waitlist-email"
              ref={input}
              className="field"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={error ? "waitlist-error" : undefined}
              aria-invalid={error ? true : undefined}
            />
            {error && (
              <p id="waitlist-error" className="error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-ink" disabled={!valid || busy}>
              {busy ? "Joining…" : "Join the waitlist"}
            </button>
            <p className="small" style={{ color: "var(--paper-soft)" }}>
              No spam. No marketing. A single note when your spot opens. For adults 18 and over.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

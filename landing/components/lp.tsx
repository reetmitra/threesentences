"use client";

import React, { useEffect, useRef, useState } from "react";

/* ── Color tokens ─────────────────────────────────────────────── */
export const LP_INK        = '#ebe7dc';
export const LP_INK_BRIGHT = '#ffffff';
export const LP_INK_DIM    = '#8a877e';
export const LP_INK_FADE   = '#3a3a3e';
export const LP_PAPER      = '#060608';
export const LP_PAPER_2    = '#0e0e10';
export const LP_SURFACE    = '#15151a';
export const LP_FRAME      = '#1e1e22';
export const LP_WARM       = '#e8d4b3';

/* ── Font stacks ──────────────────────────────────────────────── */
export const LP_SANS  = "var(--font-sans), 'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif";
export const LP_SERIF = "var(--font-serif), 'Newsreader', 'Iowan Old Style', 'Times New Roman', serif";
export const LP_MONO  = "var(--font-mono), 'IBM Plex Mono', ui-monospace, monospace";

/* ── Hook: in-view (fires once) ──────────────────────────────── */
export function useInView(options: IntersectionObserverInit = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.15, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}

/* ── Hook: scroll Y ──────────────────────────────────────────── */
export function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return y;
}

/* ── Reveal — scroll into view: fade + translate ─────────────── */
interface RevealProps {
  children: React.ReactNode;
  /** delay in ms */
  delay?: number;
  y?: number;
  style?: React.CSSProperties;
}
export function Reveal({ children, delay = 0, y = 24, style = {} }: RevealProps) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 900ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 900ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
}

/* ── Eyebrow ─────────────────────────────────────────────────── */
interface EyebrowProps {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}
export function Eyebrow({ children, color = LP_INK_DIM, style = {} }: EyebrowProps) {
  return (
    <div style={{
      fontFamily: LP_MONO, fontSize: 12, fontWeight: 500,
      letterSpacing: 3, textTransform: 'uppercase', color, ...style,
    }}>{children}</div>
  );
}

/* ── Display headings ────────────────────────────────────────── */
export function H1({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h1 style={{
      fontFamily: LP_SERIF, fontStyle: 'italic', fontSize: 'clamp(64px, 9vw, 140px)',
      fontWeight: 400, letterSpacing: -3, lineHeight: 1.0, color: LP_INK, margin: 0, ...style,
    }}>{children}</h1>
  );
}
export function H2({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      fontFamily: LP_SERIF, fontStyle: 'italic', fontSize: 'clamp(40px, 5vw, 72px)',
      fontWeight: 400, letterSpacing: -1.4, lineHeight: 1.05, color: LP_INK, margin: 0, ...style,
    }}>{children}</h2>
  );
}
export function H3({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h3 style={{
      fontFamily: LP_SERIF, fontStyle: 'italic', fontSize: 'clamp(28px, 3vw, 40px)',
      fontWeight: 400, letterSpacing: -0.6, lineHeight: 1.2, color: LP_INK, margin: 0, ...style,
    }}>{children}</h3>
  );
}

/* ── Body copy ───────────────────────────────────────────────── */
export function Lead({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontFamily: LP_SANS, fontSize: 'clamp(17px, 1.4vw, 20px)',
      fontWeight: 400, lineHeight: 1.55, color: LP_INK_DIM, letterSpacing: -0.1,
      margin: 0, maxWidth: 640, ...style,
    }}>{children}</p>
  );
}
export function P({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontFamily: LP_SANS, fontSize: 15, lineHeight: 1.6,
      color: LP_INK_DIM, letterSpacing: -0.1, margin: 0, ...style,
    }}>{children}</p>
  );
}

/* ── CTA Button ──────────────────────────────────────────────── */
interface CTAProps {
  children: React.ReactNode;
  onClick?: () => void;
  fill?: boolean;
  ghost?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  disabled?: boolean;
}
export function CTA({ children, onClick, fill = false, ghost = false, size = 'md', style = {}, disabled }: CTAProps) {
  const sizes = {
    sm: { h: 40, padding: '0 18px', fontSize: 13 },
    md: { h: 52, padding: '0 26px', fontSize: 15 },
    lg: { h: 62, padding: '0 36px', fontSize: 17 },
  };
  const s = sizes[size];
  let bg = 'transparent', fg = LP_INK, border = LP_INK;
  if (fill)  { bg = LP_INK_BRIGHT; fg = '#0a0a0a'; border = LP_INK_BRIGHT; }
  if (ghost) { bg = 'transparent'; fg = LP_INK; border = LP_FRAME; }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: s.h, padding: s.padding, fontSize: s.fontSize,
        borderRadius: 999, border: `1px solid ${border}`,
        background: bg, color: fg,
        fontFamily: LP_SANS, fontWeight: 500, letterSpacing: 0.2,
        cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', gap: 10,
        transition: 'transform 200ms ease, background 200ms ease, color 200ms ease',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >{children}</button>
  );
}

/* ── Brand mark (white tile + 3 black dots) ──────────────────── */
export function Mark({ size = 28 }: { size?: number }) {
  const r = size / 9;
  const gap = size / 8;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: LP_INK_BRIGHT,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap, flexShrink: 0,
    }}>
      {[0,1,2].map((i) => (
        <span key={i} style={{ width: r * 2, height: r * 2, borderRadius: '50%', background: '#0a0a0a' }} />
      ))}
    </div>
  );
}

/* ── Dot grid backdrop ───────────────────────────────────────── */
export function DotGrid({ opacity = 0.025, size = 28 }: { opacity?: number; size?: number }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `radial-gradient(rgba(235, 231, 220, ${opacity}) 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
      pointerEvents: 'none', zIndex: 0,
    }} />
  );
}

/* ── Hairline divider ────────────────────────────────────────── */
export function Hairline({ width = '60%', style = {} }: { width?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width, height: 1, background: LP_FRAME, margin: '0 auto', ...style,
    }} />
  );
}

/* ── Counter dots ────────────────────────────────────────────── */
export function MiniDots({ filled = 3, total = 3, size = 10 }: { filled?: number; total?: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: size, height: size, borderRadius: '50%',
          background: i < filled ? LP_INK_BRIGHT : 'transparent',
          border: i < filled ? 'none' : `1.5px solid ${LP_INK_FADE}`,
        }} />
      ))}
    </div>
  );
}

/* ── Mini phone chrome ───────────────────────────────────────── */
interface MiniPhoneProps {
  width?: number;
  height?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function MiniPhone({ width = 380, height = 780, children, style = {} }: MiniPhoneProps) {
  return (
    <div style={{
      width, height, background: LP_PAPER_2,
      borderRadius: width * 0.13,
      border: `1.5px solid ${LP_FRAME}`,
      overflow: 'hidden', position: 'relative',
      boxShadow: '0 80px 160px -40px rgba(0,0,0,0.9), 0 30px 60px -30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
      display: 'flex', flexDirection: 'column',
      fontFamily: LP_SANS, ...style,
    }}>
      {/* status bar */}
      <div style={{ height: 44, padding: '14px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: LP_INK }}>9:41</div>
        <div style={{ position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', width: 96, height: 26, borderRadius: 14, background: '#000' }} />
        <div style={{ width: 60 }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {children}
      </div>
      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 110, height: 4, background: LP_INK, opacity: 0.5, borderRadius: 3 }} />
    </div>
  );
}

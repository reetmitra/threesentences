"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "./Reveal";

const CARDS = [
  {
    tone: "panel",
    title: "Your words stand.",
    body: "Once submitted, your words cannot be changed. Not ever. No “just a quick edit.” The impermanence of memory is what makes the permanence of writing matter.",
    img: { src: "/photos/ink.jpg", w: 749, h: 900, alt: "A pewter ink stand with an inkwell, a sand shaker and a white quill pen", caption: "Ink stand with quill, 19th century" },
  },
  {
    tone: "band",
    title: "Yours, and only yours.",
    body: "Your journal belongs to you. Encrypted in transit and at rest. No ads, no data selling, no scraping your entries to train anything. What you write, stays yours.",
    img: { src: "/photos/lamp.jpg", w: 650, h: 900, alt: "An etching of a woman reading alone at a table by the light of a single lamp", caption: "Woman Reading by Lamplight, etching" },
  },
  {
    tone: "paper",
    title: "Choose what happened.",
    body: "Three sentences forces you to choose. What actually happened today? Not the curated version, the real one. That practice, done daily, changes you.",
    img: { src: "/photos/kettle.jpg", w: 700, h: 900, alt: "A watercolour of a dented copper kettle with a looped handle", caption: "Copper kettle, watercolour, c. 1939" },
  },
  {
    tone: "moon",
    title: "A circle, not an audience.",
    body: "An optional small circle of people you actually know. No public profiles. No strangers liking your entries. A safe audience, by invitation only.",
    img: { src: "/photos/letter.jpg", w: 653, h: 900, alt: "A handwritten letter between two friends, in ink on blue-grey paper", caption: "A letter between friends, 1839" },
  },
] as const;

/** Four slips on a spike: each one settles over the last, which recedes. */
export function Principles() {
  const cards = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      cards.current.forEach((card, i) => {
        const next = cards.current[i + 1];
        if (!card || !next) return;
        const gap = next.getBoundingClientRect().top - card.getBoundingClientRect().top;
        const t = Math.min(1, Math.max(0, 1 - (gap - 24) / (vh * 0.62)));
        card.style.transform = `scale(${(1 - t * 0.05).toFixed(4)})`;
        card.style.filter = `brightness(${(1 - t * 0.35).toFixed(3)})`;
      });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  return (
    <section id="principles" data-stop="principles" className="principles">
      <div className="principles-head">
        <Reveal as="h2">Four things we won&apos;t bend.</Reveal>
      </div>
      <div className="stack">
        {CARDS.map((c, i) => (
          <article
            key={c.title}
            className="stack-card"
            data-tone={c.tone}
            style={{ "--i": i } as React.CSSProperties}
            ref={(el) => {
              cards.current[i] = el;
            }}
          >
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <figure>
              <img src={c.img.src} width={c.img.w} height={c.img.h} alt={c.img.alt} fetchPriority="low" decoding="async" />
              <figcaption>{c.img.caption}</figcaption>
            </figure>
          </article>
        ))}
      </div>
    </section>
  );
}

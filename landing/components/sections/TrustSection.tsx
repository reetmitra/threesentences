"use client";

import { Reveal } from "@/components/ui/Reveal";

const quotes = [
  {
    quote: "I've tried every journaling app. This is the first one I've used every day for six months.",
    attribution: "Early beta tester, London",
  },
  {
    quote: "Three sentences sounds like nothing. It turns out it's everything.",
    attribution: "Designer, New York",
  },
  {
    quote: "The constraint removed my last excuse. I just write.",
    attribution: "Founder, Singapore",
  },
];

export function TrustSection() {
  return (
    <section className="py-20 sm:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {quotes.map((q, i) => (
            <Reveal key={i} delay={i * 120}>
              <div style={{ display: 'flex', flexDirection: 'column', padding: '32px 28px', background: '#15151a', border: '1px solid #1e1e22', borderRadius: 16 }}>
                {/* Decorative open-quote glyph */}
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 72, lineHeight: 0.6, color: '#ebe7dc', opacity: 0.12, marginBottom: -24, userSelect: 'none' }}>
                  &ldquo;
                </div>
                {/* Quote body */}
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, color: '#ebe7dc', lineHeight: 1.55, flex: 1, marginTop: 32 }}>
                  {q.quote}
                </p>
                {/* Attribution */}
                <div style={{ marginTop: 'auto', paddingTop: 24 }}>
                  <div style={{ width: 32, height: 1, background: '#1e1e22', marginBottom: 12 }} />
                  <p style={{ fontSize: 12, color: '#8a877e', fontFamily: 'var(--font-sans)' }}>
                    {q.attribution}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

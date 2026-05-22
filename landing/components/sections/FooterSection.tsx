import {
  LP_INK,
  LP_INK_DIM,
  LP_FRAME,
  LP_SANS,
  LP_SERIF,
  LP_MONO,
  Eyebrow,
  P,
  CTA,
  Mark,
  Hairline,
} from "@/components/lp";

const columns = [
  { title: 'Product', links: ['How it works', 'The Circle', 'AI Reflection', 'Privacy & Security', 'iOS App'] },
  { title: 'Company', links: ['About 363', 'Manifesto', 'Blog', 'Careers', 'Contact'] },
  { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Journal Policy', 'Cookie Policy'] },
];

export function FooterSection({ onCTAClick }: { onCTAClick: () => void }) {
  return (
    <footer style={{ background: '#060608', borderTop: `1px solid ${LP_FRAME}`, padding: '72px 64px 48px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 64, marginBottom: 64 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <Mark size={26} />
              <span style={{ fontFamily: LP_SERIF, fontStyle: 'italic', fontSize: 18, color: LP_INK, letterSpacing: -0.3 }}>Three Sentences</span>
            </div>
            <P style={{ maxWidth: 260, marginBottom: 24 }}>A private daily journaling practice for the relentless. Invite only.</P>
            <CTA size="sm" ghost onClick={onCTAClick}>Request access</CTA>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <Eyebrow style={{ marginBottom: 20 }}>{col.title}</Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    style={{ fontFamily: LP_SANS, fontSize: 14, color: LP_INK_DIM, textDecoration: 'none', transition: 'color 180ms' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = LP_INK}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = LP_INK_DIM}
                  >{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Hairline width="100%" style={{ margin: '0 0 32px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <P style={{ fontSize: 12 }}>© 2026 363™. All rights reserved. Be better. Do better.</P>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {['@363v1', 'three63.com'].map((h) => (
              <span key={h} style={{ fontFamily: LP_MONO, fontSize: 10, color: LP_INK_DIM, letterSpacing: 1.8, textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

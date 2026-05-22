import { Logo3hree } from "@/components/Logo3hree";

export function FooterSection() {
  return (
    <footer style={{ background: '#060608', borderTop: '1px solid #1e1e22', paddingTop: 80, paddingBottom: 48 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 64px' }}>
        {/* 4-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 64, marginBottom: 64 }}>
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Logo3hree />
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: '#ebe7dc' }}>Three Sentences</span>
            </div>
            <p style={{ fontSize: 14, fontFamily: 'var(--font-sans)', color: '#8a877e', lineHeight: 1.6, maxWidth: 280, marginBottom: 24 }}>
              A quiet daily practice. Three sentences. Every day.
            </p>
            <button style={{ fontSize: 14, fontFamily: 'var(--font-sans)', color: '#ebe7dc', background: 'transparent', border: '1px solid #1e1e22', borderRadius: 999, padding: '10px 22px', cursor: 'pointer' }}>
              Request access
            </button>
          </div>
          {/* Col 2: Product */}
          <div>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 2.4, color: '#75726a', marginBottom: 20 }}>Product</p>
            {['How it works', 'Features', 'Pricing', 'Changelog', 'Status'].map(l => (
              <p key={l} style={{ fontSize: 14, fontFamily: 'var(--font-sans)', color: '#8a877e', marginBottom: 12, cursor: 'pointer' }}>{l}</p>
            ))}
          </div>
          {/* Col 3: Company */}
          <div>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 2.4, color: '#75726a', marginBottom: 20 }}>Company</p>
            {['About', 'Blog', 'Careers', 'Press', 'Contact'].map(l => (
              <p key={l} style={{ fontSize: 14, fontFamily: 'var(--font-sans)', color: '#8a877e', marginBottom: 12, cursor: 'pointer' }}>{l}</p>
            ))}
          </div>
          {/* Col 4: Legal */}
          <div>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 2.4, color: '#75726a', marginBottom: 20 }}>Legal</p>
            {['Privacy', 'Terms', 'Cookie policy', 'GDPR', 'Accessibility'].map(l => (
              <p key={l} style={{ fontSize: 14, fontFamily: 'var(--font-sans)', color: '#8a877e', marginBottom: 12, cursor: 'pointer' }}>{l}</p>
            ))}
          </div>
        </div>
        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #1e1e22', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, fontFamily: 'var(--font-sans)', color: '#75726a' }}>© 2026 Three Sentences. All rights reserved.</p>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 2.4, color: '#75726a' }}>@363v1 · three63.com</p>
        </div>
      </div>
    </footer>
  );
}

import { Eyebrow, H2, LP_INK, LP_INK_DIM, LP_PAPER, LP_SANS, LP_SERIF } from "./lp";

export const SUPPORT_EMAIL = "support@example.com";

export type LegalSection = { heading: string; body: string[] };

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: LegalSection[] }) {
  return (
    <main style={{ background: LP_PAPER, minHeight: "100vh", padding: "96px 16px" }}>
      <article style={{ maxWidth: 680, margin: "0 auto" }}>
        <a href="/" style={{ fontFamily: LP_SANS, fontSize: 14, color: LP_INK_DIM, textDecoration: "none" }}>← Three Sentences</a>
        <H2 style={{ marginTop: 32 }}>{title}</H2>
        <Eyebrow style={{ marginTop: 16, marginBottom: 48 }}>Last updated {updated}</Eyebrow>
        {sections.map((s) => (
          <section key={s.heading} style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: LP_SERIF, fontSize: 26, fontWeight: 400, color: LP_INK, margin: "0 0 12px" }}>{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} style={{ fontFamily: LP_SANS, fontSize: 16, lineHeight: 1.65, color: LP_INK_DIM, margin: "0 0 12px" }}>{p}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}

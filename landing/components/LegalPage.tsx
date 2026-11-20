// Forwarded to the owner's inbox at the registrar; keep that alias alive.
export const SUPPORT_EMAIL = "support@three63.com";

export type LegalSection = { heading: string; body: string[] };

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: LegalSection[] }) {
  return (
    <main className="legal">
      <article>
        <a className="back" href="/">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          Three Sentences
        </a>
        <h1>{title}</h1>
        <p className="updated">Last updated {updated}</p>
        {sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}

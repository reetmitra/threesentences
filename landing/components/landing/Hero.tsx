import { Reveal } from "./Reveal";
import { RequestButton } from "./Waitlist";

export function Hero() {
  return (
    <section id="top" data-stop="hero" className="hero">
      <div className="hero-hit" data-scene-hover aria-hidden="true" />
      <div className="hero-copy">
        <Reveal as="h1">Three sentences, every night.</Reveal>
        <Reveal as="p" i={1} className="lead">
          A quiet daily journaling practice on a single truth: you cannot be perfect, but you can be relentless.
        </Reveal>
        <Reveal i={2} className="hero-actions">
          <RequestButton>
            Request access <span className="arrow" aria-hidden="true">→</span>
          </RequestButton>
          <a className="link" href="#loop">
            See how it works
          </a>
        </Reveal>
        <Reveal as="p" i={3} className="hero-facts">
          Invite only. Launching Q4 2026, iOS first. For adults 18 and over. Be better. Do better.
        </Reveal>
      </div>
    </section>
  );
}

import { Reveal } from "./Reveal";
import { Tilt } from "./Tilt";
import { WriteSlip } from "./WriteSlip";

export function Rule() {
  return (
    <section id="rule" data-stop="rule" className="section">
      <div className="split">
        <div className="col-a">
          <Reveal as="h2">Three. No more, no less.</Reveal>
          <Reveal as="p" i={1} className="lead">
            Each day, write exactly three sentences about your day. Refine them until the day ends; after that, no edits
            and no deletions. Your words stand.
          </Reveal>
          <Reveal as="p" i={2} className="text soft">
            Try it. Write three sentences on the slip and watch tonight&apos;s night light up.
          </Reveal>
        </div>
        <Reveal i={1} className="col-b">
          <Tilt max={5}>
            <WriteSlip />
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}

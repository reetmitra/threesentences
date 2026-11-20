import { Reveal } from "./Reveal";
import { Tilt } from "./Tilt";

const ROWS: [string, string][] = [
  ["Streak shame for missed days", "Two days of grace built in"],
  ["Infinite scroll of past entries", "A calendar that fills as you do"],
  ["AI that rewrites your voice", "Your words stay your words"],
  ["Likes and follower counts", "A small circle, private by default"],
];

export function Instead() {
  return (
    <section id="why" data-stop="instead" className="section">
      <div className="split">
        <div className="col-a">
          <Reveal as="h2">Less to write. More days kept.</Reveal>
          <Reveal as="p" i={1} className="lead">
            Most journaling apps ask you to write a lot. So most days, you write nothing.
          </Reveal>
          <Reveal as="p" i={2} className="text soft">
            Blank pages are intimidating. Streaks are punishing. Notifications scream for your attention. What if the
            smallest possible practice was also the most effective one?
          </Reveal>
        </div>
        <Reveal i={1} className="col-b">
          <Tilt>
            <div className="slip">
              <div className="instead-cols">
                <span>The old way</span>
                <span>The Three Sentences way</span>
              </div>
              <div className="instead-lines">
                <span>Open a blank page. Write until you feel done.</span>
                <span>Write three sentences. Submit. Close the app.</span>
              </div>
              {ROWS.map(([old, now]) => (
                <div className="slip-row two" key={old}>
                  <span className="what">{old}</span>
                  <span className="dots" aria-hidden="true" />
                  <span className="val wrap">{now}</span>
                </div>
              ))}
              <div className="slip-total">
                <span>What it asks of you</span>
                <span>Three sentences</span>
              </div>
            </div>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}

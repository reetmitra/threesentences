import { Reveal } from "./Reveal";
import { Tilt } from "./Tilt";

export function Loop() {
  return (
    <section id="loop" data-stop="loop" className="section">
      <div className="split">
        <div className="col-a">
          <Reveal as="h2">One minute. Every day.</Reveal>
          <Reveal as="p" i={1} className="lead">
            Open the app, write three sentences, close it. Come back tomorrow.
          </Reveal>
          <Reveal as="p" i={2} className="text soft">
            Just you, the date, and a quiet writing surface. No streak nags, no scrolling feed.
          </Reveal>
        </div>
        <Reveal i={1} className="col-b">
          <Tilt>
            <div className="slip">
              <p className="slip-group" style={{ marginTop: 0 }}>
                Tonight
              </p>
              <div className="slip-row">
                <span className="what">
                  <strong>Open the app.</strong>
                  <span>Just you, the date, and a quiet writing surface.</span>
                </span>
                <span className="dots" aria-hidden="true" />
                <span className="val">5 sec</span>
              </div>
              <div className="slip-row">
                <span className="what">
                  <strong>Write three sentences.</strong>
                  <span>The counter watches as you go. Submit unlocks the moment you reach exactly three.</span>
                </span>
                <span className="dots" aria-hidden="true" />
                <span className="val">45 sec</span>
              </div>
              <p className="slip-group">If you like</p>
              <div className="slip-row">
                <span className="what">
                  <strong>How today felt, and your habits.</strong>
                  <span>One word for the day, up to three habits, yes or no.</span>
                </span>
                <span className="dots" aria-hidden="true" />
                <span className="val">10 sec</span>
              </div>
              <p className="slip-group">Then</p>
              <div className="slip-row">
                <span className="what">
                  <strong>Close it. Return tomorrow.</strong>
                  <span>Watch the calendar quietly fill, day by day.</span>
                </span>
                <span className="dots" aria-hidden="true" />
                <span className="val">0 sec</span>
              </div>
              <div className="slip-total">
                <span>Every day</span>
                <span>1 min</span>
              </div>
            </div>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}

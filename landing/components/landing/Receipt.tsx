import { Reveal } from "./Reveal";
import { Tilt } from "./Tilt";

export function Receipt() {
  return (
    <section id="grace" data-stop="receipt" className="section receipt">
      <div className="split">
        <div className="col-a">
          <Reveal as="h2">Two days of grace.</Reveal>
          <Reveal as="p" i={1} className="lead">
            Two days of grace, built in. Miss a day, return without shame.
          </Reveal>
          <Reveal as="p" i={2} className="text soft">
            Empty days are not failures. They are days.
          </Reveal>
        </div>
        <Reveal i={1} className="col-b">
          <Tilt>
            <div className="slip">
              <p className="slip-group" style={{ marginTop: 0 }}>
                The year, added up
              </p>
              <div className="slip-row">
                <span className="what">Nights in a year</span>
                <span className="dots" aria-hidden="true" />
                <span className="val">365</span>
              </div>
              <div className="slip-row">
                <span className="what">Days of grace, built in</span>
                <span className="dots" aria-hidden="true" />
                <span className="val">−2</span>
              </div>
              <div className="slip-total">
                <span>Nights you keep</span>
                <span>363</span>
              </div>
            </div>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}

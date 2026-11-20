import { SUPPORT_EMAIL } from "@/components/LegalPage";
import { RequestButton } from "./Waitlist";
import { TonightTile } from "./TonightTile";

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-grid">
        <div className="tile tile-statement">
          <p className="lead">A private daily journaling practice for the relentless. Invite only.</p>
          <p className="tile-fine">© 2026 363™. All rights reserved. Be better. Do better.</p>
        </div>
        <nav className="tile tile-nav" aria-label="Footer">
          <ul>
            <li><a href="#loop">How it works</a></li>
            <li><a href="#inside">Inside the app</a></li>
            <li><a href="#year">The 363</a></li>
            <li><a href="#faq">Questions</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </nav>
        <TonightTile />
        <div className="tile tile-mail">
          <p className="small soft">Say hello</p>
          <a className="lead" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
        </div>
        <div className="tile tile-word" aria-label="Three Sentences by 363">
          <span aria-hidden="true">Three</span>
        </div>
        <RequestButton className="tile tile-go">
          <b>
            Request
            <br />
            access
          </b>
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" aria-hidden="true">
            <path d="M12 36 36 12M16 12h20v20" />
          </svg>
        </RequestButton>
      </div>
      <p className="credits">
        Pictures, all public domain or CC0:{" "}
        <a href="https://www.rawpixel.com/image/440195/free-photo-image-moon-full-nasa">the moon, NASA</a>;{" "}
        <a href="https://commons.wikimedia.org/wiki/File:Inktstel_van_tin_met_inktpot,_zandpot_en_veer,_BK-KOG-2595-B.jpg">ink stand, Rijksmuseum</a>;{" "}
        <a href="https://commons.wikimedia.org/w/index.php?curid=81854537">Woman Reading by Lamplight, Félix-Hilaire Buhot</a>;{" "}
        <a href="https://commons.wikimedia.org/wiki/File:Edward_L._Loper,_Copper_Kettle,_c._1939,_NGA_27053.jpg">Copper Kettle, Edward L. Loper</a>;{" "}
        <a href="https://commons.wikimedia.org/wiki/Category:Longfellow_House%E2%80%93Washington%27s_Headquarters_National_Historic_Site">a letter, Longfellow House</a>.
      </p>
    </footer>
  );
}

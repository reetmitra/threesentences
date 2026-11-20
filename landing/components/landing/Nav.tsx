"use client";

import { useEffect, useState } from "react";
import { RequestButton } from "./Waitlist";

export function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="nav" data-solid={solid}>
      <a className="brand" href="#top" aria-label="Three Sentences, back to the top">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        Three
      </a>
      <nav className="nav-right" aria-label="Sections">
        <div className="nav-links">
          <a href="#loop">How it works</a>
          <a href="#inside">Inside the app</a>
          <a href="#year">363</a>
          <a href="#faq">Questions</a>
        </div>
        <RequestButton />
      </nav>
    </header>
  );
}

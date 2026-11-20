import { SceneStage } from "@/components/scene/SceneStage";
import { WaitlistProvider } from "@/components/landing/Waitlist";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Instead } from "@/components/landing/Instead";
import { Rule } from "@/components/landing/Rule";
import { Loop } from "@/components/landing/Loop";
import { Inside } from "@/components/landing/Inside";
import { Year } from "@/components/landing/Year";
import { Receipt } from "@/components/landing/Receipt";
import { Reflection } from "@/components/landing/Reflection";
import { Principles } from "@/components/landing/Principles";
import { Faq } from "@/components/landing/Faq";
import { Close } from "@/components/landing/Close";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <WaitlistProvider>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SceneStage />
      <div className="page">
        <Nav />
        <main id="main">
          <Hero />
          <Instead />
          <Rule />
          <Loop />
          <Inside />
          <Year />
          <Receipt />
          <Reflection />
          <Principles />
          <Faq />
          <Close />
        </main>
        <Footer />
      </div>
    </WaitlistProvider>
  );
}

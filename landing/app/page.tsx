"use client";

import { useState } from "react";
import { WaitlistModal } from "@/components/WaitlistModal";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { RuleSection } from "@/components/sections/RuleSection";
import { HowSection } from "@/components/sections/HowSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { The363Section } from "@/components/sections/The363Section";
import { PrinciplesSection } from "@/components/sections/PrinciplesSection";
import { AIReflectionSection } from "@/components/sections/AIReflectionSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { FooterSection } from "@/components/sections/FooterSection";

export default function LandingPage() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const openWaitlist = () => setIsWaitlistOpen(true);

  return (
    <div style={{ minHeight: '100vh', background: '#060608' }}>
      <HeroSection onCTAClick={openWaitlist} />
      <ProblemSection />
      <RuleSection onCTAClick={openWaitlist} />
      <HowSection />
      <FeaturesSection />
      <The363Section />
      <PrinciplesSection />
      <AIReflectionSection />
      <TrustSection />
      <FAQSection />
      <FinalCTASection onCTAClick={openWaitlist} />
      <FooterSection onCTAClick={openWaitlist} />

      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </div>
  );
}

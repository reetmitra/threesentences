"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WaitlistModal } from "@/components/WaitlistModal";
import { DemoSlides } from "@/components/DemoSlides";
import { FloatingParticles } from "@/components/FloatingParticles";
import { GlowOrb } from "@/components/GlowOrb";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { ConstraintSection } from "@/components/sections/ConstraintSection";
import { The363Section } from "@/components/sections/The363Section";
import { PrinciplesSection } from "@/components/sections/PrinciplesSection";
import { AIReflectionSection } from "@/components/sections/AIReflectionSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { FooterSection } from "@/components/sections/FooterSection";

function SectionDivider() {
  return (
    <motion.div
      className="flex justify-center py-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5 }}
    >
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
        initial={{ width: 0 }}
        whileInView={{ width: "60%" }}
        viewport={{ once: true }}
        transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
}

export default function LandingPage() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const openWaitlist = () => setIsWaitlistOpen(true);

  return (
    <div className="bg-black text-white relative">
      {/* Ambient floating particles */}
      <FloatingParticles />

      {/* Glow orbs positioned between sections */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <GlowOrb className="top-[90vh] left-1/4 -translate-x-1/2" size={500} delay={0} />
        <GlowOrb className="top-[220vh] right-0 translate-x-1/4" size={400} delay={1} />
        <GlowOrb className="top-[380vh] left-0 -translate-x-1/4" size={450} delay={2} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <HeroSection onCTAClick={openWaitlist} />
        <SectionDivider />
        <ProblemSection />
        <SectionDivider />
        <ConstraintSection />
        <DemoSlides />
        <SectionDivider />
        <The363Section />
        <SectionDivider />
        <PrinciplesSection />
        <SectionDivider />
        <AIReflectionSection />
        <TrustSection />
        <SectionDivider />
        <FinalCTASection onCTAClick={openWaitlist} />
        <FooterSection />
      </div>

      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </div>
  );
}

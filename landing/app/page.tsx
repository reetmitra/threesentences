"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WaitlistModal } from "@/components/WaitlistModal";
import { Button } from "@/components/ui/button";
import { TextScramble } from "@/components/ui/text-scramble";

export default function LandingPage() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo in nav */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold italic tracking-tight">THREE</span>
            <span className="text-[10px] text-white/30 tracking-wider uppercase">by 363™</span>
          </div>

          {/* Join Waitlist Button */}
          <Button
            variant="outline"
            onClick={() => setIsWaitlistOpen(true)}
            className="text-sm"
          >
            Join the waitlist
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/[0.02]" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Main Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold italic tracking-tight text-white">
              THREE
            </h1>
            <motion.p
              className="text-sm sm:text-base text-white/50 tracking-wide mt-4 font-light italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              be better, do better
            </motion.p>
            <motion.p
              className="text-xs text-white/30 tracking-[0.2em] uppercase mt-3 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              by 363™
            </motion.p>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mb-8 mt-12"
          >
            <TextScramble
              className="text-lg md:text-xl text-white/40 font-light tracking-wide"
              duration={1.2}
              speed={0.03}
            >
              Three sentences. Every day. That's it.
            </TextScramble>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="text-sm text-white/30 max-w-md mx-auto leading-relaxed mb-10"
          >
            A journaling practice built on constraint. No pressure to write more.
            No guilt for writing less. Just show up and write three.
          </motion.p>

          {/* Release Date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mb-10"
          >
            <p className="text-xs text-white/20 uppercase tracking-[0.3em] font-mono">
              Coming Q4 2026
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.7 }}
          >
            <Button
              size="lg"
              onClick={() => setIsWaitlistOpen(true)}
              className="text-base px-8 py-6 h-auto"
            >
              Get early access
            </Button>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-16 bg-gradient-to-b from-transparent to-white/20" />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-white/40"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        className="py-6 px-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <p className="text-xs text-white/20">
          &copy; {new Date().getFullYear()} 363™. All rights reserved.
        </p>
      </motion.footer>

      {/* Waitlist Modal */}
      <WaitlistModal
        open={isWaitlistOpen}
        onOpenChange={setIsWaitlistOpen}
      />
    </div>
  );
}

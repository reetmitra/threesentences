"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Loader2, X } from "lucide-react";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from("waitlist")
        .insert([{ name: name.trim(), email: email.trim().toLowerCase() }]);

      if (supabaseError) {
        if (supabaseError.code === "23505") {
          setError("This email is already on the waitlist.");
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setTimeout(() => {
          setIsSuccess(false);
          setName("");
          setEmail("");
        }, 300);
      }, 2500);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsSuccess(false);
      setName("");
      setEmail("");
      setError(null);
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dotted Surface Background */}
          <DottedSurface className="opacity-50" />

          {/* Close Button */}
          <motion.button
            onClick={handleClose}
            className="absolute top-6 right-6 z-50 p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.1 }}
          >
            <X className="h-5 w-5 text-white/70" />
          </motion.button>

          {/* Content */}
          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  >
                    <CheckCircle className="h-20 w-20 text-white mb-6" strokeWidth={1} />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-light text-white mb-3"
                  >
                    You&apos;re on the list
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/50 text-sm tracking-wide"
                  >
                    We&apos;ll notify you when 3hree launches.
                  </motion.p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-md w-full mx-auto"
                >
                  {/* Header */}
                  <div className="text-center mb-10">
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xs font-medium tracking-[0.3em] uppercase text-white/40 mb-4"
                    >
                      by 363™
                    </motion.p>
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4"
                    >
                      Join the waitlist
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed"
                    >
                      Be the first to experience Three when we launch in Q4 2026.
                      Three sentences. Every day. That&apos;s it.
                    </motion.p>
                  </div>

                  {/* Form */}
                  <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white/60 text-xs tracking-wider uppercase">
                        Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                        className="bg-white/5 border-white/10 focus:border-white/30 text-white placeholder:text-white/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/60 text-xs tracking-wider uppercase">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="bg-white/5 border-white/10 focus:border-white/30 text-white placeholder:text-white/30"
                      />
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm text-center"
                      >
                        {error}
                      </motion.p>
                    )}

                    <Button
                      type="submit"
                      className="w-full mt-6"
                      size="lg"
                      disabled={isLoading || !name.trim() || !email.trim()}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Join waitlist"
                      )}
                    </Button>
                  </motion.form>

                  {/* Footer */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-center text-white/30 text-xs mt-8 tracking-wide"
                  >
                    No spam, ever. Unsubscribe anytime.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  LP_INK,
  LP_INK_DIM,
  LP_INK_FADE,
  LP_PAPER_2,
  LP_SURFACE,
  LP_FRAME,
  LP_SANS,
  LP_MONO,
  H3,
  Lead,
  Eyebrow,
  P,
  CTA,
  Mark,
} from "@/components/lp";
import { supabase } from "@/lib/supabase";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClose = () => onOpenChange(false);
  const valid = /\S+@\S+\.\S+/.test(email);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setSubmitted(false);
        setEmail('');
        setError(null);
        setLoading(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    setError(null);

    const { error: supabaseError } = await supabase
      .from('waitlist')
      .insert([{ email: email.trim().toLowerCase() }]);

    if (supabaseError) {
      if (supabaseError.code === '23505') {
        setError('This email is already on the waitlist.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      setLoading(false);
      return;
    }

    setLoading(false);
    setSubmitted(true);
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'lp-fade-in 200ms ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          background: LP_PAPER_2,
          borderRadius: 28,
          border: `1px solid ${LP_FRAME}`,
          padding: '52px 48px 44px',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8)',
          position: 'relative',
          animation: 'lp-modal-in 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            background: 'transparent',
            border: `1px solid ${LP_FRAME}`,
            color: LP_INK_DIM,
            cursor: 'pointer',
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >×</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Mark size={44} />
            <div style={{ height: 28 }} />
            <H3 style={{ fontSize: 28 }}>You're on the list.</H3>
            <div style={{ height: 16 }} />
            <Lead style={{ fontSize: 15, textAlign: 'center', maxWidth: '100%' }}>
              We'll send you in when there's room — no rush, no spam. Just a quiet note when your wave opens.
            </Lead>
            <div style={{ height: 32 }} />
            <Eyebrow>Be better. Do better.</Eyebrow>
          </div>
        ) : (
          <>
            <Mark size={36} />
            <div style={{ height: 24 }} />
            <H3 style={{ fontSize: 30 }}>Request early access.</H3>
            <div style={{ height: 12 }} />
            <Lead style={{ fontSize: 15, maxWidth: '100%' }}>
              Invite-only. We open in small waves. Enter your email and we'll find you when there's room.
            </Lead>
            <div style={{ height: 32 }} />
            <div style={{
              height: 54,
              borderRadius: 12,
              border: `1px solid ${LP_FRAME}`,
              background: LP_SURFACE,
              display: 'flex',
              alignItems: 'center',
              padding: '0 18px',
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && valid) handleSubmit(); }}
                placeholder="your@email.com"
                autoFocus
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: LP_INK,
                  background: 'transparent',
                  fontFamily: LP_SANS,
                  outline: 'none',
                  border: 'none',
                }}
              />
            </div>
            {error && (
              <div style={{
                marginTop: 10,
                fontFamily: LP_SANS,
                fontSize: 13,
                color: '#e05c5c',
                lineHeight: 1.4,
              }}>{error}</div>
            )}
            <div style={{ height: error ? 10 : 14 }} />
            <CTA
              fill
              size="lg"
              style={{ width: '100%' }}
              onClick={() => valid && handleSubmit()}
              disabled={!valid || loading}
            >
              {loading ? 'Joining…' : 'Join the waitlist'}
            </CTA>
            <div style={{ height: 18 }} />
            <P style={{ textAlign: 'center', fontSize: 11, letterSpacing: 0.3, color: LP_INK_FADE }}>
              No spam. No marketing. Just a single note when your spot opens.
            </P>
          </>
        )}
      </div>
    </div>
  );
}

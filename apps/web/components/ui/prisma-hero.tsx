'use client';

import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({ text, className = '', showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(' ');

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : '0.25em' }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

export interface NavItem {
  label: string;
  href: string;
}

const defaultNavItems: NavItem[] = [
  { label: 'Pipeline', href: '#pipeline' },
  { label: 'Quick Start', href: '/quickstart' },
  { label: 'Sign In', href: '/login' },
];

export interface PrismaHeroProps {
  title?: string;
  onGoogleLogin?: () => void;
  onDemoRequest?: (email: string) => void;
  navItems?: NavItem[];
}

export const PrismaHero = ({
  title = 'AIRLOCK',
  onGoogleLogin,
  onDemoRequest,
  navItems = defaultNavItems,
}: PrismaHeroProps) => {
  const [demoEmail, setDemoEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleDemoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!demoEmail.trim()) return;
    setIsSubmitting(true);
    if (onDemoRequest) {
      onDemoRequest(demoEmail.trim());
    } else {
      window.location.href = `/login?email=${encodeURIComponent(demoEmail.trim())}&tab=demo`;
    }
  }

  function handleGoogleClick() {
    if (onGoogleLogin) {
      onGoogleLogin();
    } else {
      window.location.href = '/api/auth/google';
    }
  }

  return (
    <section className="h-screen w-full p-2 sm:p-4 relative">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem] shadow-2xl">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        />

        {/* Noise overlay */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/75" />

        {/* Clean Top Floating Navbar (Only Pipeline, Quick Start, Sign In) */}
        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="flex items-center gap-4 rounded-b-2xl bg-black/90 backdrop-blur-md px-6 py-2.5 sm:gap-8 md:gap-10 md:rounded-b-3xl md:px-10 border-b border-x border-white/10 shadow-xl">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs sm:text-sm font-medium transition-colors tracking-wide"
                style={{ color: 'rgba(225, 224, 204, 0.85)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.85)')}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Hero content: AIRLOCK Title on Left & 2 Aligned Options on Right */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 sm:px-8 md:px-12 md:pb-10 z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-12">
            
            {/* Left Column: Bold AIRLOCK Typography */}
            <div className="shrink-0">
              <h1
                className="font-medium leading-[0.82] tracking-[-0.07em] text-[22vw] sm:text-[18vw] md:text-[15vw] lg:text-[13vw] select-none"
                style={{ color: '#E1E0CC' }}
              >
                <WordsPullUp text={title} showAsterisk />
              </h1>
            </div>

            {/* Right Column: Beautifully Aligned 2 Options (Option 1: Google Sign-in / Option 2: Demo Request) */}
            <div className="w-full max-w-md flex flex-col gap-3.5 pb-2 lg:pb-3">
              
              {/* Option 1: Sign up / Sign in with Google */}
              <motion.button
                type="button"
                onClick={handleGoogleClick}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="group flex items-center justify-between w-full rounded-full bg-[#E1E0CC] hover:bg-white text-slate-950 font-semibold px-5 py-2.5 sm:py-3 text-xs sm:text-sm transition-all shadow-xl hover:scale-[1.01] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </div>
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110">
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#E1E0CC]" />
                </span>
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 px-2">
                <div className="flex-1 h-px bg-white/15"></div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">or demo request</span>
                <div className="flex-1 h-px bg-white/15"></div>
              </div>

              {/* Option 2: Demo Request for Users Who Enter Email ID */}
              <motion.form
                onSubmit={handleDemoSubmit}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center w-full p-1 bg-black/60 border border-white/20 rounded-full backdrop-blur-md focus-within:border-[#E1E0CC] transition-colors shadow-lg"
              >
                <input
                  type="email"
                  required
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  placeholder="Enter email for Demo Request..."
                  className="px-4 py-2 bg-transparent text-xs sm:text-sm font-sans text-white placeholder:text-white/45 outline-none flex-1 min-w-0"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#E1E0CC] hover:bg-white text-slate-950 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer shrink-0 shadow-md hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSubmitting ? 'Requesting...' : 'Request Demo →'}
                </button>
              </motion.form>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrismaHero;

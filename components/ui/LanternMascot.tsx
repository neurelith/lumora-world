'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MascotMood = 'neutral' | 'encouraging' | 'celebrating' | 'thinking' | 'calm' | 'confused' | 'sleepy';

interface LanternMascotProps {
  mood?: MascotMood;
  size?: number;
  speechBubble?: string;
  showEyes?: boolean;
  className?: string;
}

const MOOD: Record<MascotMood, {
  eyeH: number; eyeW: number; pupilScale: number; lidY: number;
  brow: number; mouth: string; blush: number; ear: number; bounce: number; tail: boolean;
}> = {
  neutral:      { eyeH: 15, eyeW: 14, pupilScale: 1,   lidY: 0, brow: 0,  mouth: 'M -10 4 Q 0 9 10 4', blush: 0,    ear: 0,  bounce: 0, tail: false },
  encouraging:  { eyeH: 17, eyeW: 15, pupilScale: 1.1, lidY: -1, brow: -2, mouth: 'M -9 4 Q 0 10 9 4',  blush: 0.18, ear: -4, bounce: 2, tail: true },
  celebrating:  { eyeH: 9,  eyeW: 16, pupilScale: 1.15,lidY: -2, brow: -3, mouth: 'M -11 3 Q 0 11 11 3', blush: 0.32, ear: 7,  bounce: 7, tail: true },
  thinking:     { eyeH: 10, eyeW: 14, pupilScale: 0.9, lidY: 3, brow: 5,  mouth: 'M -4 5 Q 0 3 4 5',   blush: 0.1,  ear: 10, bounce: 0, tail: false },
  calm:         { eyeH: 3,  eyeW: 15, pupilScale: 0.8, lidY: 7, brow: 2,  mouth: 'M -6 3 Q 0 6 6 3',   blush: 0.14, ear: 0,  bounce: 0, tail: false },
  confused:     { eyeH: 14, eyeW: 18, pupilScale: 1,   lidY: 1, brow: 7,  mouth: 'M -5 6 Q 0 2 5 6',   blush: 0.12, ear: -9, bounce: 1, tail: false },
  sleepy:       { eyeH: 2,  eyeW: 16, pupilScale: 0.7, lidY: 9, brow: 1,  mouth: 'M -5 2 Q 0 5 5 2',   blush: 0.25, ear: 4,  bounce: 0, tail: false },
};

export const LanternMascot: React.FC<LanternMascotProps> = ({
  mood = 'neutral',
  size = 84,
  speechBubble,
  showEyes = true,
  className = '',
}) => {
  const c = MOOD[mood];
  const [blink, setBlink] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // auto blink every 2.8-4.2s
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      const delay = 2800 + Math.random() * 1400;
      t = setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 140); loop(); }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // eye-track global mouse, constrained to eye bounds
  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return;
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2 - size * 0.08;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
      setEyeOffset({ x: clamp(dx, 1) * 3.2, y: clamp(dy, 1) * 2.6 });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [size]);

  const eyeH = blink ? 1.2 : c.eyeH;
  const isCelebrate = mood === 'celebrating';

  return (
    <div ref={wrapRef} className={`relative flex flex-col items-center select-none ${className}`} style={{ width: size, height: size * 1.18 }}>
      <AnimatePresence mode="wait">
        {speechBubble && (
          <motion.div
            key={speechBubble}
            initial={{ opacity: 0, scale: 0.86, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.86, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className="absolute z-20 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ bottom: 'calc(100% + 10px)', width: 'max-content', maxWidth: 260 }}
          >
            <div className="relative bg-white/95 backdrop-blur-xl border border-hairline shadow-soft-md px-4 py-2.5 text-xs sm:text-sm font-display font-bold leading-snug text-ink text-center rounded-2xl">
              {speechBubble}
              <svg width="18" height="10" viewBox="0 0 18 10" className="absolute left-1/2 -translate-x-1/2 -bottom-[8px] drop-shadow-xs">
                <path d="M0 0 L9 10 L18 0 Z" fill="white" />
                <path d="M0 0 L9 10 L18 0 Z" fill="none" stroke="rgba(43,42,51,0.12)" strokeWidth="1" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* celebrate confetti */}
      {isCelebrate && (
        <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-[11px]"
              style={{ left: `${14 + i * 18}%`, top: 4 }}
              animate={{ y: [0, -18, 2], rotate: [0, 18, -12], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1, delay: i * 0.08, repeat: Infinity, repeatDelay: 1.2 }}
            >
              {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '🌟'}
            </motion.span>
          ))}
        </div>
      )}

      <svg viewBox="0 0 120 142" className="w-full h-full block" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Lumora mascot, feeling ${mood}`}>
        <defs>
          <radialGradient id="lum-body" cx="50%" cy="42%" r="68%">
            <stop offset="0%" stopColor="#FFF9EF" />
            <stop offset="55%" stopColor="#F5EFE8" />
            <stop offset="100%" stopColor="#EDE0D2" />
          </radialGradient>
          <radialGradient id="lum-head" cx="46%" cy="38%" r="72%">
            <stop offset="0%" stopColor="#FFFCF7" />
            <stop offset="58%" stopColor="#F5EFE8" />
            <stop offset="100%" stopColor="#E8D5C4" />
          </radialGradient>
          <linearGradient id="lum-ear" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F0DDC8" />
            <stop offset="100%" stopColor="#D9BCA6" />
          </linearGradient>
          <radialGradient id="lum-ear-inner" cx="50%" cy="55%" r="70%">
            <stop offset="0%" stopColor="#FF8FA3" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#D95A78" stopOpacity="0.95" />
          </radialGradient>
          <filter id="lum-shadow" x="-30%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#2D2B28" floodOpacity="0.10" />
          </filter>
          <filter id="lum-inner" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="0" dy="2" />
            <feGaussianBlur stdDeviation="3" result="b" />
            <feComposite in="b" in2="SourceAlpha" operator="out" />
            <feColorMatrix values="0 0 0 0 0.18 0 0 0 0 0.16 0 0 0 0 0.14 0 0 0 0.18 0" />
            <feComposite in2="SourceGraphic" operator="over" />
          </filter>
        </defs>

        {/* Tail with wag */}
        <motion.g style={{ transformOrigin: '98px 96px' }} animate={c.tail ? { rotate: [0, 14, -10, 0] } : { rotate: 0 }} transition={c.tail ? { duration: 1.05, repeat: Infinity, ease: 'easeInOut' } : undefined}>
          <path d="M 98 96 C 112 92 116 72 106 56 C 103 50 98 48 96 54 C 104 68 102 86 92 94 Z" fill="#EDE0D2" stroke="#D9C7B6" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M 100 64 C 108 60 110 52 106 48" stroke="#FFF9EF" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        </motion.g>

        {/* Body */}
        <ellipse cx="60" cy="106" rx="38" ry="32" fill="url(#lum-body)" stroke="#E8D5C4" strokeWidth="1.7" filter="url(#lum-shadow)" />
        {/* belly highlight */}
        <ellipse cx="60" cy="112" rx="22" ry="18" fill="white" opacity="0.62" />
        {/* paws */}
        <ellipse cx="38" cy="132" rx="13" ry="8.5" fill="#F5EFE8" stroke="#E8D5C4" strokeWidth="1.2" />
        <ellipse cx="82" cy="132" rx="13" ry="8.5" fill="#F5EFE8" stroke="#E8D5C4" strokeWidth="1.2" />
        <ellipse cx="38" cy="132" rx="6" ry="3.5" fill="#E8D5C4" opacity="0.9" />
        <ellipse cx="82" cy="132" rx="6" ry="3.5" fill="#E8D5C4" opacity="0.9" />

        {/* Head group with bounce */}
        <motion.g
          style={{ transformOrigin: '60px 58px' }}
          animate={{ y: c.bounce ? [0, -c.bounce, 0] : 0, rotate: c.bounce ? [0, 1.2, -1.2, 0] : 0 }}
          transition={c.bounce ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.35 }}
        >
          {/* ears with subtle rotation per mood */}
          <motion.g animate={{ rotate: c.ear }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} style={{ transformOrigin: '32px 28px' }}>
            <path d="M 18 34 L 26 10 L 42 26 Z" fill="url(#lum-ear)" stroke="#C9B8A8" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M 24 28 L 29 17 L 36 26 Z" fill="url(#lum-ear-inner)" />
          </motion.g>
          <motion.g animate={{ rotate: -c.ear }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} style={{ transformOrigin: '88px 28px' }}>
            <path d="M 102 34 L 94 10 L 78 26 Z" fill="url(#lum-ear)" stroke="#C9B8A8" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M 96 28 L 91 17 L 84 26 Z" fill="url(#lum-ear-inner)" />
          </motion.g>

          {/* head base */}
          <ellipse cx="60" cy="62" rx="36" ry="34" fill="url(#lum-head)" stroke="#E8D5C4" strokeWidth="1.7" filter="url(#lum-shadow)" />

          {/* cheeks */}
          <ellipse cx="28" cy="74" rx="11" ry="7" fill="#C96442" opacity={c.blush} />
          <ellipse cx="92" cy="74" rx="11" ry="7" fill="#C96442" opacity={c.blush} />

          {/* Eyes */}
          {showEyes && (
            <g>
              {/* eye whites / lids */}
              <g>
                <ellipse cx={42} cy={52 + c.lidY} rx={c.eyeW} ry={eyeH} fill={blink ? '#2D2B28' : 'white'} stroke="#E8D5C4" strokeWidth="1.1" />
                <ellipse cx={78} cy={52 + c.lidY} rx={c.eyeW} ry={eyeH} fill={blink ? '#2D2B28' : 'white'} stroke="#E8D5C4" strokeWidth="1.1" />
              </g>
              {!blink && (
                <>
                  {/* pupils with eye-track */}
                  <circle cx={42 + eyeOffset.x} cy={52 + c.lidY + eyeOffset.y * 0.6} r={7.5 * c.pupilScale} fill="#2D2B28" />
                  <circle cx={78 + eyeOffset.x} cy={52 + c.lidY + eyeOffset.y * 0.6} r={7.5 * c.pupilScale} fill="#2D2B28" />
                  {/* iris depth */}
                  <circle cx={42 + eyeOffset.x + 1.2} cy={52 + c.lidY + eyeOffset.y * 0.6 - 1} r={3.2} fill="#3A3835" opacity="0.95" />
                  <circle cx={78 + eyeOffset.x + 1.2} cy={52 + c.lidY + eyeOffset.y * 0.6 - 1} r={3.2} fill="#3A3835" opacity="0.95" />
                  {/* specular highlights — Apple depth cue */}
                  <ellipse cx={42 + eyeOffset.x + 2.6} cy={52 + c.lidY + eyeOffset.y * 0.6 - 2.4} rx={2.8} ry={2.4} fill="white" opacity="0.98" />
                  <ellipse cx={78 + eyeOffset.x + 2.6} cy={52 + c.lidY + eyeOffset.y * 0.6 - 2.4} rx={2.8} ry={2.4} fill="white" opacity="0.98" />
                  <circle cx={42 + eyeOffset.x - 1.6} cy={52 + c.lidY + eyeOffset.y * 0.6 + 2.2} r={1} fill="white" opacity={0.55} />
                  <circle cx={78 + eyeOffset.x - 1.6} cy={52 + c.lidY + eyeOffset.y * 0.6 + 2.2} r={1} fill="white" opacity={0.55} />
                  {/* celebrate star sparkle in eye */}
                  {isCelebrate && (
                    <>
                      <path d="M 42 38 L 43 41 L 46 42 L 43 43 L 42 46 L 41 43 L 38 42 L 41 41 Z" fill="white" opacity="0.95" />
                      <path d="M 78 38 L 79 41 L 82 42 L 79 43 L 78 46 L 77 43 L 74 42 L 77 41 Z" fill="white" opacity="0.95" />
                    </>
                  )}
                </>
              )}
              {/* brows */}
              <motion.path d={`M 30 ${36 + c.brow} Q 42 ${32 + c.brow} 54 ${36 + c.brow}`} stroke="#8B8680" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9" />
              <motion.path d={`M 66 ${36 - c.brow * 0.3} Q 78 ${32 - c.brow * 0.3} 90 ${36 - c.brow * 0.3}`} stroke="#8B8680" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9" />
              {/* closed calm lashes */}
              {mood === 'calm' && (
                <g stroke="#2D2B28" strokeWidth="1.25" strokeLinecap="round" opacity="0.9">
                  <path d="M 32 53 Q 42 55 52 53" fill="none" />
                  <path d="M 68 53 Q 78 55 88 53" fill="none" />
                </g>
              )}
            </g>
          )}

          {/* Nose — subtle inner shadow */}
          <ellipse cx="60" cy="68" rx="5.2" ry="3.8" fill="#C96442" />
          <ellipse cx="60" cy="67" rx="1.8" ry="1.1" fill="white" opacity="0.42" />

          {/* Mouth per mood */}
          <path d={c.mouth} transform="translate(60 66)" stroke="#2D2B28" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* whiskers — hairline, Apple thin */}
          <g stroke="#B8B0A6" strokeWidth="1" strokeLinecap="round" opacity="0.95">
            <path d="M 26 66 Q 14 64 8 60" fill="none" />
            <path d="M 26 71 Q 12 71 6 71" fill="none" />
            <path d="M 26 76 Q 14 78 8 82" fill="none" />
            <path d="M 94 66 Q 106 64 112 60" fill="none" />
            <path d="M 94 71 Q 108 71 114 71" fill="none" />
            <path d="M 94 76 Q 106 78 112 82" fill="none" />
          </g>

          {/* whisker dots */}
          <circle cx="28" cy="66" r="0.9" fill="#9E9A93" opacity="0.9" />
          <circle cx="28" cy="71" r="0.9" fill="#9E9A93" opacity="0.9" />
          <circle cx="28" cy="76" r="0.9" fill="#9E9A93" opacity="0.9" />
          <circle cx="92" cy="66" r="0.9" fill="#9E9A93" opacity="0.9" />
          <circle cx="92" cy="71" r="0.9" fill="#9E9A93" opacity="0.9" />
          <circle cx="92" cy="76" r="0.9" fill="#9E9A93" opacity="0.9" />
        </motion.g>
      </svg>
    </div>
  );
};

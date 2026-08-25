'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type MascotMood = 'neutral' | 'encouraging' | 'celebrating' | 'thinking' | 'calm' | 'sleepy' | 'confused';

interface LanternMascotProps {
  mood?: MascotMood;
  size?: number;
  speechBubble?: string;
  showEyes?: boolean;
  className?: string;
}

export const LanternMascot: React.FC<LanternMascotProps> = ({
  mood = 'neutral',
  size = 92,
  speechBubble,
  showEyes = true,
  className = '',
}) => {
  const [blink, setBlink] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Natural multi-frequency blinking loop
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      const delay = 2600 + Math.random() * 2000;
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        loop();
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // Eye-tracking global mouse (desktop)
  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return;
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      setEyeOffset({
        x: Math.max(-2.5, Math.min(2.5, dx * 2.5)),
        y: Math.max(-2, Math.min(2, dy * 2)),
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const isCelebrate = mood === 'celebrating';
  const isSleepy = mood === 'sleepy';
  const isThinking = mood === 'thinking';
  const isEncouraging = mood === 'encouraging';

  return (
    <div
      ref={wrapRef}
      className={`relative flex flex-col items-center select-none ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      {/* Speech Bubble floating safely ABOVE Lumi's ears */}
      <AnimatePresence mode="wait">
        {speechBubble && (
          <motion.div
            key={speechBubble}
            initial={{ opacity: 0, scale: 0.88, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="absolute z-30 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ bottom: 'calc(100% + 12px)', width: 'max-content', maxWidth: 280 }}
          >
            <div className="relative bg-white/95 backdrop-blur-xl border border-hairline shadow-soft-md px-4 py-2 text-xs sm:text-sm font-display font-bold leading-snug text-ink text-center rounded-2xl">
              {speechBubble}
              {/* Downward triangle pointer to Lumi's head */}
              <svg
                width="16"
                height="8"
                viewBox="0 0 16 8"
                className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] drop-shadow-xs"
              >
                <path d="M0 0 L8 8 L16 0 Z" fill="white" />
                <path d="M0 0 L8 8 L16 0 Z" fill="none" stroke="rgba(43,42,51,0.12)" strokeWidth="1" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebratory Stardust Confetti */}
      {isCelebrate && (
        <div className="absolute inset-0 pointer-events-none overflow-visible z-20" aria-hidden="true">
          {[...Array(7)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-xs"
              style={{ left: `${12 + i * 14}%`, top: -4 }}
              animate={{ y: [0, -22, 4], rotate: [0, 24, -18], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, delay: i * 0.08, repeat: Infinity, repeatDelay: 1.1 }}
            >
              {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '🌟'}
            </motion.span>
          ))}
        </div>
      )}

      {/* Sleepy Floating ZZZ Bubbles */}
      {isSleepy && (
        <div className="absolute -top-4 right-0 pointer-events-none z-20 font-display font-extrabold text-amber text-xs">
          <motion.span
            animate={{ opacity: [0, 1, 0], y: [0, -14], x: [0, 8], scale: [0.8, 1.2] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block"
          >
            z
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0], y: [0, -18], x: [0, 12], scale: [0.9, 1.3] }}
            transition={{ duration: 2.2, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block ml-1 font-bold text-sm"
          >
            Z
          </motion.span>
        </div>
      )}

      {/* Master Studio-Quality Lumi SVG Character */}
      <motion.svg
        viewBox="0 0 130 148"
        className="w-full h-full block overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Lumi the mascot, feeling ${mood}`}
        animate={
          isCelebrate
            ? { y: [0, -6, 0], rotate: [0, -2, 2, 0] }
            : isSleepy
            ? { y: [0, 2, 0], scaleY: [1, 0.98, 1] }
            : { y: [0, -2, 0] }
        }
        transition={{
          duration: isCelebrate ? 0.6 : isSleepy ? 3.0 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <defs>
          {/* Fur Gradient - Head & Body */}
          <radialGradient id="lumi-fur" cx="48%" cy="38%" r="68%">
            <stop offset="0%" stopColor="#FFFDF9" />
            <stop offset="55%" stopColor="#F9F1E6" />
            <stop offset="100%" stopColor="#EAD8C4" />
          </radialGradient>

          {/* Belly & Chest Gradient */}
          <radialGradient id="lumi-belly" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFF5E8" />
          </radialGradient>

          {/* Inner Ear Peach Pink */}
          <radialGradient id="lumi-ear-inner" cx="50%" cy="60%" r="70%">
            <stop offset="0%" stopColor="#FF9FB2" />
            <stop offset="100%" stopColor="#E66885" />
          </radialGradient>

          {/* Outer Ear Golden Biscuit */}
          <linearGradient id="lumi-ear-outer" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4E2D0" />
            <stop offset="100%" stopColor="#D9BFAB" />
          </linearGradient>

          {/* Golden Lantern Pendant Glow */}
          <radialGradient id="lantern-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF3B0" />
            <stop offset="45%" stopColor="#FFD152" />
            <stop offset="100%" stopColor="#E8A33D" stopOpacity="0.1" />
          </radialGradient>

          {/* Ambient Drop Shadow */}
          <filter id="lumi-shadow" x="-25%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#2B2A33" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* 1. Fluffy Animated Tail */}
        <g style={{ transformOrigin: '98px 105px' }}>
          <path
            d="M 96 102 C 114 96 122 74 110 56 C 105 48 98 48 96 56 C 104 70 102 88 90 98 Z"
            fill="#EAD8C4"
            stroke="#D9BFAB"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M 100 62 C 107 58 109 51 106 47"
            stroke="#FFFDF9"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>

        {/* 2. Chubby Pear-Shaped Body */}
        <ellipse
          cx="65"
          cy="110"
          rx="40"
          ry="33"
          fill="url(#lumi-fur)"
          stroke="#D9BFAB"
          strokeWidth="1.8"
          filter="url(#lumi-shadow)"
        />

        {/* Soft White Belly Patch */}
        <ellipse cx="65" cy="116" rx="24" ry="20" fill="url(#lumi-belly)" opacity="0.85" />

        {/* Little Kitty Paws */}
        <ellipse cx="42" cy="136" rx="12" ry="8" fill="#FFFDF9" stroke="#D9BFAB" strokeWidth="1.4" />
        <ellipse cx="88" cy="136" rx="12" ry="8" fill="#FFFDF9" stroke="#D9BFAB" strokeWidth="1.4" />
        <circle cx="39" cy="135" r="1.5" fill="#E66885" opacity="0.6" />
        <circle cx="45" cy="135" r="1.5" fill="#E66885" opacity="0.6" />
        <circle cx="85" cy="135" r="1.5" fill="#E66885" opacity="0.6" />
        <circle cx="91" cy="135" r="1.5" fill="#E66885" opacity="0.6" />

        {/* 3. Pointy Cat Ears */}
        <g>
          {/* Left Ear */}
          <path
            d="M 22 38 L 30 12 L 48 28 Z"
            fill="url(#lumi-ear-outer)"
            stroke="#D0B59E"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M 28 32 L 33 19 L 42 28 Z" fill="url(#lumi-ear-inner)" />
          {/* Fluffy Ear Tuft */}
          <path d="M 29 33 Q 34 26 38 31" stroke="#FFFDF9" strokeWidth="1.6" fill="none" strokeLinecap="round" />

          {/* Right Ear */}
          <path
            d="M 108 38 L 100 12 L 82 28 Z"
            fill="url(#lumi-ear-outer)"
            stroke="#D0B59E"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M 102 32 L 97 19 L 88 28 Z" fill="url(#lumi-ear-inner)" />
          <path d="M 101 33 Q 96 26 92 31" stroke="#FFFDF9" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>

        {/* 4. Cute Rounded Cat Head */}
        <ellipse
          cx="65"
          cy="66"
          rx="38"
          ry="35"
          fill="url(#lumi-fur)"
          stroke="#D9BFAB"
          strokeWidth="1.8"
          filter="url(#lumi-shadow)"
        />

        {/* Rosy Peach Blush Cheeks */}
        <ellipse cx="32" cy="78" rx="11" ry="7" fill="#FF8FA3" opacity="0.32" />
        <ellipse cx="98" cy="78" rx="11" ry="7" fill="#FF8FA3" opacity="0.32" />

        {/* 5. Big Expressive Anime / Pixar Eyes */}
        {showEyes && (
          <g>
            {isSleepy ? (
              // Serene Sleepy Eyelashes
              <g stroke="#2B2A33" strokeWidth="2.4" strokeLinecap="round" fill="none">
                <path d="M 36 65 Q 46 72 56 65" />
                <path d="M 74 65 Q 84 72 94 65" />
              </g>
            ) : isCelebrate ? (
              // Joyful Crescent Arcs
              <g stroke="#2B2A33" strokeWidth="2.8" strokeLinecap="round" fill="none">
                <path d="M 36 67 Q 46 56 56 67" />
                <path d="M 74 67 Q 84 56 94 67" />
              </g>
            ) : (
              // Open Anime Eyes with Dynamic Look & Blink
              <g>
                {/* Eye Whites */}
                <ellipse
                  cx="46"
                  cy="62"
                  rx="14"
                  ry={blink ? 1.5 : 16}
                  fill="#FFFFFF"
                  stroke="#D9BFAB"
                  strokeWidth="1.2"
                />
                <ellipse
                  cx="84"
                  cy="62"
                  rx="14"
                  ry={blink ? 1.5 : 16}
                  fill="#FFFFFF"
                  stroke="#D9BFAB"
                  strokeWidth="1.2"
                />

                {!blink && (
                  <>
                    {/* Deep Obsidian Irises */}
                    <circle
                      cx={46 + eyeOffset.x}
                      cy={62 + eyeOffset.y + (isThinking ? -3 : 0)}
                      r="8.2"
                      fill="#2B2A33"
                    />
                    <circle
                      cx={84 + eyeOffset.x}
                      cy={62 + eyeOffset.y + (isThinking ? -3 : 0)}
                      r="8.2"
                      fill="#2B2A33"
                    />

                    {/* Amber Iris Fringe Glow */}
                    <circle
                      cx={46 + eyeOffset.x}
                      cy={64 + eyeOffset.y}
                      r="4.2"
                      fill="#E8A33D"
                      opacity="0.4"
                    />
                    <circle
                      cx={84 + eyeOffset.x}
                      cy={64 + eyeOffset.y}
                      r="4.2"
                      fill="#E8A33D"
                      opacity="0.4"
                    />

                    {/* Primary Star Sparkle Highlight */}
                    <ellipse
                      cx={48.5 + eyeOffset.x}
                      cy={59 + eyeOffset.y}
                      rx="3.2"
                      ry="2.8"
                      fill="#FFFFFF"
                    />
                    <ellipse
                      cx={86.5 + eyeOffset.x}
                      cy={59 + eyeOffset.y}
                      rx="3.2"
                      ry="2.8"
                      fill="#FFFFFF"
                    />

                    {/* Secondary Mini Twinkle */}
                    <circle
                      cx={43 + eyeOffset.x}
                      cy={65 + eyeOffset.y}
                      r="1.4"
                      fill="#FFFFFF"
                      opacity="0.8"
                    />
                    <circle
                      cx={81 + eyeOffset.x}
                      cy={65 + eyeOffset.y}
                      r="1.4"
                      fill="#FFFFFF"
                      opacity="0.8"
                    />
                  </>
                )}

                {/* Eyebrows */}
                <path
                  d={
                    isThinking
                      ? 'M 36 44 Q 46 38 56 46'
                      : isEncouraging
                      ? 'M 36 46 Q 46 42 56 46'
                      : 'M 36 46 Q 46 44 56 47'
                  }
                  stroke="#9E8D7F"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={
                    isThinking
                      ? 'M 74 46 Q 84 40 94 43'
                      : isEncouraging
                      ? 'M 74 46 Q 84 42 94 46'
                      : 'M 74 47 Q 84 44 94 46'
                  }
                  stroke="#9E8D7F"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}
          </g>
        )}

        {/* 6. Cute Cat Nose & Sweet Mouth (:3) */}
        <path d="M 62 72 L 68 72 L 65 76 Z" fill="#E66885" />
        <ellipse cx="65" cy="72.5" rx="2" ry="1" fill="#FFFFFF" opacity="0.45" />

        {isCelebrate ? (
          // Happy Open Smile with Pink Tongue
          <g>
            <path
              d="M 57 77 Q 65 88 73 77 Z"
              fill="#E66885"
              stroke="#2B2A33"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M 61 82 Q 65 80 69 82" stroke="#FF9FB2" strokeWidth="1.5" fill="none" />
          </g>
        ) : (
          // Sweet :3 Mouth Curve
          <path
            d="M 57 76 Q 61 79 65 76 Q 69 79 73 76"
            stroke="#2B2A33"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {/* 7. Whiskers */}
        <g stroke="#C4B09F" strokeWidth="1.2" strokeLinecap="round" opacity="0.9">
          <path d="M 30 73 Q 16 71 8 67" fill="none" />
          <path d="M 30 78 Q 14 78 6 78" fill="none" />
          <path d="M 30 83 Q 16 85 8 89" fill="none" />

          <path d="M 100 73 Q 114 71 122 67" fill="none" />
          <path d="M 100 78 Q 116 78 124 78" fill="none" />
          <path d="M 100 83 Q 114 85 122 89" fill="none" />
        </g>

        {/* 8. Glowing Magical Lantern Pendant */}
        <g style={{ transformOrigin: '65px 98px' }}>
          {/* Braided Cord */}
          <path d="M 46 95 Q 65 104 84 95" stroke="#C96442" strokeWidth="1.8" fill="none" />
          {/* Glowing Aura */}
          <circle cx="65" cy="102" r="12" fill="url(#lantern-glow)" />
          {/* Golden Lantern Frame */}
          <rect
            x="59"
            y="96"
            width="12"
            height="13"
            rx="3"
            fill="#FFD152"
            stroke="#C96442"
            strokeWidth="1.4"
          />
          {/* Glass Candle Core */}
          <ellipse cx="65" cy="102.5" rx="3.5" ry="4.5" fill="#FFFDF9" />
          <circle cx="65" cy="102" r="2" fill="#E8A33D" />
        </g>
      </motion.svg>
    </div>
  );
};

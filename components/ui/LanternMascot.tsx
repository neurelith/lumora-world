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
  size = 96,
  speechBubble,
  showEyes = true,
  className = '',
}) => {
  const [blink, setBlink] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Natural multi-frequency organic blinking loop
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      const delay = 2400 + Math.random() * 2200;
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        loop();
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // Eye tracking: pupils follow mouse/wand cursor smoothly
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
        x: Math.max(-3.5, Math.min(3.5, dx * 3.5)),
        y: Math.max(-2.5, Math.min(2.5, dy * 2.5)),
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
      style={{ width: size, height: size * 1.18 }}
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
            style={{ bottom: 'calc(100% + 14px)', width: 'max-content', maxWidth: 280 }}
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
          {[...Array(8)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-xs"
              style={{ left: `${10 + i * 12}%`, top: -6 }}
              animate={{ y: [0, -26, 4], rotate: [0, 28, -20], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, delay: i * 0.07, repeat: Infinity, repeatDelay: 1.0 }}
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

      {/* Master Studio-Quality Hand-Crafted Lumi Character */}
      <motion.svg
        viewBox="0 0 140 156"
        className="w-full h-full block overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Lumi the mascot, feeling ${mood}`}
        animate={
          isCelebrate
            ? { y: [0, -8, 0], rotate: [0, -3, 3, 0] }
            : isSleepy
            ? { y: [0, 2, 0], scaleY: [1, 0.97, 1] }
            : isThinking
            ? { rotate: [-2, 2, -2], y: [0, -2, 0] }
            : { y: [0, -3, 0] }
        }
        transition={{
          duration: isCelebrate ? 0.55 : isSleepy ? 3.2 : 2.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <defs>
          {/* 3D Fur Shading: Soft Cream to Warm Butterscotch */}
          <radialGradient id="lumi-head-grad" cx="48%" cy="36%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FFFDF7" />
            <stop offset="78%" stopColor="#F7EADB" />
            <stop offset="100%" stopColor="#E6CFB8" />
          </radialGradient>

          {/* Chubby Body Fur */}
          <radialGradient id="lumi-body-grad" cx="50%" cy="42%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F9EFE2" />
            <stop offset="100%" stopColor="#E2C9AF" />
          </radialGradient>

          {/* Ear Outer Butterscotch */}
          <linearGradient id="lumi-ear-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5DEC8" />
            <stop offset="60%" stopColor="#E2C4A8" />
            <stop offset="100%" stopColor="#C9A689" />
          </linearGradient>

          {/* Ear Inner Soft Peach/Rose */}
          <radialGradient id="lumi-ear-inner" cx="50%" cy="60%" r="65%">
            <stop offset="0%" stopColor="#FFA6B8" />
            <stop offset="65%" stopColor="#F07994" />
            <stop offset="100%" stopColor="#D45070" />
          </radialGradient>

          {/* Anime Eye Gradient (Obsidian to Warm Honey Amber) */}
          <radialGradient id="lumi-iris" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#362E2B" />
            <stop offset="65%" stopColor="#251E1C" />
            <stop offset="88%" stopColor="#D9822B" />
            <stop offset="100%" stopColor="#8A4610" />
          </radialGradient>

          {/* Golden Lantern Pendant Radial Glow */}
          <radialGradient id="lantern-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF4B8" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FFD24D" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#E8A33D" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C96442" stopOpacity="0" />
          </radialGradient>

          {/* Soft Ground / Body Drop Shadow */}
          <filter id="lumi-shadow" x="-30%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="0" dy="7" stdDeviation="6.5" floodColor="#2B2A33" floodOpacity="0.14" />
          </filter>
        </defs>

        {/* 1. Fluffy S-Curve Tail with Butterscotch Tip */}
        <motion.g
          style={{ transformOrigin: '105px 115px' }}
          animate={{ rotate: isCelebrate ? [-8, 14, -8] : [-4, 6, -4] }}
          transition={{ duration: isCelebrate ? 0.7 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Main Tail */}
          <path
            d="M 98 112 C 118 108 132 86 122 64 C 117 53 108 53 106 62 C 114 78 112 96 95 106 Z"
            fill="#E6CFB8"
            stroke="#C9A689"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Fluffy Tail Tip Highlight */}
          <path
            d="M 112 68 C 119 62 121 54 117 50 C 114 47 109 49 108 56"
            fill="#FFFFFF"
            opacity="0.8"
          />
        </motion.g>

        {/* 2. Chubby Marshmallow Body */}
        <path
          d="M 38 102 C 28 116 32 136 50 142 C 64 146 76 146 90 142 C 108 136 112 116 102 102 C 92 88 48 88 38 102 Z"
          fill="url(#lumi-body-grad)"
          stroke="#D4BA9F"
          strokeWidth="1.8"
          filter="url(#lumi-shadow)"
        />

        {/* Soft White Chest Belly Patch */}
        <ellipse cx="70" cy="120" rx="26" ry="20" fill="#FFFFFF" opacity="0.88" />

        {/* 3. Cute Paws with Pink Toe Beans */}
        {/* Left Paw */}
        <g>
          <ellipse cx="46" cy="140" rx="12" ry="8" fill="#FFFDF7" stroke="#D4BA9F" strokeWidth="1.4" />
          <circle cx="43" cy="139" r="1.6" fill="#F07994" opacity="0.75" />
          <circle cx="49" cy="139" r="1.6" fill="#F07994" opacity="0.75" />
          <ellipse cx="46" cy="142" rx="2.4" ry="1.8" fill="#F07994" opacity="0.75" />
        </g>
        {/* Right Paw */}
        <g>
          <ellipse cx="94" cy="140" rx="12" ry="8" fill="#FFFDF7" stroke="#D4BA9F" strokeWidth="1.4" />
          <circle cx="91" cy="139" r="1.6" fill="#F07994" opacity="0.75" />
          <circle cx="97" cy="139" r="1.6" fill="#F07994" opacity="0.75" />
          <ellipse cx="94" cy="142" rx="2.4" ry="1.8" fill="#F07994" opacity="0.75" />
        </g>

        {/* 4. Fluffy Pointed Anime Ears */}
        {/* Left Ear */}
        <g style={{ transformOrigin: '38px 42px' }}>
          <path
            d="M 24 46 C 18 34 26 12 36 8 C 44 20 48 30 52 40 Z"
            fill="url(#lumi-ear-grad)"
            stroke="#C9A689"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Inner Ear Soft Rose */}
          <path
            d="M 28 42 C 24 33 30 18 35 15 C 40 23 44 32 46 38 Z"
            fill="url(#lumi-ear-inner)"
          />
          {/* Fluffy Ear Base Tuft */}
          <path
            d="M 32 44 Q 38 36 42 41"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Right Ear */}
        <g style={{ transformOrigin: '102px 42px' }}>
          <path
            d="M 116 46 C 122 34 114 12 104 8 C 96 20 92 30 88 40 Z"
            fill="url(#lumi-ear-grad)"
            stroke="#C9A689"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Inner Ear Soft Rose */}
          <path
            d="M 112 42 C 116 33 110 18 105 15 C 100 23 96 32 94 38 Z"
            fill="url(#lumi-ear-inner)"
          />
          {/* Fluffy Ear Base Tuft */}
          <path
            d="M 108 44 Q 102 36 98 41"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* 5. Chibi Cat Head with Chubby Cheek Fur Wings */}
        <path
          d="M 36 48 C 48 34 92 34 104 48 C 116 60 126 72 120 86 C 116 96 104 102 88 105 C 78 106 62 106 52 105 C 36 102 24 96 20 86 C 14 72 24 60 36 48 Z"
          fill="url(#lumi-head-grad)"
          stroke="#D4BA9F"
          strokeWidth="1.8"
          filter="url(#lumi-shadow)"
        />

        {/* Left Cheek Fur Tufts */}
        <path d="M 22 78 C 14 80 16 86 22 88" fill="#FFFDF7" stroke="#D4BA9F" strokeWidth="1.4" />
        <path d="M 23 85 C 16 88 18 93 24 94" fill="#FFFDF7" stroke="#D4BA9F" strokeWidth="1.4" />

        {/* Right Cheek Fur Tufts */}
        <path d="M 118 78 C 126 80 124 86 118 88" fill="#FFFDF7" stroke="#D4BA9F" strokeWidth="1.4" />
        <path d="M 117 85 C 124 88 122 93 116 94" fill="#FFFDF7" stroke="#D4BA9F" strokeWidth="1.4" />

        {/* Rosy Peach Blush Cheeks */}
        <ellipse cx="38" cy="84" rx="11" ry="6.5" fill="#FF8FA3" opacity="0.36" />
        <ellipse cx="102" cy="84" rx="11" ry="6.5" fill="#FF8FA3" opacity="0.36" />

        {/* 6. Big Expressive Pixar Anime Eyes */}
        {showEyes && (
          <g>
            {isSleepy ? (
              // Serene Sleepy Eyelash Curves
              <g stroke="#2B2A33" strokeWidth="2.6" strokeLinecap="round" fill="none">
                <path d="M 42 70 Q 52 78 62 70" />
                <path d="M 78 70 Q 88 78 98 70" />
              </g>
            ) : isCelebrate ? (
              // Joyful Crescent Happy Eyes (^ ^)
              <g stroke="#2B2A33" strokeWidth="3.0" strokeLinecap="round" fill="none">
                <path d="M 40 72 Q 52 60 64 72" />
                <path d="M 76 72 Q 88 60 100 72" />
              </g>
            ) : (
              // Open Anime Eyes with Dual Star Catchlights & Pupil Tracking
              <g>
                {/* Eye Whites */}
                <ellipse
                  cx="52"
                  cy="67"
                  rx="15"
                  ry={blink ? 1.8 : 17}
                  fill="#FFFFFF"
                  stroke="#D4BA9F"
                  strokeWidth="1.2"
                />
                <ellipse
                  cx="88"
                  cy="67"
                  rx="15"
                  ry={blink ? 1.8 : 17}
                  fill="#FFFFFF"
                  stroke="#D4BA9F"
                  strokeWidth="1.2"
                />

                {!blink && (
                  <>
                    {/* Deep Obsidian Iris with Honey Amber Base */}
                    <circle
                      cx={52 + eyeOffset.x}
                      cy={67 + eyeOffset.y + (isThinking ? -3 : 0)}
                      r="9.5"
                      fill="url(#lumi-iris)"
                    />
                    <circle
                      cx={88 + eyeOffset.x}
                      cy={67 + eyeOffset.y + (isThinking ? -3 : 0)}
                      r="9.5"
                      fill="url(#lumi-iris)"
                    />

                    {/* Warm Honey Amber Crescent Glow in Iris Bottom */}
                    <path
                      d={`M ${45 + eyeOffset.x} ${70 + eyeOffset.y} Q ${52 + eyeOffset.x} ${76 + eyeOffset.y} ${59 + eyeOffset.x} ${70 + eyeOffset.y}`}
                      stroke="#FFB03B"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.85"
                    />
                    <path
                      d={`M ${81 + eyeOffset.x} ${70 + eyeOffset.y} Q ${88 + eyeOffset.x} ${76 + eyeOffset.y} ${95 + eyeOffset.x} ${70 + eyeOffset.y}`}
                      stroke="#FFB03B"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.85"
                    />

                    {/* Primary Big Glossy Oval Catchlight */}
                    <ellipse
                      cx={55 + eyeOffset.x}
                      cy={63 + eyeOffset.y}
                      rx="3.8"
                      ry="3.2"
                      fill="#FFFFFF"
                    />
                    <ellipse
                      cx={91 + eyeOffset.x}
                      cy={63 + eyeOffset.y}
                      rx="3.8"
                      ry="3.2"
                      fill="#FFFFFF"
                    />

                    {/* Secondary Mini Star Sparkle Catchlight */}
                    <circle
                      cx={48 + eyeOffset.x}
                      cy={71 + eyeOffset.y}
                      r="1.7"
                      fill="#FFFFFF"
                      opacity="0.9"
                    />
                    <circle
                      cx={84 + eyeOffset.x}
                      cy={71 + eyeOffset.y}
                      r="1.7"
                      fill="#FFFFFF"
                      opacity="0.9"
                    />
                  </>
                )}

                {/* Expressive Eyebrows */}
                <path
                  d={
                    isThinking
                      ? 'M 42 47 Q 52 40 62 48'
                      : isEncouraging
                      ? 'M 42 49 Q 52 44 62 49'
                      : 'M 42 49 Q 52 46 62 50'
                  }
                  stroke="#8C7665"
                  strokeWidth="2.0"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={
                    isThinking
                      ? 'M 78 49 Q 88 43 98 46'
                      : isEncouraging
                      ? 'M 78 49 Q 88 44 98 49'
                      : 'M 78 50 Q 88 46 98 49'
                  }
                  stroke="#8C7665"
                  strokeWidth="2.0"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}
          </g>
        )}

        {/* 7. Cute Tiny Pink Heart Nose */}
        <path d="M 66 76 L 74 76 L 70 80.5 Z" fill="#F07994" />
        <ellipse cx="70" cy="76.5" rx="2.2" ry="1.1" fill="#FFFFFF" opacity="0.6" />

        {/* 8. Feline Mouth (:3) */}
        {isCelebrate ? (
          // Happy Open Laughing Smile with Pink Tongue
          <g>
            <path
              d="M 61 81 Q 70 94 79 81 Z"
              fill="#E6587A"
              stroke="#2B2A33"
              strokeWidth="2.0"
              strokeLinejoin="round"
            />
            <ellipse cx="70" cy="87" rx="4.5" ry="3" fill="#FFA6B8" />
          </g>
        ) : (
          // Sweet :3 Kitten Smile
          <path
            d="M 61 80 Q 65.5 84 70 80 Q 74.5 84 79 80"
            stroke="#2B2A33"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {/* 9. Soft Organic Curved Whiskers */}
        <g stroke="#BFA895" strokeWidth="1.3" strokeLinecap="round" opacity="0.92">
          {/* Left Whiskers */}
          <path d="M 36 78 Q 20 76 10 72" fill="none" />
          <path d="M 36 84 Q 18 84 8 84" fill="none" />
          <path d="M 36 90 Q 20 92 12 96" fill="none" />

          {/* Right Whiskers */}
          <path d="M 104 78 Q 120 76 130 72" fill="none" />
          <path d="M 104 84 Q 122 84 132 84" fill="none" />
          <path d="M 104 90 Q 120 92 128 96" fill="none" />
        </g>

        {/* 10. The Iconic Lumora Golden Lantern Necklace */}
        <g style={{ transformOrigin: '70px 105px' }}>
          {/* Braided Cord */}
          <path d="M 48 100 Q 70 110 92 100" stroke="#C96442" strokeWidth="2.2" fill="none" strokeLinecap="round" />

          {/* Warm Amber Glowing Halo */}
          <circle cx="70" cy="108" r="16" fill="url(#lantern-aura)" />

          {/* Golden Lantern Pendant Frame */}
          <rect
            x="63"
            y="100"
            width="14"
            height="16"
            rx="3.5"
            fill="#FFD24D"
            stroke="#C96442"
            strokeWidth="1.6"
          />
          {/* Top Ring */}
          <circle cx="70" cy="99" r="2.5" fill="none" stroke="#C96442" strokeWidth="1.4" />

          {/* Candle Light Core */}
          <ellipse cx="70" cy="108" rx="4" ry="5.5" fill="#FFFFFF" />
          <circle cx="70" cy="108" r="2.5" fill="#E8A33D" />
        </g>
      </motion.svg>
    </div>
  );
};

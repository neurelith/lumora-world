'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LanternMascot, MascotMood } from '@/components/ui/LanternMascot';
import { Sparkles, Wand2, Volume2, Brain, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface InteractiveDyutiCompanionProps {
  isAirWandActive?: boolean;
  onToggleAirWand?: () => void;
}

export type InteractiveLumiCompanionProps = InteractiveDyutiCompanionProps;

export const InteractiveDyutiCompanion: React.FC<InteractiveDyutiCompanionProps> = ({
  isAirWandActive = false,
  onToggleAirWand,
}) => {
  const [mood, setMood] = useState<MascotMood>(isAirWandActive ? 'celebrating' : 'encouraging');
  const [speechText, setSpeechText] = useState(
    isAirWandActive ? 'Magic wand active! Wave your finger in the air! 🪄' : 'Wave your hand or tap me!'
  );
  const [interactCount, setInteractCount] = useState(0);

  // Sync air wand activation state
  React.useEffect(() => {
    if (isAirWandActive) {
      setMood('celebrating');
      setSpeechText('I see your hand! Wave your finger to draw in the air! 🪄✨');
    }
  }, [isAirWandActive]);

  const funPhrases = [
    'Yay! Let\'s go on an adventure! ⭐',
    'I love when you wave at me! ✨',
    'Ready to paint letters in the air? 🪄',
    'You are going to do great! 🌟',
    'Listen closely to the forest sounds! 🌲',
  ];

  const handleDyutiClick = () => {
    const nextCount = interactCount + 1;
    setInteractCount(nextCount);
    setMood('celebrating');
    const phrase = funPhrases[nextCount % funPhrases.length];
    setSpeechText(phrase);

    setTimeout(() => {
      setMood(isAirWandActive ? 'celebrating' : 'encouraging');
    }, 2200);
  };

  const handleWorldHover = (hoverMood: MascotMood, text: string) => {
    setMood(hoverMood);
    setSpeechText(text);
  };

  const handleWorldLeave = () => {
    setMood(isAirWandActive ? 'celebrating' : 'encouraging');
    setSpeechText(
      isAirWandActive ? 'Magic wand active! Wave your finger in the air! 🪄' : 'Wave your hand or tap me!'
    );
  };

  return (
    <div className="relative w-full max-w-[420px] flex flex-col items-center select-none py-2 transition-all">
      {/* 1. Organic Ambient Aura Glow (Cardless Background) */}
      <div className="absolute inset-0 -top-6 bg-gradient-to-b from-amber-200/35 via-orange-100/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 2. Top Quick Badges (Smooth Hovering & Floating Animation) */}
      <div className="w-full flex items-center justify-between gap-3 px-2 mb-2">
        <motion.div
          animate={{ y: [0, -3.5, 0] }}
          transition={{ duration: 4.0, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-amber-200/80 text-[11px] font-display font-extrabold text-amber-900 shadow-soft-xs hover:scale-105 transition-transform">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>15 Min Check</span>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 3.5, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          {onToggleAirWand ? (
            <button
              type="button"
              onClick={onToggleAirWand}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-display font-extrabold transition-all cursor-pointer shadow-soft-xs active:scale-95 hover:scale-105 ${
                isAirWandActive
                  ? 'bg-cyan-500 text-white ring-2 ring-cyan-300 shadow-candy-cyan'
                  : 'bg-white/90 backdrop-blur-md border border-cyan-200 text-cyan-900 hover:bg-cyan-50'
              }`}
            >
              <Wand2 className={`w-3.5 h-3.5 ${isAirWandActive ? 'text-white animate-spin' : 'text-cyan-600'}`} />
              <span>{isAirWandActive ? 'Air Wand Active ✨' : 'Magic Air Wand'}</span>
            </button>
          ) : (
            <Link
              href="/screening/rune-realm"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-cyan-200 text-[11px] font-display font-extrabold text-cyan-900 shadow-soft-xs hover:bg-cyan-50 hover:scale-105 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Magic Air Wand</span>
            </Link>
          )}
        </motion.div>
      </div>

      {/* 3. Mascot Centerpiece (Living & Cardless) */}
      <div
        onClick={handleDyutiClick}
        className="relative cursor-pointer group flex flex-col items-center pt-8 pb-2 w-full"
        title="Tap Dyuti to interact!"
      >
        {/* Soft Grounding Pedestal Shadow */}
        <div className="absolute bottom-2 w-48 h-7 bg-amber-900/10 rounded-full blur-md" />

        {/* Living Mascot Character (Bigger & Expressive with subtle hover spring) */}
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="relative z-10"
        >
          <LanternMascot
            mood={mood}
            size={185}
            speechBubble={speechText}
          />
        </motion.div>

        {/* Micro-Hint Pill with gentle 50% breathing pulse & subtle floating bob */}
        <motion.div
          animate={{ y: [0, -2.5, 0], opacity: [1, 0.55, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-black/[0.06] text-[11px] font-display font-semibold text-ink/75 hover:text-amber-950 hover:border-amber-300 hover:bg-amber-50/90 transition-all shadow-soft-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>Wave hand or tap Dyuti &middot; Eyes follow your cursor</span>
        </motion.div>
      </div>

      {/* 4. Lightweight Activities Strip (Smooth Complementary Float) */}
      <div className="w-full grid grid-cols-2 gap-2.5 mt-3 px-1">
        <motion.div
          animate={{ y: [0, 2.5, 0] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          <Link
            href="/screening/sound-forest"
            onMouseEnter={() => handleWorldHover('encouraging', 'Sound Forest checks voice blending! 🌲')}
            onMouseLeave={handleWorldLeave}
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/85 backdrop-blur-md border border-emerald-200/80 hover:bg-emerald-50 text-emerald-950 text-xs font-display font-bold transition-all shadow-soft-xs hover:scale-[1.03] hover:shadow-soft-sm"
          >
            <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Sound Forest</span>
          </Link>
        </motion.div>

        <motion.div
          animate={{ y: [0, -2.5, 0] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
        >
          <Link
            href="/screening/memory-mountains"
            onMouseEnter={() => handleWorldHover('thinking', 'Memory Mountains tests rapid naming! 🏔️')}
            onMouseLeave={handleWorldLeave}
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/85 backdrop-blur-md border border-orange-200/80 hover:bg-orange-50 text-orange-950 text-xs font-display font-bold transition-all shadow-soft-xs hover:scale-[1.03] hover:shadow-soft-sm"
          >
            <Brain className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="truncate">Memory Jewels</span>
          </Link>
        </motion.div>
      </div>

      {/* 5. Clean Launch Action Button */}
      <div className="w-full mt-3 px-1">
        <Link
          href="/screening"
          className="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-soft-sm text-xs font-display font-bold flex items-center justify-between transition-all group hover:shadow-soft-md"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Explore all 5 activities with Dyuti</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/90 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export const InteractiveLumiCompanion = InteractiveDyutiCompanion;

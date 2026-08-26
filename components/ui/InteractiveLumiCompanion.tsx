'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LanternMascot, MascotMood } from '@/components/ui/LanternMascot';
import { Sparkles, Wand2, Volume2, Brain, ArrowRight, Star, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleBadgeHover = (hoverMood: MascotMood, text: string) => {
    setMood(hoverMood);
    setSpeechText(text);
  };

  const handleBadgeLeave = () => {
    setMood(isAirWandActive ? 'celebrating' : 'encouraging');
    setSpeechText(
      isAirWandActive ? 'Magic wand active! Wave your finger in the air! 🪄' : 'Wave your hand or tap me!'
    );
  };

  return (
    <div className="relative w-full max-w-[420px] flex flex-col items-center select-none py-4">
      {/* Ambient Glowing Aura */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-200/40 via-orange-100/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating Orbital Badges that interact with Dyuti */}
      
      {/* Top Left Float: Quick Time Badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        onMouseEnter={() => handleBadgeHover('thinking', 'Just 15 minutes of gentle play!')}
        onMouseLeave={handleBadgeLeave}
        className="absolute -top-2 -left-2 sm:-left-4 z-20"
      >
        <div className="px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-b-4 border-amber-200 shadow-md flex items-center gap-1.5 text-xs font-display font-extrabold text-amber-950 cursor-pointer hover:scale-105 transition-transform">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>15 Min Check</span>
        </div>
      </motion.div>

      {/* Top Right Float: Wand Realm (Interactive live wand trigger!) */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4.0, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        onMouseEnter={() => handleBadgeHover('celebrating', 'Click to test Magic Air Wand finger tracking!')}
        onMouseLeave={handleBadgeLeave}
        className="absolute -top-1 -right-2 sm:-right-4 z-20"
      >
        {onToggleAirWand ? (
          <button
            type="button"
            onClick={onToggleAirWand}
            className={`px-3.5 py-1.5 rounded-2xl backdrop-blur-md border-2 border-b-4 shadow-md flex items-center gap-1.5 text-xs font-display font-extrabold cursor-pointer transition-all hover:scale-105 ${
              isAirWandActive
                ? 'bg-cyan-500 text-white border-cyan-300 ring-2 ring-cyan-400 shadow-candy-cyan'
                : 'bg-white/95 border-cyan-200 text-cyan-950 hover:border-cyan-400'
            }`}
          >
            <Wand2 className={`w-3.5 h-3.5 ${isAirWandActive ? 'text-white animate-spin' : 'text-cyan-600'}`} />
            <span>{isAirWandActive ? 'Air Wand Active ✨' : 'Magic Air Wand'}</span>
          </button>
        ) : (
          <Link href="/screening/rune-realm">
            <div className="px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-b-4 border-cyan-200 shadow-md flex items-center gap-1.5 text-xs font-display font-extrabold text-cyan-950 cursor-pointer hover:border-cyan-400 hover:scale-105 transition-all">
              <Wand2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Magic Air Wand</span>
            </div>
          </Link>
        )}
      </motion.div>

      {/* Bottom Left Float: Sound Forest */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.0 }}
        onMouseEnter={() => handleBadgeHover('encouraging', 'Sound Forest checks voice blending!')}
        onMouseLeave={handleBadgeLeave}
        className="absolute bottom-16 -left-2 sm:-left-6 z-20"
      >
        <Link href="/screening/sound-forest">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-b-4 border-emerald-200 shadow-md flex items-center gap-1.5 text-xs font-display font-extrabold text-emerald-950 cursor-pointer hover:border-emerald-400 hover:scale-105 transition-all">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sound Forest</span>
          </div>
        </Link>
      </motion.div>

      {/* Bottom Right Float: Memory Mountains */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        onMouseEnter={() => handleBadgeHover('thinking', 'Memory Mountains tests rapid naming!')}
        onMouseLeave={handleBadgeLeave}
        className="absolute bottom-14 -right-2 sm:-right-6 z-20"
      >
        <Link href="/screening/memory-mountains">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-b-4 border-orange-200 shadow-md flex items-center gap-1.5 text-xs font-display font-extrabold text-orange-950 cursor-pointer hover:border-orange-400 hover:scale-105 transition-all">
            <Brain className="w-3.5 h-3.5 text-orange-600" />
            <span>Memory Jewels</span>
          </div>
        </Link>
      </motion.div>

      {/* Mascot Centerpiece (Living & Clickable) */}
      <div
        onClick={handleDyutiClick}
        className="relative cursor-pointer group flex flex-col items-center pt-8 pb-4"
        title="Tap Dyuti!"
      >
        {/* Soft Pedestal Shadow */}
        <div className="absolute bottom-4 w-40 h-8 bg-amber-900/10 rounded-full blur-md" />

        {/* Mascot Character */}
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="relative z-10"
        >
          <LanternMascot
            mood={mood}
            size={140}
            speechBubble={speechText}
          />
        </motion.div>

        {/* Tap Prompt Badge below Dyuti */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-xs text-[11px] font-display font-extrabold text-ink/70 group-hover:text-amber-800 group-hover:border-amber-300 transition-colors">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Tap Dyuti to play &middot; Eyes follow your cursor &amp; air wand</span>
        </div>
      </div>

      {/* Seamless Hero Launch Strip */}
      <div className="w-full pt-2 flex items-center justify-center">
        <Link
          href="/screening"
          className="w-full py-3 px-5 rounded-2xl bg-white border-2 border-b-4 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 shadow-soft-xs text-xs font-display font-extrabold text-ink flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Explore all 5 activities with Dyuti</span>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-600 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export const InteractiveLumiCompanion = InteractiveDyutiCompanion;


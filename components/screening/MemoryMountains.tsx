'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { Grid, Brain, Play, Square, CheckCircle2 } from 'lucide-react';
import { generateMemoryMountainsGrid, RANItem } from '@/lib/challenge-generator';
import { UniversalAirWand } from '@/components/ui/UniversalAirWand';
import { MemoryMountainsResult, Language } from '@/lib/types';
import { classifyMemoryMountains } from '@/lib/scoring';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryMountainsProps {
  grade: number;
  language: Language;
  onComplete: (result: MemoryMountainsResult) => void;
}

function ShapeIcon({ shape, color }: { shape: RANItem['shape']; color: RANItem['color'] }) {
  const bg: Record<RANItem['color'], string> = {
    amber: 'bg-amber',
    sage: 'bg-forest',
    terracotta: 'bg-terracotta',
    indigo: 'bg-castle',
    rose: 'bg-pink-500',
    ink: 'bg-ink',
  };
  const fill: Record<RANItem['color'], string> = {
    amber: 'text-amber fill-amber',
    sage: 'text-forest fill-forest',
    terracotta: 'text-terracotta fill-terracotta',
    indigo: 'text-castle fill-castle',
    rose: 'text-pink-500 fill-pink-500',
    ink: 'text-ink fill-ink',
  };
  if (shape === 'circle') return <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full ${bg[color] || 'bg-amber'}`} />;
  if (shape === 'square') return <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg ${bg[color] || 'bg-forest'}`} />;
  if (shape === 'triangle') return <svg className={`w-7 h-7 md:w-8 md:h-8 ${fill[color] || 'text-terracotta'}`} viewBox="0 0 24 24"><polygon points="12,2 22,22 2,22" /></svg>;
  if (shape === 'star') return <svg className={`w-7 h-7 md:w-8 md:h-8 ${fill[color] || 'text-amber'}`} viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" /></svg>;
  return <svg className={`w-7 h-7 md:w-8 md:h-8 ${fill[color] || 'text-castle'}`} viewBox="0 0 24 24"><polygon points="12,2 22,12 12,22 2,12" /></svg>;
}

export const MemoryMountains: React.FC<MemoryMountainsProps> = ({ grade, language, onComplete }) => {
  const { t } = useTranslation();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [gridItems, setGridItems] = useState<RANItem[]>(() => generateMemoryMountainsGrid(25));
  const [hasStarted, setHasStarted] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [itemsNamed, setItemsNamed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    setGridItems(generateMemoryMountainsGrid(25));
  }, []);

  const handleStart = () => {
    setIsTimerRunning(true);
    setHasStarted(true);
    setItemsNamed(0);
    startRef.current = performance.now();
    timerRef.current = setInterval(() => setElapsedSec(Number(((performance.now() - startRef.current) / 1000).toFixed(1))), 100);
    countRef.current = setInterval(() => setItemsNamed((p) => Math.min(p + 1, 25)), 220);
  };

  const handleStop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countRef.current) clearInterval(countRef.current);
    setIsTimerRunning(false);
    setHasFinished(true);
    const totalDuration = Math.max(1, elapsedSec);
    const ranRate = Number((25 / totalDuration).toFixed(2));
    const errorCount = gridItems.filter((i) => i.isFlaggedError).length;
    const triage = classifyMemoryMountains(ranRate, errorCount, grade);
    setTimeout(() => onComplete({ totalItems: 25, durationSec: totalDuration, ranRate, errorCount, hesitationGapsCount: 0, triage }), 1100);
  };

  const toggleFlag = (id: number) => {
    if (!isTimerRunning && !hasStarted) return;
    setGridItems((prev) => prev.map((it) => (it.id === id ? { ...it, isFlaggedError: !it.isFlaggedError } : it)));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-world-mountains p-3 sm:p-4 rounded-3xl max-w-5xl mx-auto space-y-4">
      {/* Top Game Bar */}
      <div className="flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md border-2 border-orange-200 rounded-3xl p-4 shadow-candy-coral">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl shadow-soft-xs">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl md:text-2xl text-ink">
              {t('worlds.memoryMountains')}
            </h2>
            <p className="text-xs font-body text-orange-800 font-medium hidden sm:block">
              {t('worlds.memoryMountainsSubtitle')} &middot; Rapid Automatized Naming
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-candy-amber">
          <span className="text-[10px] font-display font-extrabold uppercase tracking-wider">Time:</span>
          <span className="font-display font-extrabold text-2xl font-mono">{elapsedSec.toFixed(1)}s</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px] items-stretch">
        <Card variant="mountains" className="p-4 sm:p-5 pt-8 flex flex-col items-center justify-between">
          <div className="flex flex-col items-center text-center space-y-4 w-full">
            <LanternMascot
              mood={isTimerRunning ? 'encouraging' : hasFinished ? 'celebrating' : 'neutral'}
              size={76}
              speechBubble={
                !hasStarted
                  ? language === 'hi' ? 'टीचर टाइमर शुरू करें!' : 'Teacher starts timer, child names left to right!'
                  : isTimerRunning
                  ? language === 'hi' ? 'जल्दी-जल्दी नाम बोलो!' : 'Name them as fast and clearly as you can!'
                  : 'Great naming speed!'
              }
            />

            <div className="grid grid-cols-5 gap-2.5 p-4 bg-white/95 border-2 border-orange-200 rounded-3xl shadow-soft-sm max-w-md mx-auto relative overflow-hidden w-full">
              {isTimerRunning && (
                <div className="absolute inset-0 bg-amber-500/10 pointer-events-none overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 transition-all duration-200 ease-out"
                    style={{ width: `${(itemsNamed / 25) * 100}%` }}
                  />
                </div>
              )}
              {gridItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  onClick={() => toggleFlag(item.id)}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 select-none shadow-soft-xs ${
                    item.isFlaggedError
                      ? 'bg-rose-100 border-rose-400 ring-4 ring-rose-300 scale-95'
                      : 'bg-white border-orange-100 hover:border-orange-400 hover:scale-105'
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02, type: 'spring', stiffness: 300, damping: 25 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShapeIcon shape={item.shape} color={item.color} />
                  {item.isFlaggedError && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />}
                  {itemsNamed > idx && !item.isFlaggedError && <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {hasStarted && !isTimerRunning && !hasFinished && (
                <motion.div className="text-center p-3 bg-white/90 border border-emerald-300 rounded-2xl shadow-candy-emerald" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-sm font-display font-extrabold text-ink">{language === 'hi' ? 'बहुत बढ़िया!' : 'Great job!'}</p>
                  <p className="text-xs text-emerald-700 font-bold">{Math.round((25 / elapsedSec) * 100) / 100} items/sec</p>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-xs text-orange-900 font-medium">💡 {language === 'hi' ? 'टीचर: गलत पर टैप करें' : 'Teacher: Tap any item if the child stumbles.'}</p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              {!hasStarted ? (
                <Button
                  variant="mountains"
                  size="md"
                  onClick={handleStart}
                  leftIcon={<Play className="w-4 h-4 fill-white" />}
                  className="min-h-[48px] text-xs font-extrabold uppercase tracking-wider"
                >
                  {language === 'hi' ? 'टाइमर शुरू करें' : 'Start Rapid Naming'}
                </Button>
              ) : isTimerRunning ? (
                <Button
                  variant="terracotta"
                  size="md"
                  onClick={handleStop}
                  leftIcon={<Square className="w-4 h-4 fill-white" />}
                  className="min-h-[48px] text-xs font-extrabold uppercase tracking-wider"
                >
                  {language === 'hi' ? 'समाप्त' : 'Done / Stop Timer'}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-display font-extrabold text-base animate-pulse-gentle">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Recording Results...</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card variant="elevated" padding="md" className="bg-sand/50 border-whisper">
            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-mountains-soft text-mountains rounded-lg"><Grid className="w-5 h-5" /></div><h3 className="font-display font-semibold text-ink">How to Run</h3></div>
            <ol className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5"><span className="flex-shrink-0 w-5 h-5 bg-mountains text-white rounded-full flex items-center justify-center text-xs font-display font-bold">1</span><p className="text-ink-secondary">Teacher says &quot;Go!&quot; and starts timer</p></li>
              <li className="flex items-start gap-2.5"><span className="flex-shrink-0 w-5 h-5 bg-mountains text-white rounded-full flex items-center justify-center text-xs font-display font-bold">2</span><p className="text-ink-secondary">Child names left-to-right as fast as possible</p></li>
              <li className="flex items-start gap-2.5"><span className="flex-shrink-0 w-5 h-5 bg-mountains text-white rounded-full flex items-center justify-center text-xs font-display font-bold">3</span><p className="text-ink-secondary">Tap stumbled items to flag errors</p></li>
              <li className="flex items-start gap-2.5"><span className="flex-shrink-0 w-5 h-5 bg-mountains text-white rounded-full flex items-center justify-center text-xs font-display font-bold">4</span><p className="text-ink-secondary">Click Done when grid complete</p></li>
            </ol>
          </Card>
          {hasStarted && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card variant="default" padding="md" className="bg-white text-center">
                <p className="text-xs font-display font-bold uppercase tracking-wider text-ink-tertiary mb-2">Current Speed</p>
                <div className="text-4xl font-display font-extrabold text-mountains mb-1">{isTimerRunning ? `${Math.round((itemsNamed / Math.max(elapsedSec, 0.1)) * 100) / 100}` : '—'}<span className="text-sm text-ink-tertiary">/s</span></div>
                <p className="text-xs text-ink-tertiary">{itemsNamed}/25 items</p>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Universal Camera Air Gesture Wand */}
      <UniversalAirWand accentColor="#C96442" />
    </div>
  );
};

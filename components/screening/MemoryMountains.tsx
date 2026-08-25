'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { Grid, Brain, Play, Square, CheckCircle2 } from 'lucide-react';
import { MemoryMountainsResult, Language } from '@/lib/types';
import { classifyMemoryMountains } from '@/lib/scoring';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryMountainsProps {
  grade: number;
  language: Language;
  onComplete: (result: MemoryMountainsResult) => void;
}

interface GridItem {
  id: number;
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'diamond';
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  isFlaggedError?: boolean;
}

function ShapeIcon({ shape, color }: { shape: GridItem['shape']; color: GridItem['color'] }) {
  const bg: Record<GridItem['color'], string> = {
    red: 'bg-terracotta',
    blue: 'bg-castle',
    green: 'bg-forest',
    yellow: 'bg-amber',
    purple: 'bg-purple-600',
  };
  const fill: Record<GridItem['color'], string> = {
    red: 'text-terracotta fill-terracotta',
    blue: 'text-castle fill-castle',
    green: 'text-forest fill-forest',
    yellow: 'text-amber fill-amber',
    purple: 'text-purple-600 fill-purple-600',
  };
  if (shape === 'circle') return <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full ${bg[color]}`} />;
  if (shape === 'square') return <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg ${bg[color]}`} />;
  if (shape === 'triangle') return <svg className={`w-7 h-7 md:w-8 md:h-8 ${fill[color]}`} viewBox="0 0 24 24"><polygon points="12,2 22,22 2,22" /></svg>;
  if (shape === 'star') return <svg className={`w-7 h-7 md:w-8 md:h-8 ${fill[color]}`} viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" /></svg>;
  return <svg className={`w-7 h-7 md:w-8 md:h-8 ${fill[color]}`} viewBox="0 0 24 24"><polygon points="12,2 22,12 12,22 2,12" /></svg>;
}

export const MemoryMountains: React.FC<MemoryMountainsProps> = ({ grade, language, onComplete }) => {
  const { t } = useTranslation();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [itemsNamed, setItemsNamed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const shapes: GridItem['shape'][] = ['circle', 'square', 'triangle', 'star', 'diamond'];
    const colors: GridItem['color'][] = ['red', 'blue', 'green', 'yellow', 'purple'];
    const items: GridItem[] = [];
    let c = 0;
    for (let r = 0; r < 5; r++) for (let col = 0; col < 5; col++) items.push({ id: c++, shape: shapes[(r + col) % 5], color: colors[(r * 2 + col) % 5], isFlaggedError: false });
    setGridItems(items);
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
    <div className="max-w-5xl mx-auto space-y-3.5 animate-spring-in">
      <div className="flex items-center justify-between gap-3 bg-white border border-whisper rounded-2xl p-3 sm:p-4 shadow-card">
        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-2.5 bg-mountains-soft text-mountains rounded-xl">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-lg sm:text-xl text-ink leading-tight">{t('worlds.memoryMountains')}</h2>
            <p className="text-[11px] font-body text-ink-tertiary hidden sm:block">{t('worlds.memoryMountainsSubtitle')} &middot; Rapid Automatized Naming</p>
          </div>
        </div>
        <div className="bg-sand border border-amber/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-xs">
          <span className="text-[10px] font-display font-bold uppercase tracking-wider text-ink-tertiary">Time:</span>
          <span className="font-display font-extrabold text-xl sm:text-2xl text-ink font-mono">{elapsedSec.toFixed(1)}s</span>
        </div>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[1fr_300px] items-stretch">
        <Card className="bg-gradient-to-b from-mountains-soft/20 via-white to-ivory border border-mountains/20 p-4 sm:p-5 pt-8 shadow-card flex flex-col items-center justify-between">
          <div className="flex flex-col items-center text-center space-y-4 w-full">
            <LanternMascot mood={isTimerRunning ? 'encouraging' : hasFinished ? 'celebrating' : 'neutral'} size={76} speechBubble={!hasStarted ? (language === 'hi' ? 'टीचर टाइमर शुरू करें!' : 'Teacher starts timer, child names left to right!') : isTimerRunning ? (language === 'hi' ? 'जल्दी-जल्दी नाम बोलो!' : 'Name them as fast and clearly as you can!') : 'Great naming speed!'} />

            <div className="grid grid-cols-5 gap-2 p-3 bg-white border border-whisper rounded-2xl shadow-xs max-w-md mx-auto relative overflow-hidden w-full">
              {isTimerRunning && <div className="absolute inset-0 bg-amber/5 rounded-2xl pointer-events-none overflow-hidden"><div className="h-full bg-amber/10 transition-all duration-200 ease-out" style={{ width: `${(itemsNamed / 25) * 100}%` }} /></div>}
              {gridItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  onClick={() => toggleFlag(item.id)}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200 select-none ${item.isFlaggedError ? 'bg-terracotta-soft border-terracotta ring-2 ring-terracotta/40 scale-95' : 'bg-sand/60 border-whisper hover:border-amber/50 hover:bg-white hover:scale-105'}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02, type: 'spring', stiffness: 300, damping: 25 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShapeIcon shape={item.shape} color={item.color} />
                  {item.isFlaggedError && <span className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full animate-pulse-gentle" />}
                  {itemsNamed > idx && !item.isFlaggedError && <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-sage rounded-full" />}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {hasStarted && !isTimerRunning && !hasFinished && (
                <motion.div className="text-center p-2.5 bg-sand/50 rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <CheckCircle2 className="w-5 h-5 text-sage mx-auto mb-1" />
                  <p className="text-xs font-medium text-ink">{language === 'hi' ? 'बहुत बढ़िया!' : 'Great job!'}</p>
                  <p className="text-[11px] text-ink-tertiary">{Math.round((25 / elapsedSec) * 100) / 100} items/sec</p>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[11px] text-ink-tertiary">💡 {language === 'hi' ? 'टीचर: गलत पर टैप करें' : 'Teacher: Tap any item if the child stumbles.'}</p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              {!hasStarted ? (
                <Button variant="primary" size="md" onClick={handleStart} leftIcon={<Play className="w-4 h-4 fill-white" />} className="min-h-[44px] text-xs font-bold">{language === 'hi' ? 'टाइमर शुरू करें' : 'Start Rapid Naming'}</Button>
              ) : isTimerRunning ? (
                <Button variant="terracotta" size="md" onClick={handleStop} leftIcon={<Square className="w-4 h-4 fill-white" />} className="min-h-[44px] text-xs font-bold">{language === 'hi' ? 'समाप्त' : 'Done / Stop Timer'}</Button>
              ) : (
                <div className="flex items-center gap-2 text-sage font-display font-bold text-base animate-pulse-gentle"><CheckCircle2 className="w-5 h-5" /><span>Recording Results...</span></div>
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
    </div>
  );
};

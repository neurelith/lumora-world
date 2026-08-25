'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { HarmonicFlowCanvas, HarmonicPoint } from '@/components/ui/HarmonicFlowCanvas';
import { PenTool, Check, Sparkles, RotateCcw } from 'lucide-react';
import { generateRuneChallenges } from '@/lib/challenge-generator';
import { RuneTrial, RuneRealmResult, Language } from '@/lib/types';
import { analyzeStroke } from '@/lib/tracing';
import { classifyRuneRealm } from '@/lib/scoring';
import { motion, AnimatePresence } from 'framer-motion';

interface RuneRealmProps {
  grade: number;
  language: Language;
  onComplete: (result: RuneRealmResult) => void;
}

export const RuneRealm: React.FC<RuneRealmProps> = ({ grade, language, onComplete }) => {
  const { t } = useTranslation();
  const [lettersList] = useState<string[]>(() => generateRuneChallenges(language, grade, 6));

  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedTrials, setCompletedTrials] = useState<RuneTrial[]>([]);
  const [currentPoints, setCurrentPoints] = useState<HarmonicPoint[]>([]);
  const [mascotMood, setMascotMood] = useState<'neutral' | 'encouraging' | 'celebrating' | 'thinking'>('neutral');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [lastTrial, setLastTrial] = useState<RuneTrial | null>(null);

  const currentLetter = lettersList[currentIdx] || lettersList[0] || 'b';
  const progress = ((currentIdx + 1) / lettersList.length) * 100;

  useEffect(() => {
    setCurrentPoints([]);
    setMascotMood('neutral');
    setShowAnalysis(false);
  }, [currentIdx, language]);

  const handleStrokeUpdate = (points: HarmonicPoint[]) => {
    setCurrentPoints(points);
    if (points.length > 5) setMascotMood('encouraging');
  };

  const handleAutoStrokeFinish = (points: HarmonicPoint[]) => {
    if (showAnalysis || points.length < 3) return;
    const rawStrokePoints = points.map((p) => ({ x: p.x, y: p.y, t: p.t, pressure: p.pressure ?? 0.8 }));
    const trial = analyzeStroke(rawStrokePoints, currentLetter, language);
    setLastTrial(trial);
    setShowAnalysis(true);
    setMascotMood('celebrating');
    const nextTrials = [...completedTrials, trial];
    setCompletedTrials(nextTrials);

    setTimeout(() => {
      if (currentIdx < lettersList.length - 1) {
        setCurrentIdx((prev) => prev + 1);
        setCurrentPoints([]);
        setMascotMood('neutral');
      } else {
        const meanNvi = Number((nextTrials.reduce((a, tt) => a + tt.nvi, 0) / nextTrials.length).toFixed(1));
        const meanJerk = Number((nextTrials.reduce((a, tt) => a + tt.jerkIndex, 0) / nextTrials.length).toFixed(1));
        const meanDev = Number((nextTrials.reduce((a, tt) => a + tt.centerlineDev, 0) / nextTrials.length).toFixed(1));
        const mirrorCount = nextTrials.filter((tt) => tt.isMirrored).length;
        const triage = classifyRuneRealm(meanNvi, meanDev, mirrorCount, grade);
        onComplete({
          meanNvi,
          meanJerkIndex: meanJerk,
          meanDeviation: meanDev,
          mirrorReversalsCount: mirrorCount,
          triage,
          trials: nextTrials,
        });
      }
      setShowAnalysis(false);
    }, 850);
  };

  const handleNextRune = () => {
    if (currentPoints.length < 3) return;
    handleAutoStrokeFinish(currentPoints);
  };

  const handleRetry = () => {
    setCurrentPoints([]);
    setMascotMood('neutral');
    setShowAnalysis(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-world-realm p-3 sm:p-4 rounded-3xl max-w-5xl mx-auto space-y-4">
      {/* Top Bar: Title & Progress Bar */}
      <div className="flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md border-2 border-teal-200 rounded-3xl p-4 shadow-candy-cyan">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-candy-cyan">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-extrabold text-ink flex items-center gap-2">
              <span>{t('worlds.rune_realm.title')}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-display font-bold">
                Level {grade}
              </span>
            </h1>
            <p className="text-xs text-teal-800 font-body hidden sm:block font-medium">
              Kinematic Motor Planning &amp; Tracing &middot; Trace letter in air or on screen
            </p>
          </div>
        </div>

        <div className="w-36 sm:w-48 text-right">
          <div className="text-xs font-display font-bold text-teal-800 mb-1">
            Rune {currentIdx + 1} of {lettersList.length}
          </div>
          <ProgressBar progress={progress} color="realm" size="md" />
        </div>
      </div>

      {/* 2-Column Balanced Cockpit Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start max-w-5xl mx-auto">
        {/* Left Arena: Canvas & Action Buttons */}
        <Card variant="realm" className="flex flex-col items-center justify-center p-3.5 sm:p-4">
          <HarmonicFlowCanvas
            width={360}
            height={360}
            targetLetter={currentLetter}
            onStrokeUpdate={handleStrokeUpdate}
            onStrokeFinish={handleAutoStrokeFinish}
            worldAccent="realm"
            enableCameraAirControl={true}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2.5 w-full max-w-[360px] pt-3">
            <Button
              variant="realm"
              size="md"
              fullWidth
              onClick={handleNextRune}
              disabled={currentPoints.length < 3}
              leftIcon={<Sparkles className="w-4 h-4 fill-white" />}
              className="min-h-[48px] text-xs font-bold uppercase tracking-wider"
            >
              {language === 'hi' ? '✨ मैंने बना लिया' : '✨ I Drew It!'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={handleRetry}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="min-h-[48px] px-3.5 text-xs font-bold"
              title="Clear and try again"
            >
              {language === 'hi' ? 'मिटाओ' : 'Retry'}
            </Button>
          </div>
        </Card>

        {/* Right Sidebar: Unified Companion, Target Rune & Stardust Sequence */}
        <div className="flex flex-col justify-between gap-3">
          {/* Companion Card */}
          <Card className="p-4 pt-10 bg-white/95 border-2 border-teal-200 text-center shadow-soft-sm flex flex-col items-center justify-center flex-1 min-h-[180px]">
            <LanternMascot
              mood={mascotMood}
              size={76}
              speechBubble={
                showAnalysis
                  ? lastTrial && lastTrial.score >= 60
                    ? language === 'hi'
                      ? 'शानदार! बहुत सुंदर!'
                      : 'Sparkling! Beautiful stroke!'
                    : language === 'hi'
                    ? 'चलो आगे बढ़ते हैं!'
                    : "Great effort! Let's continue!"
                  : language === 'hi'
                  ? `अक्षर "${currentLetter}" बनाओ!`
                  : `Draw rune "${currentLetter}"!`
              }
            />
          </Card>

          {/* Target Rune Box */}
          <Card variant="realm" className="p-3.5 text-center">
            <p className="text-[10px] font-display font-extrabold uppercase tracking-wider text-teal-800">
              {language === 'hi' ? 'लक्ष्य अक्षर' : 'Target Rune'}
            </p>
            <div className="text-5xl font-display font-extrabold text-teal-600 py-0.5 select-none drop-shadow-sm">
              {currentLetter}
            </div>
            <p className="text-[11px] font-body text-ink/70 font-medium">
              {language === 'hi' ? 'हवा में या स्क्रीन पर बनाएं' : 'Trace along the glowing curve'}
            </p>
          </Card>

          {/* Stardust Runes Sequence */}
          <Card variant="gold" className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-amber mb-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-amber animate-spin-slow" />
              <span className="font-display font-extrabold text-xs text-amber-900">Stardust Sequence</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1">
              {lettersList.map((letter, idx) => (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-display font-extrabold text-xs transition-all ${
                    idx < currentIdx
                      ? 'bg-emerald-500 text-white shadow-candy-emerald scale-95'
                      : idx === currentIdx
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-candy-amber scale-110 ring-2 ring-amber-300'
                      : 'bg-white/80 text-ink/40 border border-hairline'
                  }`}
                >
                  {letter}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

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
    <div className="max-w-5xl mx-auto space-y-3.5 animate-spring-in">
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-hairline rounded-2xl p-3 sm:p-4 shadow-soft-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-2.5 bg-realm text-white rounded-xl shadow-soft-xs">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-lg sm:text-xl text-ink leading-tight">
              {t('worlds.runeRealm')}
            </h2>
            <p className="text-[11px] font-body text-muted hidden sm:block">
              {t('worlds.runeRealmSubtitle')} &middot; Trace letter in air or on screen
            </p>
          </div>
        </div>
        <div className="w-32 sm:w-44">
          <ProgressBar
            progress={progress}
            color="realm"
            size="sm"
            showLabel
            label={`Rune ${currentIdx + 1}/${lettersList.length}`}
          />
        </div>
      </div>

      {/* Main Arcade Cockpit Stage */}
      <div className="grid gap-3.5 lg:grid-cols-[1fr_300px] items-stretch">
        {/* Left Arena: Drawing Canvas */}
        <Card className="bg-gradient-to-b from-realm-light/10 via-white to-cream border border-realm/30 p-4 sm:p-5 shadow-soft-sm relative flex flex-col items-center justify-between">
          <div className="relative w-full flex justify-center py-1">
            <HarmonicFlowCanvas
              width={380}
              height={380}
              targetLetter={currentLetter}
              onStrokeUpdate={handleStrokeUpdate}
              onStrokeFinish={handleAutoStrokeFinish}
              enableCameraAirControl={true}
            />

            {/* Instant Celebration Feedback Modal */}
            <AnimatePresence mode="wait">
              {showAnalysis && lastTrial && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, scale: 0.92, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -10 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute inset-0 flex items-center justify-center z-30 bg-ink/20 backdrop-blur-xs rounded-2xl p-4"
                >
                  <div className="bg-white rounded-2xl p-5 shadow-soft-lg border-2 border-amber/40 text-center max-w-xs w-full">
                    <div className="w-12 h-12 rounded-full bg-amber/20 text-amber flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-6 h-6 fill-amber animate-spin-slow" />
                    </div>
                    <h3 className="font-display font-extrabold text-xl text-ink">
                      {language === 'hi' ? 'शाबाश!' : 'Wonderful!'}
                    </h3>
                    <p className="text-xs text-muted mt-0.5 mb-3 font-body">
                      {language === 'hi' ? 'जादुई लकीर पूरी हुई!' : 'Magical stroke captured!'}
                    </p>
                    <Button
                      variant="sage"
                      size="sm"
                      fullWidth
                      onClick={handleNextRune}
                      rightIcon={<Check className="w-4 h-4" />}
                    >
                      {language === 'hi' ? 'अगला अक्षर' : 'Next Rune'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex items-center justify-center gap-3 w-full max-w-[380px] pt-2">
            <Button
              variant="sage"
              size="md"
              onClick={handleNextRune}
              disabled={currentPoints.length < 3 || showAnalysis}
              rightIcon={<Check className="w-4 h-4" />}
              className="flex-1 min-h-[48px] text-sm font-bold shadow-soft-sm"
            >
              {language === 'hi' ? '✨ मैंने बना लिया' : '✨ I Drew It!'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={handleRetry}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="min-h-[48px] px-3.5 text-xs"
              title="Clear and try again"
            >
              {language === 'hi' ? 'मिटाओ' : 'Retry'}
            </Button>
          </div>
        </Card>

        {/* Right Sidebar: Unified Companion, Target Rune & Stardust Sequence */}
        <div className="flex flex-col justify-between gap-3">
          {/* Companion Card */}
          <Card className="p-4 pt-10 bg-white border border-realm/25 text-center shadow-soft-xs flex flex-col items-center justify-center flex-1 min-h-[180px]">
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
          <Card className="p-3.5 bg-white border border-realm/25 text-center shadow-soft-xs">
            <p className="text-[10px] font-display font-bold uppercase tracking-wider text-realm">
              {language === 'hi' ? 'लक्ष्य अक्षर' : 'Target Rune'}
            </p>
            <div className="text-5xl font-display font-extrabold text-realm py-0.5 select-none">
              {currentLetter}
            </div>
            <p className="text-[11px] font-body text-muted">
              {language === 'hi' ? 'हवा में या स्क्रीन पर बनाएं' : 'Trace along the glowing curve'}
            </p>
          </Card>

          {/* Stardust Runes Sequence */}
          <Card className="p-3 bg-gradient-to-b from-amber-50/60 to-white border border-amber/30 text-center shadow-soft-xs">
            <div className="flex items-center justify-center gap-1 text-amber mb-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-amber" />
              <span className="font-display font-bold text-xs text-ink">Stardust Sequence</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1">
              {lettersList.map((letter, idx) => (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs transition-all ${
                    idx < currentIdx
                      ? 'bg-sage text-white shadow-soft-xs'
                      : idx === currentIdx
                      ? 'bg-amber text-ink border-2 border-amber-600 animate-pulse'
                      : 'bg-sand/60 text-muted/50 border border-hairline'
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

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { HarmonicFlowCanvas, HarmonicPoint } from '@/components/ui/HarmonicFlowCanvas';
import { PenTool, Check, Sparkles, RotateCcw } from 'lucide-react';
import { RUNE_LETTERS_EN, RUNE_LETTERS_HI } from '@/lib/speech';
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
  const lettersList = language === 'hi' ? RUNE_LETTERS_HI : RUNE_LETTERS_EN;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedTrials, setCompletedTrials] = useState<RuneTrial[]>([]);
  const [currentPoints, setCurrentPoints] = useState<HarmonicPoint[]>([]);
  const [mascotMood, setMascotMood] = useState<'neutral' | 'encouraging' | 'celebrating' | 'thinking'>('neutral');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [lastTrial, setLastTrial] = useState<RuneTrial | null>(null);

  const currentLetter = lettersList[currentIdx] || lettersList[0];
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
    if (showAnalysis || points.length < 5) return;
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
    }, 1200);
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
    <div className="max-w-4xl mx-auto space-y-5 animate-spring-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 bg-white border-2 border-hairline rounded-3xl p-4 md:p-6 shadow-soft-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-realm text-white rounded-2xl shadow-soft-xs">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl md:text-2xl text-ink">
              {t('worlds.runeRealm')}
            </h2>
            <p className="text-xs font-body text-muted">
              {t('worlds.runeRealmSubtitle')} &middot; Trace letter in air or on screen
            </p>
          </div>
        </div>
        <div className="w-32 sm:w-48">
          <ProgressBar
            progress={progress}
            color="realm"
            size="md"
            showLabel
            label={`Rune ${currentIdx + 1}/${lettersList.length}`}
          />
        </div>
      </div>

      {/* Main Drawing Stage */}
      <div className="grid gap-6 md:grid-cols-[1fr_260px] items-start">
        <Card className="bg-gradient-to-b from-realm-light/10 via-white to-cream border-2 border-realm/30 p-5 sm:p-8 pt-12 sm:pt-14 shadow-soft-md relative flex flex-col items-center">
          <div className="flex flex-col items-center text-center space-y-4 w-full">
            {/* Friendly Mascot Companion */}
            <div className="pt-2 pb-1">
              <LanternMascot
                mood={mascotMood}
                size={76}
                speechBubble={
                  showAnalysis
                    ? lastTrial && lastTrial.score >= 60
                      ? language === 'hi'
                        ? 'शानदार! अक्षर बहुत सुंदर बना!'
                        : 'Sparkling! Letter formed beautifully!'
                      : language === 'hi'
                      ? 'अच्छी कोशिश! चलो आगे बढ़ते हैं!'
                      : "Great effort! Let's continue the adventure!"
                    : language === 'hi'
                    ? `अक्षर "${currentLetter}" को उंगली या हवा में बनाओ!`
                    : `Draw the letter "${currentLetter}" with touch or in the air!`
                }
              />
            </div>

            {/* Drawing Canvas */}
            <div className="relative w-full flex justify-center">
              <HarmonicFlowCanvas
                width={420}
                height={420}
                targetLetter={currentLetter}
                onStrokeUpdate={handleStrokeUpdate}
                onStrokeFinish={handleAutoStrokeFinish}
                enableCameraAirControl={true}
              />

              {/* Instant Child-Friendly Celebration Feedback */}
              <AnimatePresence mode="wait">
                {showAnalysis && lastTrial && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -15 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="absolute inset-0 flex items-center justify-center z-30 bg-ink/20 backdrop-blur-xs rounded-3xl p-4"
                  >
                    <div className="bg-white rounded-3xl p-6 shadow-soft-lg border-2 border-amber/40 text-center max-w-xs w-full">
                      <div className="w-16 h-16 rounded-full bg-amber/20 text-amber flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-8 h-8 fill-amber animate-spin-slow" />
                      </div>
                      <h3 className="font-display font-extrabold text-2xl text-ink">
                        {language === 'hi' ? 'शाबाश!' : 'Wonderful!'}
                      </h3>
                      <p className="text-xs text-muted mt-1 mb-4 font-body">
                        {language === 'hi' ? 'जादुई लकीर पूरी हुई!' : 'Magical stroke captured!'}
                      </p>
                      <Button
                        variant="sage"
                        size="md"
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

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 w-full max-w-[420px] pt-2">
              <Button
                variant="sage"
                size="lg"
                onClick={handleNextRune}
                disabled={currentPoints.length < 3 || showAnalysis}
                rightIcon={<Check className="w-5 h-5" />}
                className="flex-1 min-h-[56px] text-base font-bold shadow-soft-sm"
              >
                {language === 'hi' ? '✨ मैंने बना लिया' : '✨ I Drew It!'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleRetry}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                className="min-h-[56px] px-4"
                title="Clear and try again"
              >
                {language === 'hi' ? 'मिटाओ' : 'Retry'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Side Panel: Target Letter & Stardust Jar */}
        <div className="space-y-4 hidden md:block">
          {/* Target Letter Card */}
          <Card className="text-center p-6 bg-white border-2 border-realm/30 shadow-soft-sm">
            <p className="text-xs font-display font-bold uppercase tracking-wider text-realm mb-1">
              {language === 'hi' ? 'लक्ष्य अक्षर' : 'Target Rune'}
            </p>
            <div className="text-7xl font-display font-extrabold text-realm py-1 select-none">
              {currentLetter}
            </div>
            <p className="text-xs font-body text-muted mt-1">
              {language === 'hi' ? 'हवा में या स्क्रीन पर बनाएं' : 'Trace along the glowing curve'}
            </p>
          </Card>

          {/* Stardust Progress Card */}
          <Card className="p-5 bg-gradient-to-b from-amber-50 to-white border-2 border-amber/30 text-center shadow-soft-sm">
            <div className="flex items-center justify-center gap-1.5 text-amber mb-2">
              <Sparkles className="w-5 h-5 fill-amber" />
              <span className="font-display font-bold text-sm text-ink">Stardust Runes</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2">
              {lettersList.map((letter, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold text-xs transition-all ${
                    idx < currentIdx
                      ? 'bg-sage text-white shadow-soft-xs'
                      : idx === currentIdx
                      ? 'bg-amber text-ink border-2 border-amber-600 animate-pulse'
                      : 'bg-paper text-muted/50 border border-hairline'
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

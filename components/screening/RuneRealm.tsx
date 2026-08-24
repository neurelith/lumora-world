'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { HarmonicFlowCanvas, HarmonicPoint } from '@/components/ui/HarmonicFlowCanvas';
import { PenTool, Check, Sparkles, RotateCcw, Eye } from 'lucide-react';
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

  const handleNextRune = () => {
    if (currentPoints.length < 3) return;
    const rawStrokePoints = currentPoints.map((p) => ({ x: p.x, y: p.y, t: p.t, pressure: p.pressure }));
    const trial = analyzeStroke(rawStrokePoints, currentLetter, language);
    setLastTrial(trial);
    setShowAnalysis(true);
    setMascotMood(trial.score >= 70 ? 'celebrating' : 'encouraging');
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
        onComplete({ meanNvi, meanJerkIndex: meanJerk, meanDeviation: meanDev, mirrorReversalsCount: mirrorCount, triage, trials: nextTrials });
      }
      setShowAnalysis(false);
    }, 900);
  };

  const handleRetry = () => {
    setCurrentPoints([]);
    setMascotMood('neutral');
    setShowAnalysis(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-spring-in">
      <div className="flex items-center justify-between gap-4 bg-white border border-whisper rounded-panel p-4 md:p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-realm-soft text-realm rounded-xl"><PenTool className="w-6 h-6" /></div>
          <div>
            <h2 className="font-display font-extrabold text-xl md:text-2xl text-ink">{t('worlds.runeRealm')}</h2>
            <p className="text-xs font-body text-ink-tertiary">{t('worlds.runeRealmSubtitle')} &middot; Harmonic Flow &amp; Kinematics</p>
          </div>
        </div>
        <div className="w-36 md:w-52">
          <ProgressBar progress={progress} color="realm" size="md" showLabel label={`Rune ${currentIdx + 1}/${lettersList.length}`} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="bg-gradient-to-b from-realm-soft/20 via-white to-ivory border border-realm/20 p-6 md:p-8 shadow-card relative overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-6">
            <LanternMascot
              mood={mascotMood}
              size={80}
              speechBubble={
                showAnalysis
                  ? lastTrial && lastTrial.score >= 70
                    ? language === 'hi' ? 'शानदार! अक्षर सही बना!' : 'Excellent! Letter formed beautifully!'
                    : language === 'hi' ? 'अच्छी कोशिश! फिर से कोशिश करो।' : "Good try! Let's practice once more."
                  : language === 'hi'
                    ? 'उंगली से स्क्रीन पर या कैमरे के सामने हवा में जादू से अक्षर बनाओ!'
                    : 'Draw with touch or wave your finger in front of the camera!'
              }
            />

            <div className="relative w-full max-w-[480px]">
              <HarmonicFlowCanvas width={420} height={420} targetLetter={currentLetter} onStrokeUpdate={handleStrokeUpdate} enableCameraAirControl={true} />
              <AnimatePresence mode="wait">
                {showAnalysis && lastTrial && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="absolute inset-0 flex items-center justify-center z-10"
                  >
                    <div className="bg-white/95 backdrop-blur-sm rounded-panel p-6 md:p-8 max-w-md mx-4 shadow-deep border border-whisper">
                      <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-3 ${lastTrial.score >= 70 ? 'bg-sage-soft text-sage' : 'bg-amber-soft text-amber'}`}>
                          {lastTrial.score >= 70 ? <Check className="w-8 h-8" /> : <RotateCcw className="w-8 h-8" />}
                        </div>
                        <h3 className="font-display font-bold text-xl text-ink mb-2">{lastTrial.score >= 70 ? (language === 'hi' ? 'बहुत बढ़िया!' : 'Well Done!') : (language === 'hi' ? 'अच्छी कोशिश!' : 'Good Try!')}</h3>
                        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                          <div className="bg-sand rounded-lg p-3"><p className="font-display font-bold text-2xl text-realm">{lastTrial.nvi.toFixed(1)}</p><p className="text-xs text-ink-tertiary">NVI</p></div>
                          <div className="bg-sand rounded-lg p-3"><p className="font-display font-bold text-2xl text-realm">{lastTrial.centerlineDev.toFixed(1)}</p><p className="text-xs text-ink-tertiary">Deviation</p></div>
                          <div className="bg-sand rounded-lg p-3"><p className="font-display font-bold text-2xl text-realm">{lastTrial.jerkIndex.toFixed(1)}</p><p className="text-xs text-ink-tertiary">Jerk</p></div>
                        </div>
                        {lastTrial.isMirrored && <p className="text-amber text-sm font-medium mb-3 flex items-center justify-center gap-1"><RotateCcw className="w-4 h-4" />{language === 'hi' ? 'दर्पण उलटफेर' : 'Mirror reversal detected'}</p>}
                        <Button variant={lastTrial.score >= 70 ? 'success' : 'secondary'} size="md" onClick={handleNextRune} rightIcon={<Check className="w-4 h-4" />} className="w-full">{language === 'hi' ? 'अगला अक्षर' : 'Next Rune'}</Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[480px]">
              {!showAnalysis && <Button variant="sage" size="lg" onClick={handleNextRune} disabled={currentPoints.length < 3} rightIcon={<Check className="w-5 h-5" />} className="flex-1">{language === 'hi' ? 'अक्षर पूरा हुआ' : 'Done / Next Rune'}</Button>}
              {showAnalysis && <Button variant="ghost" size="md" onClick={handleRetry} leftIcon={<RotateCcw className="w-4 h-4" />} className="flex-1">{language === 'hi' ? 'फिर से' : 'Try Again'}</Button>}
              <Button variant="outline" size="md" onClick={() => {}} leftIcon={<Eye className="w-4 h-4" />} className="flex-1 sm:flex-none">{language === 'hi' ? 'कैमरा' : 'Toggle Camera'}</Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card variant="elevated" padding="md" className="text-center bg-realm-soft/30 border-realm/30">
            <p className="text-xs font-display font-bold uppercase tracking-wider text-realm mb-1">{language === 'hi' ? 'लक्ष्य अक्षर' : 'Target Letter'}</p>
            <div className="text-7xl md:text-8xl font-display font-extrabold text-realm font-mono select-none">{currentLetter}</div>
            <p className="mt-2 text-sm text-ink-tertiary">{language === 'hi' ? 'ट्रेस करें या हवा में बनाएं' : 'Trace on screen or draw in air'}</p>
          </Card>
          <Card variant="default" padding="md" className="bg-sand/50 border-whisper">
            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-realm-soft text-realm rounded-lg"><Sparkles className="w-5 h-5" /></div><h3 className="font-display font-semibold text-ink">Stroke Quality</h3></div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-lg p-3 border border-whisper"><motion.span className="font-display font-bold text-2xl text-realm block" animate={{ rotate: [0, 2, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}>{currentPoints.length > 10 ? '✓' : '○'}</motion.span><p className="text-xs text-ink-tertiary">Path</p></div>
              <div className="bg-white rounded-lg p-3 border border-whisper"><motion.span className="font-display font-bold text-2xl text-realm block" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>{currentPoints.length > 20 ? '✓' : '○'}</motion.span><p className="text-xs text-ink-tertiary">Pressure</p></div>
              <div className="bg-white rounded-lg p-3 border border-whisper"><span className="font-display font-bold text-2xl text-realm block">{currentPoints.length > 5 ? '✓' : '○'}</span><p className="text-xs text-ink-tertiary">Flow</p></div>
            </div>
          </Card>
          {completedTrials.length > 0 && (
            <Card variant="outlined" padding="md" className="border-realm/30">
              <div className="flex items-center gap-2 mb-3"><PenTool className="w-4 h-4 text-realm" /><h3 className="font-display font-semibold text-ink text-sm">Recent Strokes</h3></div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {completedTrials.slice(-5).map((trial, idx) => (
                  <div key={idx} className="flex-shrink-0 w-20 text-center">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center font-display font-bold text-xl mx-auto mb-1 ${trial.score >= 70 ? 'bg-sage-soft text-sage' : trial.score >= 40 ? 'bg-amber-soft text-amber' : 'bg-terracotta-soft text-terracotta'}`}>{trial.letter}</div>
                    <p className="text-xs font-display font-medium text-ink">{trial.score}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <Card variant="default" padding="md" className="text-center">
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg className="w-full h-full -rotate-90"><circle cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeWidth="6" className="text-whisper" /><motion.circle cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={314} strokeDashoffset={314 * (1 - progress / 100)} strokeLinecap="round" className="text-realm" animate={{ strokeDashoffset: 314 * (1 - progress / 100) }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} /></svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="font-display font-bold text-xl text-ink">{Math.round(progress)}%</span></div>
            </div>
            <p className="text-xs text-ink-tertiary">Overall Progress</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

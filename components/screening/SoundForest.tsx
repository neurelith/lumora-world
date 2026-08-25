'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Volume2, Sparkles, ArrowRight, Play, RotateCcw } from 'lucide-react';
import { SOUND_FOREST_TRIALS_EN, SOUND_FOREST_TRIALS_HI } from '@/lib/speech';
import { playPhonemeSequence } from '@/lib/speech-real';
import { SoundForestTrial, SoundForestResult, Language } from '@/lib/types';
import { classifySoundForest } from '@/lib/scoring';
import { motion, AnimatePresence } from 'framer-motion';

interface SoundForestProps {
  grade: number;
  language: Language;
  onComplete: (result: SoundForestResult) => void;
}

export const SoundForest: React.FC<SoundForestProps> = ({
  grade,
  language,
  onComplete,
}) => {
  const { t } = useTranslation();
  const trialsList = language === 'hi' ? SOUND_FOREST_TRIALS_HI : SOUND_FOREST_TRIALS_EN;

  const [currentTrialIdx, setCurrentTrialIdx] = useState(0);
  const [activePhonemeIdx, setActivePhonemeIdx] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [trialResults, setTrialResults] = useState<{
    isCorrect: boolean;
    latencyMs: number;
    chosen: string;
  }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [mascotMood, setMascotMood] = useState<'neutral' | 'encouraging' | 'celebrating' | 'thinking'>('neutral');
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);

  const currentTrial = trialsList[currentTrialIdx] || trialsList[0];
  const progressPercent = ((currentTrialIdx + 1) / trialsList.length) * 100;

  // Prepare shuffled options for current trial
  useEffect(() => {
    const allOptions = [currentTrial.targetWord, ...currentTrial.distractors];
    const shuffled = [...allOptions].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    setSelectedOption(null);
    setActivePhonemeIdx(null);
    setMascotMood('neutral');
    setShowFeedback(false);

    // Auto-play phonemes on trial enter
    handlePlayAudio();
  }, [currentTrialIdx]);

  const handlePlayAudio = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    setMascotMood('encouraging');

    playPhonemeSequence(currentTrial.phonemes, {
      language,
      onPhonemeActive: (idx) => setActivePhonemeIdx(idx),
      onComplete: () => {
        setIsPlayingAudio(false);
        setActivePhonemeIdx(null);
        setTrialStartTime(performance.now());
      },
    });
  };

  const handleSelectOption = (word: string) => {
    if (selectedOption !== null || isPlayingAudio) return;
    const latency = Math.round(performance.now() - trialStartTime);
    const isCorrect = word === currentTrial.targetWord;

    setSelectedOption(word);
    setFeedbackCorrect(isCorrect);
    setShowFeedback(true);
    
    if (isCorrect) {
      setMascotMood('celebrating');
    } else {
      setMascotMood('encouraging');
    }

    const nextResults = [
      ...trialResults,
      { isCorrect, latencyMs: latency, chosen: word },
    ];
    setTrialResults(nextResults);

    // Auto advance after brief delay
    setTimeout(() => {
      if (currentTrialIdx < trialsList.length - 1) {
        setCurrentTrialIdx((prev) => prev + 1);
      } else {
        // Complete world assessment
        const correctCount = nextResults.filter((r) => r.isCorrect).length;
        const accuracy = correctCount / trialsList.length;
        const meanLatency = Math.round(
          nextResults.reduce((acc, r) => acc + r.latencyMs, 0) / nextResults.length
        );
        const triage = classifySoundForest(accuracy, meanLatency, grade);

        onComplete({
          accuracy,
          meanLatencyMs: meanLatency,
          totalTrials: trialsList.length,
          correctTrials: correctCount,
          confusionPairs: [],
          triage,
        });
      }
      setShowFeedback(false);
    }, 1200);
  };

  const handleReplay = () => {
    setShowFeedback(false);
    handlePlayAudio();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-spring-in">
      {/* Top Game Bar */}
      <div className="flex items-center justify-between gap-4 bg-white border border-whisper rounded-panel p-4 md:p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-forest-soft text-forest rounded-xl">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl md:text-2xl text-ink">
              {t('worlds.soundForest')}
            </h2>
            <p className="text-xs font-body text-ink-tertiary">
              {t('worlds.soundForestSubtitle')}
            </p>
          </div>
        </div>

        <div className="w-36 md:w-52">
          <ProgressBar
            progress={progressPercent}
            color="forest"
            size="md"
            showLabel
            label={`Trial ${currentTrialIdx + 1}/${trialsList.length}`}
          />
        </div>
      </div>

      {/* Main Stage — Asymmetric 70/30 Layout */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px] items-stretch">
        {/* LEFT: Task Area */}
        <Card className="bg-gradient-to-b from-forest-soft/20 via-white to-ivory border border-forest/20 p-4 sm:p-5 pt-8 shadow-card relative flex flex-col items-center justify-between">
          <div className="flex flex-col items-center text-center space-y-4 w-full">
            {/* Mascot Guidance */}
            <div className="pt-1 flex justify-center">
              <LanternMascot
                mood={mascotMood}
                size={76}
                speechBubble={
                  isPlayingAudio
                    ? language === 'hi' ? 'ध्यान से सुनो...' : 'Listen closely to each sound...'
                    : showFeedback
                    ? feedbackCorrect
                      ? language === 'hi' ? 'बहुत बढ़िया! 🌟' : 'Excellent! 🌟'
                      : language === 'hi' ? 'फिर से कोशिश करो!' : 'Try again!'
                    : language === 'hi' ? 'अब मिला हुआ शब्द चुनो!' : 'Now blend the sounds and pick the word!'
                }
              />
            </div>

            {/* Pulsing Phoneme Circles */}
            <div className="space-y-2">
              <p className="text-[11px] font-display font-bold uppercase tracking-wider text-forest">
                {language === 'hi' ? 'ध्वनियां' : 'Phoneme Sounds'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
                {currentTrial.phonemes.map((phoneme, idx) => {
                  const isActive = activePhonemeIdx === idx;
                  return (
                    <motion.div
                      key={idx}
                      className={`
                        w-13 h-13 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center 
                        font-display font-extrabold text-xl sm:text-2xl border-2 transition-all duration-300
                        ${isActive
                          ? 'bg-forest text-white border-forest-light shadow-card scale-105'
                          : 'bg-white text-ink border-whisper shadow-xs'
                        }
                      `}
                      animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
                    >
                      {phoneme}
                    </motion.div>
                  );
                })}
              </div>

              {/* Replay Audio Button */}
              <div className="pt-1 flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePlayAudio}
                  disabled={isPlayingAudio}
                  leftIcon={<Play className="w-3.5 h-3.5 text-forest" />}
                  className="min-h-[38px] text-xs font-bold"
                >
                  {language === 'hi' ? 'ध्वनि फिर से सुनें' : 'Listen Again'}
                </Button>
                {showFeedback && !feedbackCorrect && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReplay}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    className="min-h-[38px] text-xs"
                  >
                    {language === 'hi' ? 'फिर से कोशिश' : 'Try Again'}
                  </Button>
                )}
              </div>
            </div>

            {/* 4 Illustrated Answer Cards */}
            <AnimatePresence mode="wait">
              <div className="w-full space-y-2 max-w-md mx-auto" key={currentTrialIdx}>
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-ink-tertiary">
                  {language === 'hi' ? 'सही शब्द पर टैप करें' : 'Tap the blended word'}
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {shuffledOptions.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === currentTrial.targetWord;

                    let cardStyle = 'bg-white border-whisper text-ink hover:border-forest/60 hover:bg-forest-soft/50';
                    if (showFeedback) {
                      if (isSelected && isCorrect) {
                        cardStyle = 'bg-sage-soft border-sage/30 text-sage shadow-xs font-bold scale-[1.02]';
                      } else if (isSelected && !isCorrect) {
                        cardStyle = 'bg-amber-soft border-amber/30 text-ink font-bold';
                      } else if (isCorrect) {
                        cardStyle = 'bg-sage-soft border-sage/30 text-sage font-bold';
                      } else {
                        cardStyle = 'bg-sand text-ink-tertiary border-whisper opacity-60';
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleSelectOption(option)}
                        disabled={selectedOption !== null || isPlayingAudio}
                        className={`
                          min-h-[54px] p-3 rounded-xl border-2 flex items-center justify-center 
                          font-display font-bold text-lg sm:text-xl transition-all duration-base ease-out-expo 
                          select-none shadow-xs
                          ${cardStyle}
                        `}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{ delay: idx * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{option}</span>
                        {showFeedback && isSelected && isCorrect && (
                          <Sparkles className="ml-1.5 h-4 w-4 text-sage animate-pulse-gentle" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </AnimatePresence>
          </div>
        </Card>

        {/* RIGHT: Guidance Panel (30%) */}
        <div className="space-y-4">
          {/* Live Metrics Card */}
          <Card variant="elevated" padding="md" className="bg-sand/50 border-whisper">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-forest-soft text-forest rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-ink">Live Signals</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Trials completed</span>
                <span className="font-display font-bold text-ink">{currentTrialIdx}/{trialsList.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Correct so far</span>
                <span className="font-display font-bold text-sage">{trialResults.filter(r => r.isCorrect).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Avg response time</span>
                <span className="font-display font-bold text-ink">
                  {trialResults.length > 0
                    ? Math.round(trialResults.reduce((a, b) => a + b.latencyMs, 0) / trialResults.length)
                    : 0}ms
                </span>
              </div>
            </div>
          </Card>

          {/* Contextual Tips */}
          <Card variant="outlined" padding="md" className="border-forest/30 bg-forest-soft/30">
            <p className="text-sm text-ink-secondary leading-relaxed">
              {language === 'hi'
                ? 'बच्चे को प्रत्येक ध्वनि ध्यान से सुनने दें। शब्द को जोड़कर सही विकल्प चुनें।'
                : 'Let the child listen to each sound carefully. Blend the sounds to find the matching word.'}
            </p>
          </Card>

          {/* Progress Ring */}
          <Card variant="default" padding="md" className="text-center">
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-whisper"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={314}
                  strokeDashoffset={314 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  className="text-forest"
                  animate={{ strokeDashoffset: 314 * (1 - progressPercent / 100) }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-xl text-ink">{Math.round(progressPercent)}%</span>
              </div>
            </div>
            <p className="text-xs text-ink-tertiary">Overall Progress</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
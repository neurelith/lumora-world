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
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* LEFT: Task Area (70%) */}
        <Card className="bg-gradient-to-b from-forest-soft/20 via-white to-ivory border border-forest/20 p-6 md:p-8 pt-14 md:pt-16 shadow-card relative">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Mascot Guidance */}
            <div className="pt-2 pb-1 flex justify-center">
              <LanternMascot
                mood={mascotMood}
                size={90}
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
            <div className="space-y-3">
              <p className="text-xs font-display font-bold uppercase tracking-wider text-forest">
                {language === 'hi' ? 'ध्वनियां' : 'Phoneme Sounds'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
                {currentTrial.phonemes.map((phoneme, idx) => {
                  const isActive = activePhonemeIdx === idx;
                  return (
                    <motion.div
                      key={idx}
                      className={`
                        w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center 
                        font-display font-extrabold text-2xl md:text-3xl border-2 transition-all duration-300
                        ${isActive
                          ? 'bg-forest text-white border-forest-light shadow-card scale-110'
                          : 'bg-white text-ink border-whisper shadow-sm'
                        }
                      `}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
                    >
                      {phoneme}
                    </motion.div>
                  );
                })}
              </div>

              {/* Replay Audio Button */}
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePlayAudio}
                  disabled={isPlayingAudio}
                  leftIcon={<Play className="w-4 h-4 text-forest" />}
                >
                  {language === 'hi' ? 'ध्वनि फिर से सुनें' : 'Listen Again'}
                </Button>
                {showFeedback && !feedbackCorrect && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReplay}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                    className="ml-2"
                  >
                    {language === 'hi' ? 'फिर से कोशिश' : 'Try Again'}
                  </Button>
                )}
              </div>
            </div>

            {/* 4 Illustrated Answer Cards — Staggered reveal */}
            <AnimatePresence mode="wait">
              <div className="w-full space-y-3" key={currentTrialIdx}>
                <p className="text-xs font-display font-bold uppercase tracking-wider text-ink-tertiary">
                  {language === 'hi' ? 'सही शब्द पर टैप करें' : 'Tap the blended word'}
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  {shuffledOptions.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === currentTrial.targetWord;

                    let cardStyle = 'bg-white border-whisper text-ink hover:border-forest/60 hover:bg-forest-soft/50';
                    if (showFeedback) {
                      if (isSelected && isCorrect) {
                        cardStyle = 'bg-sage-soft border-sage/30 text-sage shadow-[0_0_0_1px_rgba(74,124,94,0.35)] font-bold scale-[1.02]';
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
                          min-h-[72px] p-4 rounded-xl border-2 flex items-center justify-center 
                          font-display font-bold text-xl md:text-2xl transition-all duration-base ease-out-expo 
                          select-none shadow-sm
                          ${cardStyle}
                        `}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: idx * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{option}</span>
                        {showFeedback && isSelected && isCorrect && (
                          <Sparkles className="ml-2 h-5 w-5 text-sage animate-pulse-gentle" />
                        )}
                        {showFeedback && isSelected && !isCorrect && (
                          <span className="ml-2 text-amber">↻</span>
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
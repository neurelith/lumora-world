'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Volume2, Sparkles, ArrowRight, Play, RotateCcw, Mic, MicOff } from 'lucide-react';
import { generateSoundForestChallenges } from '@/lib/challenge-generator';
import { playPhonemeSequence, startSpeechRecognition } from '@/lib/speech-real';
import { matchSpokenWord } from '@/lib/phonetic-matching';
import { UniversalAirWand } from '@/components/ui/UniversalAirWand';
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
  const [trialsList] = useState<SoundForestTrial[]>(() => generateSoundForestChallenges(language, 6));

  const [currentTrialIdx, setCurrentTrialIdx] = useState(0);
  const [activePhonemeIdx, setActivePhonemeIdx] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [trialResults, setTrialResults] = useState<{
    isCorrect: boolean;
    latencyMs: number;
    chosen: string;
    mode: 'voice' | 'touch';
  }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [mascotMood, setMascotMood] = useState<'neutral' | 'encouraging' | 'celebrating' | 'thinking'>('neutral');
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const speechRecognitionStopRef = useRef<(() => void) | null>(null);

  const currentTrial = trialsList[currentTrialIdx] || trialsList[0];
  const progressPercent = ((currentTrialIdx + 1) / trialsList.length) * 100;

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionStopRef.current) {
        speechRecognitionStopRef.current();
        speechRecognitionStopRef.current = null;
      }
    };
  }, []);

  // Prepare shuffled options for current trial
  useEffect(() => {
    const allOptions = [currentTrial.targetWord, ...currentTrial.distractors];
    const shuffled = [...allOptions].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    setSelectedOption(null);
    setActivePhonemeIdx(null);
    setMascotMood('neutral');
    setShowFeedback(false);
    setVoiceTranscript('');

    if (speechRecognitionStopRef.current) {
      speechRecognitionStopRef.current();
      speechRecognitionStopRef.current = null;
    }
    setIsListeningVoice(false);

    // Auto-play phonemes on trial enter
    handlePlayAudio();
  }, [currentTrialIdx]);

  const startVoiceListener = () => {
    if (speechRecognitionStopRef.current) {
      speechRecognitionStopRef.current();
      speechRecognitionStopRef.current = null;
    }

    setIsListeningVoice(true);
    const stopFn = startSpeechRecognition(
      language,
      (transcript) => {
        setVoiceTranscript(transcript);
        const match = matchSpokenWord(transcript, currentTrial.targetWord, language);
        if (match.isMatch) {
          handleSelectOption(currentTrial.targetWord, 'voice');
        }
      },
      () => {
        setIsListeningVoice(false);
      }
    );
    speechRecognitionStopRef.current = stopFn;
  };

  const handlePlayAudio = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    setIsListeningVoice(false);
    setMascotMood('encouraging');

    playPhonemeSequence(currentTrial.phonemes, {
      language,
      onPhonemeActive: (idx) => setActivePhonemeIdx(idx),
      onComplete: () => {
        setIsPlayingAudio(false);
        setActivePhonemeIdx(null);
        setTrialStartTime(performance.now());
        // Start listening to child's voice automatically
        startVoiceListener();
      },
    });
  };

  const handleSelectOption = (word: string, mode: 'voice' | 'touch' = 'touch') => {
    if (selectedOption !== null || isPlayingAudio) return;
    const latency = Math.round(performance.now() - trialStartTime);
    const isCorrect = word === currentTrial.targetWord;

    if (speechRecognitionStopRef.current) {
      speechRecognitionStopRef.current();
      speechRecognitionStopRef.current = null;
    }
    setIsListeningVoice(false);

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
      { isCorrect, latencyMs: latency, chosen: word, mode },
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
    <div className="min-h-[calc(100vh-80px)] bg-world-forest p-3 sm:p-4 rounded-3xl max-w-5xl mx-auto space-y-4">
      {/* Top Game Bar */}
      <div className="flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md border-2 border-emerald-200 rounded-3xl p-4 shadow-candy-emerald">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl shadow-soft-xs">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl md:text-2xl text-ink">
              {t('worlds.soundForest')}
            </h2>
            <p className="text-xs font-body text-emerald-800 font-medium">
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
        <Card variant="forest" className="p-4 sm:p-5 pt-8 relative flex flex-col items-center justify-between">
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

            {/* Visual Phoneme Tokens Sequence */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-1 flex-wrap">
              {currentTrial.phonemes.map((phoneme, idx) => {
                const isActive = activePhonemeIdx === idx;
                return (
                  <motion.div
                    key={idx}
                    className={`
                      w-13 h-13 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl sm:text-2xl
                      border-2 border-b-4 transition-all duration-200 select-none
                      ${
                        isActive
                          ? 'bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] text-amber-950 border-amber-300 border-b-amber-500 scale-110 shadow-candy-amber ring-4 ring-amber-200'
                          : 'bg-white text-ink border-emerald-200 border-b-emerald-400 shadow-soft-xs'
                      }
                    `}
                    animate={isActive ? { scale: [1, 1.15, 1.05] } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  >
                    <span>{phoneme}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Audio Control Action Button & Voice Listener Banner */}
            <div className="flex flex-col items-center gap-2.5 w-full max-w-xs">
              <Button
                variant="forest"
                size="md"
                fullWidth
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                leftIcon={isPlayingAudio ? <Volume2 className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 fill-white" />}
                className="font-display font-extrabold uppercase tracking-wider text-xs"
              >
                {isPlayingAudio
                  ? language === 'hi' ? 'ध्वनियां बजाई जा रही हैं...' : 'Playing Sounds...'
                  : language === 'hi' ? 'ध्वनियां सुनो' : 'Listen to Sounds'}
              </Button>

              {/* Live Voice Blending Indicator */}
              {isListeningVoice && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-400 text-emerald-950 font-display font-extrabold text-[11px] shadow-soft-xs"
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>{language === 'hi' ? 'बोलकर बताएं या नीचे टैप करें:' : 'Say the word aloud or tap below:'}</span>
                  {voiceTranscript && (
                    <span className="bg-white px-2 py-0.5 rounded-md border border-emerald-300 font-mono text-emerald-800 font-bold">
                      &quot;{voiceTranscript}&quot;
                    </span>
                  )}
                </motion.div>
              )}
            </div>

            {/* Option Cards (4-Choice Selection Grid) */}
            <AnimatePresence mode="wait">
              <div className="w-full max-w-md space-y-2 pt-1">
                <p className="text-xs font-display font-extrabold uppercase tracking-wider text-emerald-950">
                  {language === 'hi' ? 'सही शब्द पर टैप करें' : 'Tap the blended word'}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {shuffledOptions.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === currentTrial.targetWord;

                    let cardStyle = 'bg-white text-ink border-emerald-200 border-b-emerald-400 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-candy-emerald';
                    if (showFeedback) {
                      if (isSelected && isCorrect) {
                        cardStyle = 'bg-gradient-to-b from-[#22C55E] to-[#16A34A] border-emerald-400 border-b-[#15803D] text-white shadow-candy-emerald font-extrabold scale-[1.03]';
                      } else if (isSelected && !isCorrect) {
                        cardStyle = 'bg-gradient-to-b from-[#FB923C] to-[#EA580C] border-orange-400 border-b-[#C2410C] text-white font-extrabold';
                      } else if (isCorrect) {
                        cardStyle = 'bg-gradient-to-b from-[#22C55E] to-[#16A34A] border-emerald-400 border-b-[#15803D] text-white font-extrabold';
                      } else {
                        cardStyle = 'bg-white/40 text-ink/30 border-hairline opacity-50';
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleSelectOption(option)}
                        disabled={selectedOption !== null || isPlayingAudio}
                        className={`
                          min-h-[58px] p-3.5 rounded-2xl border-2 border-b-4 flex items-center justify-center 
                          font-display font-extrabold text-lg sm:text-xl transition-all duration-150 
                          select-none shadow-soft-xs active:border-b-2 active:translate-y-0.5
                          ${cardStyle}
                        `}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{ delay: idx * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span>{option}</span>
                        {showFeedback && isSelected && isCorrect && (
                          <Sparkles className="ml-1.5 h-4 w-4 text-white fill-white animate-spin-slow" />
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

      {/* Universal Camera Air Gesture Wand */}
      <UniversalAirWand accentColor="#4A7C5E" />
    </div>
  );
};
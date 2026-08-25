'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BookOpen, ThumbsUp, ThumbsDown, Mic, MicOff, Volume2 } from 'lucide-react';
import { generateStoryCastleChallenges } from '@/lib/challenge-generator';
import { UniversalAirWand } from '@/components/ui/UniversalAirWand';
import { StoryCastleResult, Language } from '@/lib/types';
import { classifyStoryCastle } from '@/lib/scoring';
import { useSpeechRecognition } from '@/lib/speech-real';

interface StoryCastleProps {
  grade: number;
  language: Language;
  onComplete: (result: StoryCastleResult) => void;
}

export const StoryCastle: React.FC<StoryCastleProps> = ({
  grade,
  language,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [wordsList] = useState<string[]>(() => generateStoryCastleChallenges(language, 6));

  const [currentIdx, setCurrentIdx] = useState(0);
  const [trialStartTime, setTrialStartTime] = useState(performance.now());
  const [results, setResults] = useState<{ isCorrect: boolean; hesitationMs: number }[]>([]);
  const [mascotMood, setMascotMood] = useState<'neutral' | 'encouraging' | 'celebrating'>('neutral');

  // Use robust speech recognition hook
  const { isListening, transcript, isSupported, error, start, stop, reset } = useSpeechRecognition(language);

  const currentWord = wordsList[currentIdx] || wordsList[0];

  useEffect(() => {
    setTrialStartTime(performance.now());
    setMascotMood('neutral');
    reset();
  }, [currentIdx, language, reset]);

  const toggleMic = () => {
    if (isListening) {
      stop();
    } else {
      start();
      setMascotMood('encouraging');
    }
  };

  // Check transcript for match (runs on transcript change)
  useEffect(() => {
    if (transcript && isListening) {
      if (transcript.includes(currentWord.toLowerCase())) {
        handleScore(true);
      }
    }
  }, [transcript, currentWord, isListening]);

  const handleScore = (isCorrect: boolean) => {
    if (isListening) {
      stop();
    }

    const hesitation = Math.round(performance.now() - trialStartTime);
    setMascotMood(isCorrect ? 'celebrating' : 'encouraging');

    const nextResults = [...results, { isCorrect, hesitationMs: hesitation }];
    setResults(nextResults);

    setTimeout(() => {
      if (currentIdx < wordsList.length - 1) {
        setCurrentIdx((prev) => prev + 1);
      } else {
        const correctCount = nextResults.filter((r) => r.isCorrect).length;
        const accuracy = correctCount / wordsList.length;
        const meanHesitation = Math.round(
          nextResults.reduce((acc, r) => acc + r.hesitationMs, 0) / nextResults.length
        );
        const triage = classifyStoryCastle(accuracy, meanHesitation, grade);

        onComplete({
          accuracy,
          meanHesitationMs: meanHesitation,
          totalTrials: wordsList.length,
          correctTrials: correctCount,
          triage,
        });
      }
    }, 800);
  };

  const progress = ((currentIdx + 1) / wordsList.length) * 100;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-world-castle p-3 sm:p-4 rounded-3xl max-w-4xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md border-2 border-purple-200 rounded-3xl p-4 shadow-candy-purple">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl shadow-soft-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl md:text-2xl text-ink">
              {t('worlds.storyCastle')}
            </h2>
            <p className="text-xs font-body text-purple-800 font-medium">
              {t('worlds.storyCastleSubtitle')}
            </p>
          </div>
        </div>

        <div className="w-36 md:w-52">
          <ProgressBar
            progress={progress}
            color="castle"
            size="md"
            showLabel
            label={`Word ${currentIdx + 1}/${wordsList.length}`}
          />
        </div>
      </div>

      {/* Main Stone Tablet Stage */}
      <Card variant="castle" className="p-4 sm:p-6 pt-8">
        <div className="flex flex-col items-center text-center space-y-4 max-w-lg mx-auto">
          <div className="pt-1 flex justify-center">
            <LanternMascot
              mood={mascotMood}
              size={76}
              speechBubble={
                language === 'hi'
                  ? 'इस जादुई शब्द को जोर से पढ़कर सुनाओ!'
                  : 'Read this magical tablet aloud!'
              }
            />
          </div>

          {/* Stone Tablet with Glowing Nonword */}
          <div className="w-full bg-gradient-to-b from-purple-50 to-white border-2 border-purple-200 rounded-3xl p-6 shadow-candy-purple relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[10px] font-display font-extrabold uppercase tracking-widest text-purple-600">
              Stone Tablet #{currentIdx + 1}
            </div>

            <div className="py-4 flex items-center justify-center">
              <span className="font-display font-extrabold text-5xl sm:text-6xl text-purple-700 tracking-wider select-none drop-shadow-sm">
                {currentWord}
              </span>
            </div>

            {transcript && (
              <div className="mt-1 text-xs font-body text-purple-900 bg-purple-100/80 border border-purple-300 px-3 py-1 rounded-full inline-block font-bold">
                Voice heard: <strong className="text-purple-950">&quot;{transcript}&quot;</strong>
              </div>
            )}
          </div>

          {/* Dual-Mode Scoring Engine */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-center gap-2">
              {isSupported && (
                <Button
                  variant={isListening ? 'terracotta' : 'secondary'}
                  size="sm"
                  onClick={toggleMic}
                  leftIcon={isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-castle" />}
                  className="min-h-[38px] text-xs font-bold"
                >
                  {isListening ? 'Listening...' : 'Voice Auto-Detect'}
                </Button>
              )}
              {!isSupported && (
                <span className="px-3 py-1 bg-paper border border-hairline rounded-lg text-xs font-body text-muted">
                  Voice not supported in this browser
                </span>
              )}
            </div>

            {/* Teacher Fast Score Buttons */}
            <div className="bg-white/95 border-2 border-purple-200 rounded-2xl p-4 shadow-soft-xs">
              <p className="text-[11px] font-display font-extrabold text-purple-900 uppercase tracking-wider mb-2.5">
                Teacher Fast Score (Guarantees 100% classroom uptime)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="sage"
                  size="md"
                  onClick={() => handleScore(true)}
                  leftIcon={<ThumbsUp className="w-5 h-5" />}
                  className="min-h-[48px] text-xs font-extrabold uppercase tracking-wider"
                >
                  {language === 'hi' ? 'सही पढ़ा (Fluent)' : 'Read Correctly'}
                </Button>
                <Button
                  variant="terracotta"
                  size="md"
                  onClick={() => handleScore(false)}
                  leftIcon={<ThumbsDown className="w-5 h-5" />}
                  className="min-h-[48px] text-xs font-extrabold uppercase tracking-wider"
                >
                  {language === 'hi' ? 'हिचकिचाहट / त्रुटि' : 'Hesitated / Error'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Universal Camera Air Gesture Wand */}
      <UniversalAirWand accentColor="#5E527F" />
    </div>
  );
};

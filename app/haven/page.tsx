'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VisualSchedule } from '@/components/ui/VisualSchedule';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { ArrowLeft, Sparkles, Volume2, PenTool, Star, Moon, Sun, RotateCcw, Check, Home } from 'lucide-react';
import { saveHavenSession } from '@/lib/firebase';
import { useHavenAnnouncer } from '@/lib/announcer';

export default function HavenPage() {
  const { t, language } = useTranslation();
  const { announceStepStart, announceStepComplete, announceHint } = useHavenAnnouncer();

  const [hasStarted, setHasStarted] = useState(false);
  const [nickname, setNickname] = useState('');
  const [currentStep, setCurrentStep] = useState(0); // 0 = Sound, 1 = Tracing, 2 = Star Count, 3 = Complete
  const [sensoryCalm, setSensoryCalm] = useState(false);

  // Mini-Game 1: Sound Spark
  const [soundAnswered, setSoundAnswered] = useState(false);
  const [soundHintShown, setSoundHintShown] = useState(false);

  // Mini-Game 2: Tracing
  const [tracingDone, setTracingDone] = useState(false);

  // Mini-Game 3: Star Count (Subitizing)
  const [leftStarsCount, setLeftStarsCount] = useState(5);
  const [rightStarsCount, setRightStarsCount] = useState(3);
  const [starCountDone, setStarCountDone] = useState(false);

  const steps = [
    { id: 1, label: t('haven.step1'), subtitle: 'Listen & Pick', icon: <Volume2 className="w-5 h-5" /> },
    { id: 2, label: t('haven.step2'), subtitle: 'Follow the Glow', icon: <PenTool className="w-5 h-5" /> },
    { id: 3, label: t('haven.step3'), subtitle: 'Find More Stars', icon: <Star className="w-5 h-5" /> },
  ];

  // Vygotsky ZPD Scaffolding Timer for Step 1
  useEffect(() => {
    if (hasStarted && currentStep === 0 && !soundAnswered) {
      const timer = setTimeout(() => {
        setSoundHintShown(true);
        announceHint('Hint: The sounds /s/ + /u/ + /n/ make sun.');
      }, 2800); // 2.8s hesitation threshold
      return () => clearTimeout(timer);
    }
  }, [hasStarted, currentStep, soundAnswered, announceHint]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setHasStarted(true);
    announceStepStart(t('haven.step1'), 1, 3);
  };

  const handleStep1Success = () => {
    setSoundAnswered(true);
    announceStepComplete(t('haven.step1'), 1, 3);
    setTimeout(() => {
      setCurrentStep(1);
      announceStepStart(t('haven.step2'), 2, 3);
    }, 1000);
  };

  const handleStep2Success = () => {
    setTracingDone(true);
    announceStepComplete(t('haven.step2'), 2, 3);
    setTimeout(() => {
      setCurrentStep(2);
      announceStepStart(t('haven.step3'), 3, 3);
    }, 1000);
  };

  const handleStep3Success = () => {
    setStarCountDone(true);
    announceStepComplete(t('haven.step3'), 3, 3);
    setTimeout(() => {
      setCurrentStep(3);
      saveHavenSession({
        dayId: `haven-${Date.now()}`,
        childNickname: nickname,
        completedAt: Date.now(),
        stepsCompleted: 3,
        scaffoldingUsedCount: soundHintShown ? 1 : 0,
        sensoryCalmEnabled: sensoryCalm,
        soundForestCompleted: true,
        tracingCompleted: true,
        starCountCompleted: true,
      });
    }, 1000);
  };

  return (
    <div className={`min-h-screen bg-paper flex flex-col justify-between p-4 md:p-8 ${sensoryCalm ? 'sensory-calm' : ''}`}>
      {/* Compact context bar: keeps the daily practice experience calm. */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-7 border-b border-black/8">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted hover:text-amber transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7"><Image src="/lumora_logo_transparent.png" alt="Lumora" fill className="object-contain" /></div>
          <span className="font-display font-semibold tracking-[-0.03em] text-[17px] text-ink">My Haven</span>
        </div>

        <button
          onClick={() => setSensoryCalm(!sensoryCalm)}
          aria-pressed={sensoryCalm}
          className={`min-h-[40px] px-3 rounded-xl border flex items-center gap-2 font-body text-[13px] font-medium transition-all ${
            sensoryCalm ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-hairline hover:border-amber'
          }`}
        >
          {sensoryCalm ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber" />}
          <span className="hidden sm:inline">{t('haven.calmMode')}</span>
        </button>
      </header>

      {/* Main Haven Experience */}
      <main id="main-content" className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center">
        {/* Step 0: Welcome / Nickname */}
        {!hasStarted ? (
          <div className="max-w-md mx-auto w-full">
            <Card className="p-6 md:p-10 border-2 border-sage/40 shadow-soft-md text-center">
              <LanternMascot mood="neutral" size={100} speechBubble="Hello, friend! Ready for a 3-minute quest?" />

              <h1 className="text-2xl md:text-3xl font-extrabold font-display text-ink mt-4">
                {t('haven.welcome')}
              </h1>
              <p className="text-sm font-body text-muted mt-1 mb-6">
                A calm, private space to practice every day.
              </p>

              <form onSubmit={handleStart} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder={t('haven.enterName')}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full min-h-[56px] px-4 rounded-2xl border-2 border-hairline font-display text-lg text-ink text-center focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/20"
                />

                <Button type="submit" variant="sage" size="lg" fullWidth rightIcon={<Sparkles className="w-5 h-5" />}>
                  {t('haven.startQuest')}
                </Button>
              </form>
            </Card>
          </div>
        ) : currentStep < 3 ? (
          <div className="space-y-6">
            {/* Visual Schedule Bar */}
            <VisualSchedule steps={steps} currentStepIndex={currentStep} />

            {/* Step 1: Sound Spark */}
            {currentStep === 0 && (
              <Card className="bg-gradient-to-b from-forest-light/10 to-white p-6 md:p-10 border-2 border-forest/30 text-center space-y-6">
                <LanternMascot
                  mood={soundAnswered ? 'celebrating' : 'encouraging'}
                  size={80}
                  speechBubble={
                    soundHintShown
                      ? 'Hint: The sounds /s/ + /u/ + /n/ make...'
                      : 'Listen to the spark: /s/ + /u/ + /n/'
                  }
                />

                <h3 className="text-2xl font-bold font-display text-ink">
                  Blend the Sounds: /s/ /u/ /n/
                </h3>

                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                  {['sun', 'run', 'nut'].map((word, idx) => {
                    const isCorrect = word === 'sun';
                    const isFadedOut = soundHintShown && word === 'nut';

                    return (
                      <button
                        key={idx}
                        onClick={handleStep1Success}
                        disabled={isFadedOut}
                        className={`min-h-[64px] rounded-2xl border-2 font-display font-bold text-xl transition-all shadow-soft-sm ${
                          isFadedOut
                            ? 'opacity-20 border-hairline bg-paper'
                            : 'bg-white border-hairline hover:border-forest text-ink hover:bg-forest-light/10'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Step 2: Tracing Glow */}
            {currentStep === 1 && (
              <Card className="bg-gradient-to-b from-realm-light/10 to-white p-6 md:p-10 border-2 border-realm/30 text-center space-y-6">
                <LanternMascot mood="encouraging" size={80} speechBubble="Trace the gentle star curve!" />

                <h3 className="text-2xl font-bold font-display text-ink">
                  Trace the Letter: &quot;m&quot;
                </h3>

                <div className="w-56 h-56 mx-auto bg-white border-4 border-realm/40 rounded-3xl flex items-center justify-center relative shadow-inner">
                  <span className="font-display font-extrabold text-8xl text-realm opacity-30 select-none">
                    m
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-display font-bold text-muted bg-white/80 px-3 py-1 rounded-full animate-pulse">
                      ✍️ Trace smoothly with your finger
                    </span>
                  </div>
                </div>

                <Button variant="sage" size="md" onClick={handleStep2Success} rightIcon={<Check className="w-5 h-5" />}>
                  I Traced It!
                </Button>
              </Card>
            )}

            {/* Step 3: Star Count (Subitizing) */}
            {currentStep === 2 && (
              <Card className="bg-gradient-to-b from-sunshine-50 to-white p-6 md:p-10 border-2 border-sunshine/50 text-center space-y-6">
                <LanternMascot mood="encouraging" size={80} speechBubble="Which cloud has MORE glowing stars?" />

                <h3 className="text-2xl font-bold font-display text-ink">
                  Tap the Cloud with MORE Stars
                </h3>

                <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                  {/* Left Cloud (5 stars) */}
                  <button
                    onClick={handleStep3Success}
                    className="min-h-[140px] p-6 bg-white border-2 border-amber/40 hover:border-amber rounded-3xl flex flex-wrap items-center justify-center gap-2 shadow-soft-sm hover:shadow-amber-glow transition-all active:scale-95"
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-8 h-8 text-amber fill-amber animate-bounce-gentle" />
                    ))}
                  </button>

                  {/* Right Cloud (3 stars) */}
                  <button
                    onClick={() => {}}
                    className="min-h-[140px] p-6 bg-white border-2 border-hairline hover:border-amber/30 rounded-3xl flex flex-wrap items-center justify-center gap-2 shadow-soft-sm transition-all opacity-80"
                  >
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className="w-8 h-8 text-amber-300 fill-amber-300" />
                    ))}
                  </button>
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* Step 4: Celebration Complete */
          <div className="max-w-md mx-auto w-full text-center space-y-6">
            <Card className="p-8 md:p-12 border-2 border-amber shadow-amber-glow bg-gradient-to-b from-amber-50 to-white">
              <LanternMascot mood="celebrating" size={140} />

              <h2 className="text-3xl font-extrabold font-display text-ink mt-4">
                {t('haven.greatJob')}
              </h2>
              <p className="text-base font-body text-muted mt-2 mb-6">
                {t('haven.questComplete')} See you tomorrow, <strong>{nickname}</strong>!
              </p>

              <div className="flex flex-col gap-3">
                <Button variant="primary" size="lg" onClick={() => setCurrentStep(0)} leftIcon={<RotateCcw className="w-5 h-5" />}>
                  Play Again
                </Button>
                <Link href="/">
                  <Button variant="secondary" size="md" fullWidth leftIcon={<Home className="w-5 h-5" />}>
                    Return Home
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-6 text-center text-xs text-muted font-body">
        My Haven · Vygotsky ZPD Adaptive Practice Companion · 100% Client-Side Safe
      </footer>
    </div>
  );
}

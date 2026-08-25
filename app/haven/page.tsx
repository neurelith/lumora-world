'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VisualSchedule } from '@/components/ui/VisualSchedule';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { PrintableReportCard } from '@/components/ui/PrintableReportCard';
import { HarmonicFlowCanvas } from '@/components/ui/HarmonicFlowCanvas';
import {
  ArrowLeft,
  Sparkles,
  Volume2,
  PenTool,
  Star,
  Moon,
  Sun,
  RotateCcw,
  Check,
  Home,
  Flame,
  Award,
  Eye,
  BookOpen,
  Brain,
  Printer,
  HeartHandshake,
} from 'lucide-react';
import { saveHavenSession } from '@/lib/firebase';
import { useHavenAnnouncer } from '@/lib/announcer';

export default function HavenPage() {
  const { t, language } = useTranslation();
  const { announceStepStart, announceStepComplete, announceHint } = useHavenAnnouncer();

  const [hasStarted, setHasStarted] = useState(false);
  const [nickname, setNickname] = useState('');
  const [currentStep, setCurrentStep] = useState(0); // 0..4 (5 quests), 5 = Daily Complete
  const [sensoryCalm, setSensoryCalm] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);
  const [streakDays, setStreakDays] = useState(3);
  const [totalStars, setTotalStars] = useState(4);

  // Quest 1: Sound Forest (Phoneme Blend)
  const [soundAnswered, setSoundAnswered] = useState(false);
  const [soundHintShown, setSoundHintShown] = useState(false);

  // Quest 2: Rune Realm (Tracing)
  const [tracingDone, setTracingDone] = useState(false);

  // Quest 3: Vision Valley (Star Pursuit)
  const [starCountDone, setStarCountDone] = useState(false);

  // Quest 4: Story Castle (Word Read-Along)
  const [storyDone, setStoryDone] = useState(false);

  // Quest 5: Memory Mountains (Gem Recall)
  const [memoryDone, setMemoryDone] = useState(false);
  const [selectedGem, setSelectedGem] = useState<number | null>(null);

  const steps = [
    { id: 1, label: 'Sound Forest', subtitle: 'Listen & Pick', icon: <Volume2 className="w-4 h-4" /> },
    { id: 2, label: 'Rune Realm', subtitle: 'Follow the Glow', icon: <PenTool className="w-4 h-4" /> },
    { id: 3, label: 'Vision Valley', subtitle: 'Star Spotter', icon: <Eye className="w-4 h-4" /> },
    { id: 4, label: 'Story Castle', subtitle: 'Word Magic', icon: <BookOpen className="w-4 h-4" /> },
    { id: 5, label: 'Memory Mount', subtitle: 'Gem Recall', icon: <Brain className="w-4 h-4" /> },
  ];

  // Scaffolding Timer for Sound Forest
  useEffect(() => {
    if (hasStarted && currentStep === 0 && !soundAnswered) {
      const timer = setTimeout(() => {
        setSoundHintShown(true);
        announceHint('Hint: The sounds /s/ + /u/ + /n/ make sun.');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, currentStep, soundAnswered, announceHint]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setHasStarted(true);
    announceStepStart('Sound Forest', 1, 5);
  };

  const advanceQuest = (nextStepIdx: number) => {
    setTotalStars((s) => s + 1);
    setCurrentStep(nextStepIdx);

    if (nextStepIdx < 5) {
      announceStepStart(steps[nextStepIdx].label, nextStepIdx + 1, 5);
    } else {
      // Completed all 5 daily quests!
      saveHavenSession({
        dayId: `haven-${Date.now()}`,
        childNickname: nickname,
        completedAt: Date.now(),
        stepsCompleted: 5,
        scaffoldingUsedCount: soundHintShown ? 1 : 0,
        sensoryCalmEnabled: sensoryCalm,
        soundForestCompleted: true,
        tracingCompleted: true,
        starCountCompleted: true,
      });
    }
  };

  return (
    <div
      className={`min-h-screen bg-paper flex flex-col justify-between p-4 sm:p-6 md:p-8 transition-colors duration-500 ${
        sensoryCalm ? 'sensory-calm' : ''
      }`}
    >
      {/* Context Top Navigation Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-5 border-b border-hairline">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-display font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        {/* Streak & Star Counter Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber/30 rounded-full shadow-soft-xs">
            <Flame className="w-4 h-4 text-terracotta fill-terracotta animate-bounce-gentle" />
            <span className="font-display font-extrabold text-xs text-ink">{streakDays} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-sunshine-50 border border-sunshine rounded-full shadow-soft-xs">
            <Star className="w-4 h-4 text-amber fill-amber" />
            <span className="font-display font-extrabold text-xs text-ink">{totalStars} Stars</span>
          </div>
        </div>

        {/* Calm Mode Toggle */}
        <button
          onClick={() => setSensoryCalm(!sensoryCalm)}
          aria-pressed={sensoryCalm}
          title="Toggle Sensory Calm Mode"
          className={`min-h-[44px] px-3.5 rounded-2xl border-2 flex items-center gap-2 font-display text-xs font-bold transition-all ${
            sensoryCalm
              ? 'bg-ink text-white border-ink shadow-soft-sm'
              : 'bg-white text-ink border-hairline hover:border-amber hover:shadow-soft-xs'
          }`}
        >
          {sensoryCalm ? <Moon className="w-4 h-4 text-amber-300 fill-amber-300" /> : <Sun className="w-4 h-4 text-amber fill-amber" />}
          <span className="hidden sm:inline">{sensoryCalm ? 'Calm Mode Active' : 'Calm Mode'}</span>
        </button>
      </header>

      {/* Main Experience Body */}
      <main id="main-content" className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center py-6">
        {/* Printable Report Card Modal Overlay */}
        {showReportCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 overflow-y-auto">
            <PrintableReportCard
              childName={nickname || 'Explorer'}
              grade={2}
              completedQuests={['forest', 'realm', 'valley', 'castle', 'mountains']}
              streakDays={streakDays}
              totalStars={totalStars}
              onClose={() => setShowReportCard(false)}
            />
          </div>
        )}

        {/* State 0: Welcome Screen / Nickname Input */}
        {!hasStarted ? (
          <div className="max-w-md mx-auto w-full">
            <Card className="p-6 sm:p-10 pt-14 sm:pt-16 border-2 border-sage/40 shadow-soft-md text-center bg-gradient-to-b from-sage/10 via-white to-paper">
              <div className="pt-2 pb-1 flex justify-center">
                <LanternMascot mood="encouraging" size={100} speechBubble="Hello, friend! Ready for today's 3-minute adventure?" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-ink mt-4">
                {t('haven.welcome')}
              </h1>
              <p className="text-sm font-body text-muted mt-1 mb-6">
                A calm, joyful space to practice five magical worlds every day.
              </p>

              <form onSubmit={handleStart} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder={t('haven.enterName')}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full min-h-[56px] px-4 rounded-2xl border-2 border-hairline font-display text-lg text-ink text-center focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/20 bg-white"
                />

                <Button type="submit" variant="sage" size="lg" fullWidth rightIcon={<Sparkles className="w-5 h-5" />}>
                  {t('haven.startQuest')}
                </Button>
              </form>
            </Card>
          </div>
        ) : currentStep < 5 ? (
          /* Active Quests */
          <div className="space-y-6">
            {/* Visual Schedule Tracker */}
            <VisualSchedule steps={steps} currentStepIndex={currentStep} />

            {/* Quest 1: Sound Forest (Phoneme Blend) */}
            {currentStep === 0 && (
              <Card className="bg-gradient-to-b from-forest-light/15 via-white to-paper p-6 sm:p-10 pt-14 sm:pt-16 border-2 border-forest/30 text-center space-y-6 shadow-soft-md">
                <div className="pt-2 pb-1 flex justify-center">
                  <LanternMascot
                    mood={soundAnswered ? 'celebrating' : 'encouraging'}
                    size={84}
                    speechBubble={
                      soundHintShown
                        ? 'Hint: The sounds /s/ + /u/ + /n/ make...'
                        : 'Listen to the forest spark: /s/ + /u/ + /n/'
                    }
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-display font-extrabold uppercase tracking-widest text-forest">
                    🌲 Quest 1 &middot; Sound Forest
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-ink">
                    Blend the Sounds: /s/ /u/ /n/
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-3.5 max-w-md mx-auto">
                  {['sun', 'run', 'nut'].map((word, idx) => {
                    const isCorrect = word === 'sun';
                    const isFadedOut = soundHintShown && word === 'nut';

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSoundAnswered(true);
                          announceStepComplete('Sound Forest', 1, 5);
                          setTimeout(() => advanceQuest(1), 900);
                        }}
                        disabled={isFadedOut}
                        className={`min-h-[72px] rounded-2xl border-2 font-display font-extrabold text-2xl transition-all shadow-soft-sm ${
                          isFadedOut
                            ? 'opacity-20 border-hairline bg-paper'
                            : 'bg-white border-hairline hover:border-forest text-ink hover:bg-forest-light/10 active:scale-95'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Quest 2: Rune Realm (Letter Trace) */}
            {currentStep === 1 && (
              <Card className="bg-gradient-to-b from-realm-light/15 via-white to-paper p-6 sm:p-8 pt-12 sm:pt-14 border-2 border-realm/30 text-center space-y-5 shadow-soft-md">
                <div className="pt-2 pb-1">
                  <LanternMascot
                    mood={tracingDone ? 'celebrating' : 'encouraging'}
                    size={80}
                    speechBubble={
                      tracingDone
                        ? 'Magical trace complete!'
                        : 'Trace the gentle mountain letter "m"!'
                    }
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-display font-extrabold uppercase tracking-widest text-realm">
                    ✍️ Quest 2 &middot; Rune Realm
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-ink">
                    Trace the Letter: &quot;m&quot;
                  </h3>
                </div>

                <div className="relative w-full flex justify-center">
                  <HarmonicFlowCanvas
                    width={360}
                    height={360}
                    targetLetter="m"
                    enableCameraAirControl={true}
                    onStrokeFinish={() => {
                      setTracingDone(true);
                      announceStepComplete('Rune Realm', 2, 5);
                      setTimeout(() => advanceQuest(2), 1000);
                    }}
                  />
                </div>

                <Button
                  variant="sage"
                  size="lg"
                  onClick={() => {
                    setTracingDone(true);
                    announceStepComplete('Rune Realm', 2, 5);
                    advanceQuest(2);
                  }}
                  rightIcon={<Check className="w-5 h-5" />}
                  className="min-h-[56px] font-bold max-w-xs mx-auto"
                >
                  I Traced It! ✨
                </Button>
              </Card>
            )}

            {/* Quest 3: Vision Valley (Star Glide) */}
            {currentStep === 2 && (
              <Card className="bg-gradient-to-b from-valley-light/15 via-white to-paper p-6 sm:p-10 pt-14 sm:pt-16 border-2 border-valley/30 text-center space-y-6 shadow-soft-md">
                <div className="pt-2 pb-1 flex justify-center">
                  <LanternMascot mood="encouraging" size={84} speechBubble="Which constellation has MORE glowing stars?" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-display font-extrabold uppercase tracking-widest text-valley">
                    👁️ Quest 3 &middot; Vision Valley
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-ink">
                    Tap the Cloud with MORE Stars
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-5 max-w-md mx-auto">
                  {/* Left Cloud (5 stars) */}
                  <button
                    onClick={() => {
                      setStarCountDone(true);
                      announceStepComplete('Vision Valley', 3, 5);
                      advanceQuest(3);
                    }}
                    className="min-h-[140px] p-6 bg-white border-2 border-amber/40 hover:border-amber rounded-3xl flex flex-wrap items-center justify-center gap-2 shadow-soft-sm hover:shadow-amber-glow transition-all active:scale-95"
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-7 h-7 text-amber fill-amber animate-bounce-gentle" />
                    ))}
                  </button>

                  {/* Right Cloud (3 stars) */}
                  <button
                    onClick={() => {}}
                    className="min-h-[140px] p-6 bg-white border-2 border-hairline hover:border-amber/30 rounded-3xl flex flex-wrap items-center justify-center gap-2 shadow-soft-sm transition-all opacity-80"
                  >
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className="w-7 h-7 text-amber-300 fill-amber-300" />
                    ))}
                  </button>
                </div>
              </Card>
            )}

            {/* Quest 4: Story Castle (Word Magic) */}
            {currentStep === 3 && (
              <Card className="bg-gradient-to-b from-castle-light/15 via-white to-paper p-6 sm:p-10 pt-14 sm:pt-16 border-2 border-castle/30 text-center space-y-6 shadow-soft-md">
                <div className="pt-2 pb-1 flex justify-center">
                  <LanternMascot mood="encouraging" size={84} speechBubble="Read this magical creature word aloud!" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-display font-extrabold uppercase tracking-widest text-castle">
                    🏰 Quest 4 &middot; Story Castle
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-ink">
                    Say the Word: &quot;BAP&quot;
                  </h3>
                </div>

                <div className="p-8 bg-white border-2 border-castle/30 rounded-3xl max-w-xs mx-auto shadow-inner">
                  <span className="font-display font-extrabold text-6xl text-castle tracking-widest">
                    BAP
                  </span>
                  <p className="text-xs font-body text-muted mt-2">/b/ + /æ/ + /p/</p>
                </div>

                <Button
                  variant="sage"
                  size="lg"
                  onClick={() => {
                    setStoryDone(true);
                    announceStepComplete('Story Castle', 4, 5);
                    advanceQuest(4);
                  }}
                  rightIcon={<Check className="w-5 h-5" />}
                  className="min-h-[56px] font-bold"
                >
                  I Said It Aloud! 🗣️
                </Button>
              </Card>
            )}

            {/* Quest 5: Memory Mountains (Gem Recall) */}
            {currentStep === 4 && (
              <Card className="bg-gradient-to-b from-mountains-light/15 via-white to-paper p-6 sm:p-10 pt-14 sm:pt-16 border-2 border-mountains/30 text-center space-y-6 shadow-soft-md">
                <div className="pt-2 pb-1 flex justify-center">
                  <LanternMascot mood="encouraging" size={84} speechBubble="Find the glowing Purple Gem from memory!" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-display font-extrabold uppercase tracking-widest text-mountains">
                    🧠 Quest 5 &middot; Memory Mountains
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-ink">
                    Pick the Purple Diamond
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                  {[
                    { id: 1, color: 'bg-emerald-400', label: 'Emerald' },
                    { id: 2, color: 'bg-purple-500', label: 'Purple Diamond' },
                    { id: 3, color: 'bg-amber-400', label: 'Amber' },
                  ].map((gem) => (
                    <button
                      key={gem.id}
                      onClick={() => {
                        setSelectedGem(gem.id);
                        if (gem.id === 2) {
                          setMemoryDone(true);
                          announceStepComplete('Memory Mountains', 5, 5);
                          advanceQuest(5);
                        }
                      }}
                      className={`min-h-[90px] rounded-2xl border-2 flex items-center justify-center transition-all shadow-soft-sm active:scale-95 ${
                        gem.id === 2
                          ? 'border-purple-300 hover:border-purple-500 bg-purple-50'
                          : 'border-hairline bg-white hover:bg-paper'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${gem.color} shadow-soft-xs transform rotate-45`} />
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* State 5: "That's Enough for Today" Fatigue Guard & Celebration */
          <div className="max-w-lg mx-auto w-full text-center space-y-6">
            <Card className="p-8 sm:p-12 border-2 border-amber/50 shadow-soft-lg bg-gradient-to-b from-amber-50 via-white to-paper">
              <LanternMascot mood="sleepy" size={130} />

              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100/80 text-amber-900 rounded-full text-xs font-display font-extrabold tracking-wider uppercase mt-3">
                🌟 Daily Goal Completed!
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-ink mt-3">
                That&apos;s Enough for Today!
              </h2>

              <p className="text-base font-body text-muted mt-2 mb-6 leading-relaxed">
                Great job today, <strong>{nickname}</strong>! You&apos;ve earned your daily golden stars and kept your streak alive. Rest your eyes and see you tomorrow!
              </p>

              {/* Weekly Streak Tracker */}
              <div className="p-4 bg-paper rounded-2xl border border-hairline mb-6">
                <div className="flex items-center justify-between text-xs font-display font-bold text-muted mb-2">
                  <span>Weekly Streak</span>
                  <span className="text-terracotta flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-terracotta" /> {streakDays} Days in a Row!
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                    <div
                      key={idx}
                      className={`h-9 rounded-xl flex items-center justify-center font-display font-bold text-xs ${
                        idx < 3
                          ? 'bg-amber text-ink shadow-soft-xs'
                          : idx === 3
                          ? 'bg-amber-100 text-amber-800 border-2 border-amber-400'
                          : 'bg-white border border-hairline text-muted/40'
                      }`}
                    >
                      {idx < 3 ? '✓' : day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowReportCard(true)}
                  leftIcon={<Printer className="w-5 h-5" />}
                >
                  Print Report Card
                </Button>
                <Link href="/" className="w-full">
                  <Button variant="secondary" size="lg" fullWidth leftIcon={<Home className="w-5 h-5" />}>
                    Done / Return Home
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-4 text-center text-xs text-muted font-body">
        My Haven &middot; 5-World Adaptive Daily Companion &middot; 100% In-Memory Privacy
      </footer>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { DyutiLogoMark } from '@/components/ui/DyutiLogoMark';
import { SoundForest } from '@/components/screening/SoundForest';
import { StoryCastle } from '@/components/screening/StoryCastle';
import { RuneRealm } from '@/components/screening/RuneRealm';
import { MemoryMountains } from '@/components/screening/MemoryMountains';
import { VisionValley } from '@/components/screening/VisionValley';
import { ResultsCard } from '@/components/screening/ResultsCard';
import {
  ScreeningSession,
  Language,
  SoundForestResult,
  StoryCastleResult,
  RuneRealmResult,
  MemoryMountainsResult,
  VisionValleyResult
} from '@/lib/types';
import { computeOverallTriage } from '@/lib/scoring';
import { saveScreeningSession } from '@/lib/firebase';
import { ArrowLeft, Compass, Sparkles, ChevronRight, Home } from 'lucide-react';
import { useScreeningAnnouncer } from '@/lib/announcer';

type ScreeningStep = 'consent' | 'intake' | 'soundForest' | 'storyCastle' | 'runeRealm' | 'memoryMountains' | 'visionValley' | 'transition' | 'results';

export default function ScreeningPage() {
  const { t, language, setLanguage } = useTranslation();
  const { announceWorldStart, announceWorldComplete, announceResults } = useScreeningAnnouncer();

  // Intake State — G1 consent gate per Final Spec + Brand Kit §10
  const [step, setStep] = useState<ScreeningStep>('consent');
  const [consentChecked, setConsentChecked] = useState(false);
  const [childInitials, setChildInitials] = useState('');
  const [grade, setGrade] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [schoolCode, setSchoolCode] = useState('SCH-001');

  // Transition interstitial state
  const [nextWorldName, setNextWorldName] = useState('');
  const [nextStepTarget, setNextStepTarget] = useState<ScreeningStep>('soundForest');

  // Completed Session Battery State
  const [session, setSession] = useState<Partial<ScreeningSession>>({
    id: `sess-${Date.now()}`,
    childInitials: '',
    grade: 1,
    language: 'en',
    schoolCode: 'SCH-001',
    createdAt: Date.now(),
  });

  const handleStartBattery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childInitials.trim()) return;

    setLanguage(selectedLanguage);
    const initialSession: Partial<ScreeningSession> = {
      id: `sess-${Date.now()}`,
      childInitials: childInitials.toUpperCase().trim(),
      grade,
      language: selectedLanguage,
      schoolCode: schoolCode.trim() || 'SCH-001',
      createdAt: Date.now(),
    };

    setSession(initialSession);
    triggerTransition('soundForest', t('worlds.soundForest'));
  };

  const triggerTransition = (target: ScreeningStep, worldTitle: string) => {
    setNextStepTarget(target);
    setNextWorldName(worldTitle);
    setStep('transition');

    // Announce transition start
    const worldNames: Record<ScreeningStep, string> = {
      consent: 'consent',
      intake: 'intake',
      soundForest: t('worlds.soundForest'),
      storyCastle: t('worlds.storyCastle'),
      runeRealm: t('worlds.runeRealm'),
      memoryMountains: t('worlds.memoryMountains'),
      visionValley: t('worlds.visionValley'),
      transition: 'transition',
      results: 'results',
    };

    const worldNumber = ['soundForest', 'storyCastle', 'runeRealm', 'memoryMountains', 'visionValley'].indexOf(target) + 1;
    if (worldNumber > 0) {
      announceWorldStart(worldTitle, worldNumber, 5);
    }

    setTimeout(() => {
      setStep(target);
    }, 1500); // 1.5s spring transition
  };

  // World 1 Complete
  const handleSoundForestComplete = (result: SoundForestResult) => {
    const updated = { ...session, soundForest: result };
    setSession(updated);
    announceWorldComplete(t('worlds.soundForest'), 1, 5);
    triggerTransition('storyCastle', t('worlds.storyCastle'));
  };

  // World 2 Complete
  const handleStoryCastleComplete = (result: StoryCastleResult) => {
    const updated = { ...session, storyCastle: result };
    setSession(updated);
    announceWorldComplete(t('worlds.storyCastle'), 2, 5);
    triggerTransition('runeRealm', t('worlds.runeRealm'));
  };

  // World 3 Complete
  const handleRuneRealmComplete = (result: RuneRealmResult) => {
    const updated = { ...session, runeRealm: result };
    setSession(updated);
    announceWorldComplete(t('worlds.runeRealm'), 3, 5);
    triggerTransition('memoryMountains', t('worlds.memoryMountains'));
  };

  // World 4 Complete
  const handleMemoryMountainsComplete = (result: MemoryMountainsResult) => {
    const updated = { ...session, memoryMountains: result };
    setSession(updated);
    announceWorldComplete(t('worlds.memoryMountains'), 4, 5);
    triggerTransition('visionValley', t('worlds.visionValley'));
  };

  // World 5 Complete -> Finalize
  const handleVisionValleyComplete = async (result: VisionValleyResult) => {
    const updated = { ...session, visionValley: result };
    const overallTriage = computeOverallTriage(updated);
    const fullSession: ScreeningSession = {
      ...(updated as any),
      overallTriage,
    };

    setSession(fullSession);
    await saveScreeningSession(fullSession);
    announceWorldComplete(t('worlds.visionValley'), 5, 5);
    announceResults(overallTriage);
    setStep('results');
  };

  const screenOrder: ScreeningStep[] = ['soundForest', 'storyCastle', 'runeRealm', 'memoryMountains', 'visionValley'];
  const activeIndex = screenOrder.indexOf(step);
  const progress = step === 'results' ? 100 : activeIndex >= 0 ? ((activeIndex + 1) / screenOrder.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between p-4 md:p-8">
      {/* Quiet progress navigation: context without competing with the child’s task. */}
      <header className="max-w-5xl mx-auto w-full pb-7">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-amber">
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <DyutiLogoMark size={28} />
            <span className="font-display font-bold tracking-tight text-[17px] text-ink">
              Dyuti<span className="text-amber-600">Path</span> Screening
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="min-w-[82px] text-right text-[13px] font-medium text-muted">
              {step === 'intake' ? 'Ready' : step === 'results' ? 'Complete' : `World ${activeIndex + 1} of 5`}
            </div>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/8" aria-label={`Screening progress: ${Math.round(progress)}%`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-5xl mx-auto w-full flex flex-col justify-center" role="main">
        {/* ARIA live region for screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" id="screening-announcer" />

        {/* 0. Consent Gate -- Vibrant Cyan & Emerald Aurora Gradient */}
        {step === 'consent' && (
          <div className="max-w-xl mx-auto w-full">
            <Card variant="default" className="p-7 md:p-10 bg-gradient-to-br from-cyan-50/95 via-white to-emerald-50/80 border-2 border-b-4 border-cyan-300 rounded-3xl shadow-candy-cyan space-y-6">
              <div className="flex items-center gap-4 border-b border-cyan-100 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-soft-xs flex-shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <span className="inline-block text-[11px] font-display font-extrabold tracking-wider text-cyan-900 bg-cyan-100/90 border border-cyan-300 px-2.5 py-0.5 rounded-full uppercase">
                    Before we begin
                  </span>
                  <h1 className="mt-1 text-2xl md:text-[28px] font-extrabold font-display tracking-tight text-ink">
                    Consent &amp; Privacy
                  </h1>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-ink/80 font-body">
                <p>
                  DyutiPath tracks how a child interacts across five short activities and summarizes patterns for a teacher, parent, or specialist to review. It is an early screening check and does not replace a clinical diagnosis.
                </p>
                <p>
                  If an activity suggests extra attention is helpful, the recommended next step is an in-person conversation with a certified psychologist or educator.
                </p>
                <div className="rounded-2xl border-2 border-cyan-200/90 bg-gradient-to-r from-cyan-50/80 to-emerald-50/60 p-4 text-xs leading-5 text-cyan-950 font-medium">
                  <span className="font-extrabold text-cyan-950">What is stored:</span> student code, grade, language, and game scores (pseudonymous). Camera and audio processing happens entirely on this device and is never recorded or transmitted.
                </div>
                <label className="flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-all has-[input:checked]:border-teal-500 has-[input:checked]:bg-teal-50/60 border-cyan-200/80 bg-white/90 shadow-soft-xs">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded-md border-cyan-300 accent-teal-600"
                  />
                  <span className="text-sm font-bold text-ink leading-5">
                    I have informed the parent or guardian and have consent to proceed with this screening.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-5 py-3 text-xs font-display font-extrabold text-ink hover:bg-slate-50 active:translate-y-1 active:border-b-2 transition-all"
                >
                  Cancel
                </Link>
                <Button
                  disabled={!consentChecked}
                  onClick={() => setStep('intake')}
                  variant="success"
                  size="md"
                  fullWidth
                  className="flex-1 font-display font-extrabold uppercase tracking-wider text-xs"
                >
                  Continue to Check-In
                </Button>
              </div>

              <p className="text-center text-[11px] text-ink/50 font-medium">
                Sample Data (Demonstration Only): any report generated from this demo must retain this label when printed.
              </p>
            </Card>
          </div>
        )}

        {/* 1. Intake Screen -- Vibrant Aurora Styling */}
        {step === 'intake' && (
          <div className="max-w-xl mx-auto w-full">
            <Card variant="default" className="p-7 md:p-10 bg-gradient-to-br from-teal-50/90 via-white to-cyan-50/80 border-2 border-b-4 border-teal-300 rounded-3xl shadow-candy-cyan space-y-6">
              <div className="border-b border-teal-100 pb-5">
                <div className="flex items-center gap-4">
                  <LanternMascot mood="neutral" size={64} />
                  <div>
                    <span className="inline-block text-[11px] font-display font-extrabold text-teal-900 bg-teal-100/90 border border-teal-300 px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                      START A CHECK-IN
                    </span>
                    <h1 className="mt-1 text-2xl md:text-[28px] font-extrabold font-display tracking-tight text-ink">
                      {t('screening.entryTitle')}
                    </h1>
                  </div>
                </div>
                <p className="mt-3 text-sm font-body leading-relaxed text-ink/75">
                  15-minute, five-world learning check-in. Pseudonymous, offline-ready, and designed to guide teachers.
                </p>
              </div>

              <form onSubmit={handleStartBattery} className="space-y-5">
                {/* Child Initials */}
                <div>
                  <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink mb-2">
                    {t('screening.childInitials')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('screening.childInitialsPlaceholder')}
                    value={childInitials}
                    onChange={(e) => setChildInitials(e.target.value)}
                    className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-teal-200 bg-white font-display text-base text-ink focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 shadow-soft-xs"
                  />
                </div>

                {/* Grade Selection */}
                <div>
                  <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink mb-2">
                    {t('screening.selectGrade')}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        className={`min-h-[48px] rounded-2xl border-2 border-b-4 font-display font-extrabold text-base transition-all select-none active:translate-y-0.5 ${
                          grade === g
                            ? 'bg-gradient-to-b from-teal-500 to-cyan-600 text-white border-teal-400 border-b-teal-800 shadow-candy-cyan scale-102'
                            : 'bg-white text-ink border-slate-200 border-b-slate-300 hover:border-teal-300 hover:bg-teal-50/50'
                        }`}
                      >
                        G{g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink mb-2">
                    {t('screening.selectLanguage')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('en')}
                      className={`min-h-[48px] rounded-2xl border-2 border-b-4 font-display font-extrabold text-sm transition-all select-none active:translate-y-0.5 ${
                        selectedLanguage === 'en'
                          ? 'bg-gradient-to-b from-teal-500 to-cyan-600 text-white border-teal-400 border-b-teal-800 shadow-candy-cyan'
                          : 'bg-white text-ink border-slate-200 border-b-slate-300 hover:border-teal-300 hover:bg-teal-50/50'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('hi')}
                      className={`min-h-[48px] rounded-2xl border-2 border-b-4 font-display font-extrabold text-sm transition-all select-none active:translate-y-0.5 ${
                        selectedLanguage === 'hi'
                          ? 'bg-gradient-to-b from-teal-500 to-cyan-600 text-white border-teal-400 border-b-teal-800 shadow-candy-cyan'
                          : 'bg-white text-ink border-slate-200 border-b-slate-300 hover:border-teal-300 hover:bg-teal-50/50'
                      }`}
                    >
                      हिन्दी (Devanagari)
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  rightIcon={<ChevronRight className="w-5 h-5" />}
                  className="font-display font-extrabold uppercase tracking-wider"
                >
                  {t('screening.startBattery')}
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* 2. World Interstitial Transition */}
        {step === 'transition' && (
          <div className="flex flex-col items-center justify-center text-center py-16 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
              <LanternMascot mood="celebrating" size={130} />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-display font-extrabold uppercase tracking-widest text-orange-600 bg-orange-100 px-4 py-1.5 rounded-full border border-orange-300 shadow-soft-xs">
                Journeying to Next World...
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold font-display text-ink animate-bounce-gentle py-2">
                {nextWorldName}
              </h2>
            </div>
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* 3. Five Worlds Modules */}
        {step === 'soundForest' && (
          <SoundForest
            grade={grade}
            language={selectedLanguage}
            onComplete={handleSoundForestComplete}
          />
        )}

        {step === 'storyCastle' && (
          <StoryCastle
            grade={grade}
            language={selectedLanguage}
            onComplete={handleStoryCastleComplete}
          />
        )}

        {step === 'runeRealm' && (
          <RuneRealm
            grade={grade}
            language={selectedLanguage}
            onComplete={handleRuneRealmComplete}
          />
        )}

        {step === 'memoryMountains' && (
          <MemoryMountains
            grade={grade}
            language={selectedLanguage}
            onComplete={handleMemoryMountainsComplete}
          />
        )}

        {step === 'visionValley' && (
          <VisionValley
            grade={grade}
            language={selectedLanguage}
            onComplete={handleVisionValleyComplete}
          />
        )}

        {/* 4. Results Screen */}
        {step === 'results' && session.overallTriage && (
          <ResultsCard session={session as ScreeningSession} />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 text-center text-xs text-muted font-body">
        DyutiPath Classroom Screening Battery · Pseudonymous & Zero Biometric Transmission
      </footer>
    </div>
  );
}

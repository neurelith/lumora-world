'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanternMascot } from '@/components/ui/LanternMascot';
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
    <div className="min-h-screen bg-paper flex flex-col justify-between p-4 md:p-8">
      {/* Quiet progress navigation: context without competing with the child’s task. */}
      <header className="max-w-5xl mx-auto w-full pb-7">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-amber">
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7"><Image src="/lumora_logo_transparent.png" alt="Lumora" fill className="object-contain" /></div>
            <span className="font-display font-semibold tracking-[-0.03em] text-[17px] text-ink">Lumora Screening</span>
          </div>

          <div className="min-w-[82px] text-right text-[13px] font-medium text-muted">
            {step === 'intake' ? 'Ready' : step === 'results' ? 'Complete' : `World ${activeIndex + 1} of 5`}
          </div>
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-black/8" aria-label={`Screening progress: ${Math.round(progress)}%`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full rounded-full bg-amber transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-5xl mx-auto w-full flex flex-col justify-center" role="main">
        {/* ARIA live region for screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" id="screening-announcer" />

        {/* 0. Consent Gate -- G1 per Final Spec + Brand Kit 10 (locked) */}
        {step === 'consent' && (
          <div className="max-w-xl mx-auto w-full">
            <Card variant="gold" className="p-7 md:p-11 shadow-candy-amber">
              <div className="mb-7 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-soft-xs">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <p className="text-xs font-display font-extrabold tracking-widest text-amber-800 uppercase">Before we begin</p>
                  <h1 className="mt-1 text-2xl md:text-[28px] font-extrabold font-display tracking-tight text-ink">Consent &amp; Privacy</h1>
                </div>
              </div>
              <div className="space-y-4 text-[14px] leading-6 text-ink/80 font-body">
                <p>Lumora World tracks how a child plays across five activities and summarizes patterns for a teacher, parent, or specialist to review. It does not diagnose, and results should not be read as a medical or clinical assessment.</p>
                <p>If a pattern is flagged as &quot;worth a closer look&quot; or &quot;recommend follow-up,&quot; the next step is a conversation with a qualified professional -- not a number, and not a conclusion.</p>
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4 text-xs leading-5 text-amber-900 font-medium">
                  <span className="font-extrabold text-amber-950">What we store:</span> initials/code + grade + language + scores (pseudonymous). Camera frames and audio are processed in-memory on this device and are never recorded or transmitted.
                </div>
                <label className="flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-colors has-[input:checked]:border-amber-500 has-[input:checked]:bg-amber-100/50 border-hairline bg-white shadow-soft-xs">
                  <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} className="mt-1 h-5 w-5 rounded-md border-hairline accent-amber-500" />
                  <span className="text-sm font-bold text-ink leading-5">I have informed the parent/guardian and have consent to proceed with this screening check-in.</span>
                </label>
              </div>
              <div className="mt-6 flex gap-3">
                <a href="/" className="inline-flex items-center gap-2 rounded-2xl border-2 border-hairline bg-white px-5 py-2.5 text-sm font-bold text-ink hover:bg-sand/60 transition-colors">Cancel</a>
                <button
                  disabled={!consentChecked}
                  onClick={() => setStep('intake')}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 text-sm font-extrabold text-white uppercase tracking-wider transition-all shadow-candy-coral hover:brightness-105 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
                >
                  Continue to check-in
                </button>
              </div>
              <p className="mt-4 text-center text-[11px] text-ink/50 font-medium">Sample Data -- Demonstration Only: any report generated from this demo must retain this label when printed.</p>
            </Card>
          </div>
        )}

        {/* 1. Intake Screen */}
        {step === 'intake' && (
          <div className="max-w-xl mx-auto w-full">
            <Card variant="gold" className="p-7 md:p-11 shadow-candy-amber">
              <div className="mb-8 border-b-2 border-amber-200/60 pb-6">
                <div className="flex items-center gap-4">
                  <LanternMascot mood="neutral" size={66} />
                  <div>
                    <p className="text-xs font-display font-extrabold text-amber-800 tracking-wider uppercase">START A CHECK-IN</p>
                    <h1 className="mt-1 text-2xl md:text-[32px] font-extrabold font-display tracking-tight text-ink">
                      {t('screening.entryTitle')}
                    </h1>
                  </div>
                </div>
                <p className="mt-4 text-[15px] font-body leading-6 text-ink/80">15-minute, five-world learning check-in. Pseudonymous, offline-ready, and designed to guide—not diagnose.</p>
              </div>

              <form onSubmit={handleStartBattery} className="space-y-6">
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
                    className="w-full min-h-[56px] px-4 rounded-2xl border-2 border-amber-200 bg-white font-display text-lg text-ink focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 shadow-soft-xs"
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
                        className={`min-h-[52px] rounded-2xl border-2 font-display font-extrabold text-lg transition-all ${
                          grade === g
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-amber-400 shadow-candy-amber scale-105'
                            : 'bg-white text-ink border-amber-100 hover:border-amber-300'
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
                      className={`min-h-[52px] rounded-2xl border-2 font-display font-extrabold text-base transition-all ${
                        selectedLanguage === 'en'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-cyan-400 shadow-candy-cyan scale-102'
                          : 'bg-white text-ink border-amber-100 hover:border-amber-300'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('hi')}
                      className={`min-h-[52px] rounded-2xl border-2 font-display font-extrabold text-base transition-all ${
                        selectedLanguage === 'hi'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-cyan-400 shadow-candy-cyan scale-102'
                          : 'bg-white text-ink border-amber-100 hover:border-amber-300'
                      }`}
                    >
                      हिन्दी (Devanagari)
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button type="submit" variant="mountains" size="lg" fullWidth rightIcon={<ChevronRight className="w-5 h-5" />}>
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
        Lumora World Classroom Screening Battery · Pseudonymous & Zero Biometric Transmission
      </footer>
    </div>
  );
}

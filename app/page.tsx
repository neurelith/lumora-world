'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { LanternMascot } from '@/components/ui/LanternMascot';
import {
  ArrowRight,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Award,
  Globe2,
  Wand2,
  Play,
  Users,
  TrendingUp,
  BookOpen,
  Eye,
  Brain,
  Volume2,
  MapPinned,
  Star,
} from 'lucide-react';

export default function HomePage() {
  const { t, language, setLanguage } = useTranslation();
  const [activeWorld, setActiveWorld] = useState(0);

  const worlds = [
    {
      id: '/screening/rune-realm',
      name: t('worlds.runeRealm'),
      no: '01',
      line: 'Camera air-tracing · kinematics & letter strokes',
      desc: t('worlds.runeRealmSubtitle'),
      icon: Wand2,
      accent: 'bg-realm',
      accentSoft: 'bg-realm-soft',
      ring: 'ring-realm/25',
      dot: 'bg-realm',
      tag: 'Most magical — the wand',
    },
    {
      id: '/screening/sound-forest',
      name: t('worlds.soundForest'),
      no: '02',
      line: 'Phoneme blending · auditory sequencing',
      desc: t('worlds.soundForestSubtitle'),
      icon: Volume2,
      accent: 'bg-forest',
      accentSoft: 'bg-forest-soft',
      ring: 'ring-forest/25',
      dot: 'bg-forest',
      tag: 'Listen closely',
    },
    {
      id: '/screening/memory-mountains',
      name: t('worlds.memoryMountains'),
      no: '03',
      line: 'Rapid automatized naming · timed matrix',
      desc: t('worlds.memoryMountainsSubtitle'),
      icon: Brain,
      accent: 'bg-mountains',
      accentSoft: 'bg-mountains-soft',
      ring: 'ring-mountains/25',
      dot: 'bg-mountains',
      tag: 'Quick as you can',
    },
    {
      id: '/screening/story-castle',
      name: t('worlds.storyCastle'),
      no: '04',
      line: 'Nonword decoding · fluency practice',
      desc: t('worlds.storyCastleSubtitle'),
      icon: BookOpen,
      accent: 'bg-castle',
      accentSoft: 'bg-castle-soft',
      ring: 'ring-castle/25',
      dot: 'bg-castle',
      tag: 'Read the stones',
    },
    {
      id: '/screening/vision-valley',
      name: t('worlds.visionValley'),
      no: '05',
      line: 'Visual flow & reading pacing',
      desc: t('worlds.visionValleySubtitle'),
      icon: Eye,
      accent: 'bg-valley',
      accentSoft: 'bg-valley-soft',
      ring: 'ring-valley/25',
      dot: 'bg-valley',
      tag: 'Supplementary',
    },
  ];

  const active = worlds[activeWorld];
  const ActiveIcon = active.icon;

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ── Header · Apple glass nav ─────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-whisper bg-paper/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-8 h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image src="/lumora_logo_transparent.png" alt="Lumora World" fill className="object-contain" priority />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Lumora<span className="text-terracotta"> World</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm text-ink-secondary">
            <Link href="#worlds" className="transition-colors hover:text-ink">Worlds</Link>
            <Link href="#approach" className="transition-colors hover:text-ink">Approach</Link>
            <Link href="#privacy" className="transition-colors hover:text-ink">Privacy</Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center bg-white border border-whisper rounded-pill p-0.5 text-sm font-medium">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-pill transition-colors ${language === 'en' ? 'bg-ink text-white' : 'text-ink-secondary hover:text-ink'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-pill transition-colors ${language === 'hi' ? 'bg-ink text-white' : 'text-ink-secondary hover:text-ink'}`}
              >
                हि
              </button>
            </div>
            <Link
              href="/doctor"
              className="inline-flex items-center gap-1.5 rounded-pill border border-whisper bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink/30"
            >
              <Stethoscope className="h-4 w-4 text-ink-quaternary" />
              <span className="hidden sm:inline">Specialist Hub</span>
              <span className="sm:hidden">Hub</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero · cinematic, single focal element + mascot preview ──────────────── */}
      <section className="border-b border-whisper relative overflow-hidden">
        {/* ambient harmonic washes — teammate distill, not a 6th world */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-32 h-[420px] w-[520px] rounded-full bg-terracotta-soft opacity-40 blur-[70px]" />
          <div className="absolute top-32 -left-24 h-[360px] w-[360px] rounded-full bg-valley-soft opacity-30 blur-[70px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 md:px-8 pt-10 pb-16 md:pt-16 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 max-w-2xl">
              <p className="mb-6 inline-flex items-center gap-2 rounded-pill border border-whisper bg-white px-3 py-1 text-[13px] font-medium text-ink-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse-gentle" />
                Camera air-tracing — works on any classroom tablet
              </p>

              <h1 className="font-display text-[2.75rem] leading-[1.05] tracking-[-0.04em] sm:text-6xl md:text-[4.25rem] font-semibold text-ink">
                Learning,<br />
                <span className="relative inline-block">
                  seen.
                  <span className="absolute -right-3 -top-2 hidden sm:inline-flex">
                    <Star className="w-4 h-4 text-amber animate-pulse-gentle" />
                  </span>
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-secondary">
                Five gentle game worlds that paint letters, blend sounds and time naming in the air — capturing practice signals that help teachers flag a child who could benefit from a closer look.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/screening"
                  className="inline-flex items-center gap-2 rounded-pill bg-terracotta px-6 py-3 text-[17px] font-medium text-white shadow-[0_8px_24px_rgba(201,100,66,0.25)] transition-all hover:bg-terracotta-hover hover:shadow-[0_12px_32px_rgba(201,100,66,0.32)] active:scale-[0.97]"
                >
                  {t('app.startScreening')} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/screening/rune-realm"
                  className="inline-flex items-center gap-2 rounded-pill border border-whisper bg-white px-5 py-3 text-[15px] font-medium text-ink transition-colors hover:border-ink/30"
                >
                  <Wand2 className="h-4 w-4 text-terracotta" /> Try the magic wand
                </Link>
                <span className="text-xs text-ink-tertiary">15 min · pseudonymous · offline-ready</span>
              </div>
            </div>

            {/* Mascot island — immersive, not equal card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative bg-white border border-whisper rounded-hero p-6 shadow-card w-full max-w-[360px]">
                <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-amber-soft blur-2xl opacity-60" aria-hidden="true" />
                <div className="relative flex flex-col items-center text-center">
                  <LanternMascot mood="encouraging" size={96} speechBubble="Wave your finger — I follow!" />
                  <p className="mt-3 text-xs font-semibold tracking-widest text-ink-tertiary uppercase">Meet Lumi</p>
                  <p className="mt-1 text-sm leading-5 text-ink-secondary">
                                 Your guide through all five worlds. Hover the wand cursor — Lumi&apos;s eyes follow you.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-tertiary">
                    <MapPinned className="w-3.5 h-3.5 text-terracotta" /> 5 worlds · one journey
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Anchored evidence strip — left aligned with icons, not 3 equal cards */}
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-panel border border-whisper bg-whisper sm:grid-cols-3">
            <div className="bg-white p-6 flex gap-3">
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-button bg-terracotta-soft text-terracotta flex-shrink-0"><Users className="h-4 w-4" /></div>
              <div>
                <p className="font-display text-3xl font-semibold tracking-tight text-ink">~8<span className="text-terracotta">%</span></p>
                <p className="mt-1 text-sm text-ink-tertiary">Pooled SLD prevalence in Indian schoolchildren</p>
              </div>
            </div>
            <div className="bg-white p-6 flex gap-3">
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-button bg-sage-soft text-sage flex-shrink-0"><Stethoscope className="h-4 w-4" /></div>
              <div>
                <p className="font-display text-3xl font-semibold tracking-tight text-ink">3,890</p>
                <p className="mt-1 text-sm text-ink-tertiary">Registered clinical psychologists in India (RCI, 2024)</p>
              </div>
            </div>
            <div className="bg-white p-6 flex gap-3">
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-button bg-amber-soft text-amber flex-shrink-0"><TrendingUp className="h-4 w-4" /></div>
              <div>
                <p className="font-display text-3xl font-semibold tracking-tight text-ink">5–8<span className="text-terracotta"> yrs</span></p>
                <p className="mt-1 text-sm text-ink-tertiary">Critical primary window for early classroom triage</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three tiers · asymmetric weighted grid ──────────────── */}
      <section id="approach" className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold tracking-widest text-terracotta uppercase">How it fits together</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight text-ink">
              Three tiers of closed-loop support
            </h2>
            <p className="mt-3 text-[17px] text-ink-secondary">
              From classroom triage to daily home practice to specialist telemetry — one continuum, no gaps.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Tier 1 — feature card (wider) */}
            <article className="lg:col-span-6 rounded-panel border border-whisper bg-white p-8 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-button bg-terracotta text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="mt-5 text-[13px] font-medium uppercase tracking-wide text-ink-tertiary">Tier 1 · Teacher facilitated</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">{t('app.roleScreening')}</h3>
              <p className="mt-3 leading-relaxed text-ink-secondary text-sm">{t('app.roleScreeningDesc')} A 15-minute battery across five game worlds capturing motor, phonemic and naming signals.</p>
              <Link href="/screening" className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-terracotta hover:underline">
                Begin a check-in <ArrowRight className="h-4 w-4" />
              </Link>
            </article>

            {[
              { tier: 'Tier 2 · Child practice', title: t('app.roleHaven'), desc: t('app.roleHavenDesc'), to: '/haven', cta: t('app.enterHaven') },
              { tier: 'Tier 3 · Specialist telemetry', title: t('app.roleDoctor'), desc: t('app.roleDoctorDesc'), to: '/doctor', cta: t('app.openDoctorHub') },
            ].map((c) => (
              <article key={c.to} className="lg:col-span-3 rounded-panel border border-whisper bg-white p-8 flex flex-col">
                <div className="flex h-11 w-11 items-center justify-center rounded-button bg-paper border border-whisper text-ink">
                  {c.to === '/haven' ? <Sparkles className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
                </div>
                <p className="mt-5 text-[13px] font-medium uppercase tracking-wide text-ink-tertiary">{c.tier}</p>
                <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">{c.title}</h3>
                <p className="mt-3 mb-6 text-sm leading-relaxed text-ink-secondary">{c.desc}</p>
                <Link href={c.to} className="mt-auto inline-flex items-center gap-1.5 text-[15px] font-medium text-terracotta hover:underline">
                  {c.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Worlds · immersive quest map (DALI+Extra) ────────────────────── */}
      <section id="worlds" className="relative border-y border-whisper bg-white py-16 md:py-24 overflow-hidden">
        {/* ambient harmonic wash */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-paper opacity-60 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.14em] text-terracotta uppercase">Choose your path</p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight text-ink">
                The five exploratory worlds
              </h2>
              <p className="mt-3 text-[15px] leading-6 text-ink-secondary">
                Each practices a foundational skill, mapped to DALI (NBRC) frameworks. Follow the path in order for a full battery — or tap any world to try it alone. <span className="font-medium text-ink">Rune Realm&rsquo;s wand is the one camera world; the rest are reliable touch + voice.</span>
              </p>
            </div>
            <Link href="/screening" className="hidden md:inline-flex items-center gap-1.5 text-[15px] font-medium text-terracotta hover:underline">
              Run the full battery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Quest path — 7/5 asymmetry, footsteps narrative */}
            <div className="lg:col-span-7 relative">
              {/* vertical spine — desktop */}
              <div className="hidden lg:block absolute left-[28px] top-6 bottom-6 w-px bg-gradient-to-b from-terracotta/0 via-hairline to-terracotta/0" aria-hidden="true" />
              <div className="space-y-3">
                {worlds.map((w, i) => {
                  const Icon = w.icon;
                  const isActive = activeWorld === i;
                  const isSupp = w.no === '05';
                  return (
                    <button
                      key={w.id}
                      onClick={() => setActiveWorld(i)}
                      className={`group relative flex w-full items-center gap-4 rounded-panel border px-4 py-4 text-left transition-all ${isActive ? 'bg-paper border-terracotta/30 shadow-card' : 'bg-white border-whisper hover:bg-paper hover:border-hairline hover:shadow-sm'}`}
                    >
                      {/* node */}
                      <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-button border-2 transition-all ${isActive ? `${w.accent} text-white border-transparent shadow-[0_4px_14px_rgba(0,0,0,0.12)] scale-[1.02]` : `bg-white text-ink-tertiary border-whisper group-hover:text-ink group-hover:border-hairline`}`}>
                        <Icon className="h-5 w-5" />
                        {isActive && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber text-[10px] font-bold text-white shadow-sm">✓</span>}
                      </span>

                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2 flex-wrap">
                          <span className={`font-mono text-xs font-bold tracking-wide ${isActive ? 'text-terracotta' : 'text-ink-quaternary'}`}>{w.no}</span>
                          <span className="hidden sm:inline h-1 w-1 rounded-full bg-hairline" aria-hidden="true" />
                          <span className="font-display text-[15px] font-semibold tracking-tight text-ink">{w.name}</span>
                          {isSupp && <span className="rounded-pill bg-amber-soft border border-amber/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber uppercase">Supplementary</span>}
                          {isActive && !isSupp && <span className="hidden sm:inline-flex items-center gap-1 rounded-pill bg-terracotta-soft border border-terracotta/20 px-2 py-0.5 text-[11px] font-semibold text-terracotta">Active</span>}
                        </span>
                        <span className="block text-[13px] leading-5 text-ink-tertiary truncate">{w.line}</span>
                        <span className="block text-xs text-ink-tertiary mt-0.5 sm:hidden">{w.tag}</span>
                      </span>

                      <span className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <span className={`hidden lg:inline text-xs text-ink-quaternary group-hover:text-ink-tertiary ${isActive ? '!text-ink-tertiary' : ''}`}>{w.tag}</span>
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${isActive ? 'bg-white border-terracotta/20 text-terracotta' : 'bg-paper border-whisper text-ink-quaternary group-hover:text-ink-tertiary group-hover:border-hairline'}`}>
                          <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? 'translate-x-0' : 'group-hover:translate-x-0.5'}`} />
                        </span>
                      </span>

                      {/* active rail */}
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-full bg-terracotta hidden lg:block" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              {/* footprints hint + mobile CTA */}
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-paper border border-whisper px-3 py-1.5 text-xs font-medium text-ink-tertiary">
                  <span className="tracking-widest">· · ·</span> Follow the footsteps
                </span>
                <Link href="/screening" className="md:hidden inline-flex items-center gap-1.5 text-sm font-medium text-terracotta hover:underline">
                  Full battery <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Active world detail — right rail, taller, immersive */}
            <div className="lg:col-span-5 lg:sticky lg:top-20 self-start">
              <div className={`relative rounded-panel border bg-white p-6 md:p-7 flex flex-col shadow-card overflow-hidden ${active.ring} ring-1`}>
                <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full blur-2xl opacity-40 ${active.accentSoft}`} aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-button ${active.accent} text-white shadow-sm`}>
                      <ActiveIcon className="h-5 w-5" />
                    </div>
                    <span className="rounded-pill bg-paper border border-whisper px-2.5 py-1 text-xs font-semibold text-ink-secondary">World {active.no} of 05</span>
                  </div>

                  <p className="mt-4 font-mono text-xs font-bold tracking-[0.14em] text-terracotta uppercase">World {active.no} — {active.name}</p>
                  <h3 className="mt-1 font-display text-2xl md:text-3xl font-semibold tracking-tight text-ink leading-tight">{active.name}</h3>
                  <p className="mt-2 text-[15px] leading-6 text-ink-secondary">{active.desc}</p>
                  <p className="mt-1 text-xs font-medium text-ink-tertiary">{active.line}</p>

                  <div className="mt-5 rounded-panel border border-hairline bg-paper p-4 flex gap-3 items-start">
                    <div className="hidden sm:block flex-shrink-0">
                      <LanternMascot mood={activeWorld === 0 ? 'celebrating' : activeWorld === 4 ? 'thinking' : 'encouraging'} size={52} />
                    </div>
                    <p className="text-sm leading-5 text-ink-secondary">
                      {activeWorld === 0 && 'Wave your finger — the wand draws with star dust. This is the one camera world.'}
                      {activeWorld === 1 && 'Listen, then blend. The forest rewards smooth listening, not speed.'}
                      {activeWorld === 2 && 'Name them fast — 25 little friends racing down the mountain.'}
                      {activeWorld === 3 && 'Read the stones. Teacher taps if needed — voice is optional.'}
                      {activeWorld === 4 && 'Follow the sentence with your eyes. Lanterns mark where you looked — supplementary signal only.'}
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <Link
                      href={active.id}
                      className="inline-flex items-center justify-center gap-2 rounded-pill bg-terracotta px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(201,100,66,0.22)] transition-all hover:bg-terracotta-hover hover:shadow-[0_8px_24px_rgba(201,100,66,0.28)] active:scale-[0.97]"
                    >
                      <Play className="h-4 w-4" /> Launch
                    </Link>
                    <Link
                      href="/screening"
                      className="inline-flex items-center justify-center gap-2 rounded-pill border border-whisper bg-white px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/20"
                    >
                      Full battery <ArrowRight className="h-4 w-4 text-ink-tertiary" />
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-ink-tertiary border-t border-hairline pt-4">
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-sage" /> DALI-aligned signals</span>
                    <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber" /> Personal-best badges</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-paper border border-whisper px-3 py-1.5 text-xs text-ink-tertiary"><Wand2 className="h-3.5 w-3.5 text-realm" /> Rune Realm = camera wand</span>
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-paper border border-whisper px-3 py-1.5 text-xs text-ink-tertiary"><Eye className="h-3.5 w-3.5 text-valley" /> Vision Valley = supplementary</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy · single accent, clean row ──────────────────── */}
      <section id="privacy" className="py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-panel border border-whisper bg-whisper md:grid-cols-3">
            <div className="bg-paper p-7">
              <ShieldCheck className="h-5 w-5 text-terracotta" />
              <h4 className="mt-3 font-display text-base font-semibold text-ink">100% in-memory privacy</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-tertiary">Camera frames and audio buffers are processed on-device. Zero biometric media is ever recorded or transmitted.</p>
            </div>
            <div className="bg-paper p-7">
              <Award className="h-5 w-5 text-terracotta" />
              <h4 className="mt-3 font-display text-base font-semibold text-ink">DALI framework aligned</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-tertiary">Stimuli and thresholds mapped to DALI (NBRC) research frameworks for Indian languages.</p>
            </div>
            <div className="bg-paper p-7">
              <Globe2 className="h-5 w-5 text-terracotta" />
              <h4 className="mt-3 font-display text-base font-semibold text-ink">Bilingual & offline-ready</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-tertiary">English and Devanagari Hindi with local offline caching for municipal school resilience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-whisper py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-start md:justify-between md:px-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-sm leading-relaxed text-ink-tertiary">
              <span className="font-semibold text-ink">Clinical disclaimer:</span> {t('app.disclaimer')}
            </p>
            <p className="text-xs text-ink-quaternary">© 2026 Lumora World · Built for DoraHacks and primary education worldwide. · Sample Data — Demonstration Only on printed reports.</p>
          </div>
          <div className="flex items-center gap-3 text-ink-quaternary">
            <Users className="h-4 w-4" />
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
      </footer>
    </div>
  );
}

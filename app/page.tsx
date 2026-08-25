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
  Menu,
  X,
} from 'lucide-react';

export default function HomePage() {
  const { t, language, setLanguage } = useTranslation();
  const [activeWorld, setActiveWorld] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const worlds = [
    {
      id: '/screening/rune-realm',
      name: t('worlds.runeRealm'),
      no: '01',
      line: 'Camera air-tracing · kinematics & letter strokes',
      desc: t('worlds.runeRealmSubtitle'),
      icon: Wand2,
      accent: 'bg-gradient-to-br from-teal-400 to-cyan-500',
      accentSoft: 'bg-cyan-100',
      ring: 'ring-cyan-400 border-cyan-300',
      cardBg: 'bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/50',
      badgeBg: 'bg-cyan-100 text-cyan-800 border border-cyan-300',
      btnBg: 'bg-gradient-to-r from-teal-500 to-cyan-600 shadow-candy-cyan',
      tag: 'Most magical — the wand',
    },
    {
      id: '/screening/sound-forest',
      name: t('worlds.soundForest'),
      no: '02',
      line: 'Phoneme blending · auditory sequencing',
      desc: t('worlds.soundForestSubtitle'),
      icon: Volume2,
      accent: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      accentSoft: 'bg-emerald-100',
      ring: 'ring-emerald-400 border-emerald-300',
      cardBg: 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50',
      badgeBg: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      btnBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-candy-emerald',
      tag: 'Listen closely',
    },
    {
      id: '/screening/memory-mountains',
      name: t('worlds.memoryMountains'),
      no: '03',
      line: 'Rapid automatized naming · timed matrix',
      desc: t('worlds.memoryMountainsSubtitle'),
      icon: Brain,
      accent: 'bg-gradient-to-br from-orange-500 to-amber-500',
      accentSoft: 'bg-orange-100',
      ring: 'ring-orange-400 border-orange-300',
      cardBg: 'bg-gradient-to-br from-orange-50/90 via-white to-amber-50/50',
      badgeBg: 'bg-orange-100 text-orange-800 border border-orange-300',
      btnBg: 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-candy-coral',
      tag: 'Quick as you can',
    },
    {
      id: '/screening/story-castle',
      name: t('worlds.storyCastle'),
      no: '04',
      line: 'Nonword decoding · fluency practice',
      desc: t('worlds.storyCastleSubtitle'),
      icon: BookOpen,
      accent: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      accentSoft: 'bg-purple-100',
      ring: 'ring-purple-400 border-purple-300',
      cardBg: 'bg-gradient-to-br from-purple-50/90 via-white to-indigo-50/50',
      badgeBg: 'bg-purple-100 text-purple-800 border border-purple-300',
      btnBg: 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-candy-purple',
      tag: 'Read the stones',
    },
    {
      id: '/screening/vision-valley',
      name: t('worlds.visionValley'),
      no: '05',
      line: 'Visual flow & reading pacing',
      desc: t('worlds.visionValleySubtitle'),
      icon: Eye,
      accent: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      accentSoft: 'bg-blue-100',
      ring: 'ring-blue-400 border-blue-300',
      cardBg: 'bg-gradient-to-br from-blue-50/90 via-white to-sky-50/50',
      badgeBg: 'bg-blue-100 text-blue-800 border border-blue-300',
      btnBg: 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-soft-md',
      tag: 'Supplementary',
    },
  ];

  const active = worlds[activeWorld];
  const ActiveIcon = active.icon;

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ── Header · Apple glass nav with mobile menu ─────────────────── */}
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm text-ink-secondary">
            <Link href="#worlds" className="transition-colors hover:text-ink">Worlds</Link>
            <Link href="#approach" className="transition-colors hover:text-ink">Approach</Link>
            <Link href="#privacy" className="transition-colors hover:text-ink">Privacy</Link>
          </nav>

          {/* Desktop Action & Language */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center bg-white border border-whisper rounded-pill p-0.5 text-sm font-medium">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-pill transition-colors ${language === 'en' ? 'bg-ink text-white' : 'text-ink-secondary hover:text-ink'}`}
              >
                EN
              </button>
              <button
                type="button"
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
              <span>Specialist Hub</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="flex items-center bg-white border border-whisper rounded-pill p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-pill transition-colors ${language === 'en' ? 'bg-ink text-white' : 'text-ink-secondary'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded-pill transition-colors ${language === 'hi' ? 'bg-ink text-white' : 'text-ink-secondary'}`}
              >
                हि
              </button>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-pill border border-whisper bg-white text-ink transition-colors hover:bg-paper"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-whisper bg-white/95 backdrop-blur-xl px-4 py-4 sm:hidden animate-fade-in shadow-card">
            <nav className="flex flex-col gap-3 text-sm font-medium text-ink">
              <Link
                href="#worlds"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-card p-2.5 transition-colors hover:bg-paper"
              >
                <span>The 5 Worlds</span>
                <ArrowRight className="h-4 w-4 text-ink-tertiary" />
              </Link>
              <Link
                href="#approach"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-card p-2.5 transition-colors hover:bg-paper"
              >
                <span>3-Tier Approach</span>
                <ArrowRight className="h-4 w-4 text-ink-tertiary" />
              </Link>
              <Link
                href="#privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-card p-2.5 transition-colors hover:bg-paper"
              >
                <span>Privacy & Ethics</span>
                <ArrowRight className="h-4 w-4 text-ink-tertiary" />
              </Link>
              <div className="pt-2 border-t border-whisper flex flex-col gap-2">
                <Link
                  href="/screening"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-pill bg-terracotta px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                >
                  <Sparkles className="h-4 w-4" /> {t('app.startScreening')}
                </Link>
                <Link
                  href="/doctor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-pill border border-whisper bg-paper px-4 py-2.5 text-sm font-medium text-ink"
                >
                  <Stethoscope className="h-4 w-4 text-terracotta" /> Specialist Hub
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Hero · cinematic, single focal element + mascot preview ──────────────── */}
      <section className="border-b border-whisper relative overflow-hidden">
        {/* ambient harmonic washes */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-32 h-[340px] w-[340px] sm:h-[420px] sm:w-[520px] rounded-full bg-terracotta-soft opacity-40 blur-[70px]" />
          <div className="absolute top-32 -left-24 h-[260px] w-[260px] sm:h-[360px] sm:w-[360px] rounded-full bg-valley-soft opacity-30 blur-[70px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 md:px-8 pt-8 pb-12 sm:pt-10 sm:pb-16 md:pt-16 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7 max-w-2xl">
              <p className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-pill border border-whisper bg-white px-3 py-1 text-xs sm:text-[13px] font-medium text-ink-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse-gentle" />
                Camera air-tracing — works on any classroom tablet
              </p>

              <h1 className="font-display text-3xl leading-[1.1] tracking-[-0.03em] sm:text-5xl sm:leading-[1.05] md:text-[4.25rem] font-semibold text-ink">
                Learning,<br />
                <span className="relative inline-block">
                  seen.
                  <span className="absolute -right-3 -top-2 hidden sm:inline-flex">
                    <Star className="w-4 h-4 text-amber animate-pulse-gentle" />
                  </span>
                </span>
              </h1>
              <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-[17px] leading-relaxed text-ink-secondary">
                Five gentle game worlds that paint letters, blend sounds and time naming in the air — capturing practice signals that help teachers flag a child who could benefit from a closer look.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/screening"
                  className="inline-flex items-center justify-center gap-2 rounded-pill bg-terracotta px-5 sm:px-6 py-2.5 sm:py-3 text-base sm:text-[17px] font-medium text-white shadow-[0_8px_24px_rgba(201,100,66,0.25)] transition-all hover:bg-terracotta-hover hover:shadow-[0_12px_32px_rgba(201,100,66,0.32)] active:scale-[0.97]"
                >
                  {t('app.startScreening')} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/screening/rune-realm"
                  className="inline-flex items-center justify-center gap-2 rounded-pill border border-whisper bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-[15px] font-medium text-ink transition-colors hover:border-ink/30"
                >
                  <Wand2 className="h-4 w-4 text-terracotta" /> Try the magic wand
                </Link>
                <span className="text-xs text-ink-tertiary block sm:inline-block w-full sm:w-auto mt-1 sm:mt-0">15 min · pseudonymous · offline-ready</span>
              </div>
            </div>

            {/* Mascot island */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative bg-white border border-whisper rounded-hero p-5 sm:p-6 pt-14 sm:pt-16 shadow-card w-full max-w-[320px] sm:max-w-[360px]">
                <div className="absolute -top-6 -right-6 h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-amber-soft blur-2xl opacity-60" aria-hidden="true" />
                <div className="relative flex flex-col items-center text-center">
                  <div className="pt-2 pb-1">
                    <LanternMascot mood="encouraging" size={96} speechBubble="Wave your finger — I follow!" />
                  </div>
                  <p className="mt-2.5 sm:mt-3 text-xs font-semibold tracking-widest text-ink-tertiary uppercase">Meet Lumi</p>
                  <p className="mt-1 text-xs sm:text-sm leading-5 text-ink-secondary">
                    Your guide through all five worlds. Hover the wand cursor — Lumi&apos;s eyes follow you.
                  </p>
                  <div className="mt-3 sm:mt-4 flex items-center gap-1.5 text-[11px] text-ink-tertiary">
                    <MapPinned className="w-3.5 h-3.5 text-terracotta" /> 5 worlds · one journey
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence strip */}
          <div className="mt-10 sm:mt-14 grid grid-cols-1 gap-3 overflow-hidden sm:grid-cols-3">
            <div className="bg-gradient-to-br from-orange-50 to-white p-5 sm:p-6 flex items-center gap-3.5 rounded-3xl border-2 border-orange-200 shadow-candy-coral">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-soft-xs flex-shrink-0"><Users className="h-5 w-5" /></div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-orange-600">~8<span className="text-orange-500">%</span></p>
                <p className="mt-0.5 text-xs sm:text-sm text-ink/80 font-medium">Pooled SLD prevalence in Indian schoolchildren</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white p-5 sm:p-6 flex items-center gap-3.5 rounded-3xl border-2 border-emerald-200 shadow-candy-emerald">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-soft-xs flex-shrink-0"><Stethoscope className="h-5 w-5" /></div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600">3,890</p>
                <p className="mt-0.5 text-xs sm:text-sm text-ink/80 font-medium">Registered clinical psychologists in India (RCI, 2024)</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-white p-5 sm:p-6 flex items-center gap-3.5 rounded-3xl border-2 border-amber-200 shadow-candy-amber">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-ink shadow-soft-xs flex-shrink-0"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-700">5–8<span className="text-amber-600"> yrs</span></p>
                <p className="mt-0.5 text-xs sm:text-sm text-ink/80 font-medium">Critical primary window for early classroom triage</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three tiers · asymmetric weighted grid ──────────────── */}
      <section id="approach" className="py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="max-w-2xl mb-8 sm:mb-10">
            <p className="text-xs font-semibold tracking-widest text-terracotta uppercase">How it fits together</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-ink">
              Three tiers of closed-loop support
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-[17px] text-ink-secondary">
              From classroom triage to daily home practice to specialist telemetry — one continuum, no gaps.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
            {/* Tier 1 */}
            <article className="lg:col-span-6 rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/60 to-white p-6 sm:p-8 shadow-candy-coral">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-soft-xs">
                <Sparkles className="h-5 w-5 fill-white" />
              </div>
              <p className="mt-4 sm:mt-5 text-xs sm:text-[13px] font-extrabold uppercase tracking-wide text-orange-800">Tier 1 &middot; Teacher facilitated</p>
              <h3 className="mt-1.5 sm:mt-2 font-display text-xl sm:text-2xl font-extrabold tracking-tight text-ink">{t('app.roleScreening')}</h3>
              <p className="mt-2 sm:mt-3 leading-relaxed text-ink/80 text-sm font-body">{t('app.roleScreeningDesc')} A 15-minute battery across five game worlds capturing motor, phonemic and naming signals.</p>
              <Link href="/screening" className="mt-5 sm:mt-6 inline-flex items-center gap-1.5 text-sm sm:text-[15px] font-bold text-orange-600 hover:text-orange-700 hover:underline">
                Begin a check-in <ArrowRight className="h-4 w-4" />
              </Link>
            </article>

            {[
              { tier: 'Tier 2 · Child practice', title: t('app.roleHaven'), desc: t('app.roleHavenDesc'), to: '/haven', cta: t('app.enterHaven'), color: 'emerald' },
              { tier: 'Tier 3 · Specialist telemetry', title: t('app.roleDoctor'), desc: t('app.roleDoctorDesc'), to: '/doctor', cta: t('app.openDoctorHub'), color: 'blue' },
            ].map((c) => (
              <article key={c.to} className={`lg:col-span-3 rounded-3xl border-2 ${c.color === 'emerald' ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white shadow-candy-emerald' : 'border-blue-200 bg-gradient-to-br from-blue-50/60 to-white shadow-soft-md'} p-6 sm:p-8 flex flex-col`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${c.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'} shadow-soft-xs`}>
                  {c.to === '/haven' ? <Sparkles className="h-5 w-5 fill-white" /> : <Stethoscope className="h-5 w-5" />}
                </div>
                <p className={`mt-4 sm:mt-5 text-xs sm:text-[13px] font-extrabold uppercase tracking-wide ${c.color === 'emerald' ? 'text-emerald-800' : 'text-blue-800'}`}>{c.tier}</p>
                <h3 className="mt-1.5 sm:mt-2 font-display text-lg sm:text-xl font-extrabold tracking-tight text-ink">{c.title}</h3>
                <p className="mt-2 sm:mt-3 mb-5 sm:mb-6 text-sm leading-relaxed text-ink/80 font-body">{c.desc}</p>
                <Link href={c.to} className={`mt-auto inline-flex items-center gap-1.5 text-sm sm:text-[15px] font-bold ${c.color === 'emerald' ? 'text-emerald-600 hover:text-emerald-700' : 'text-blue-600 hover:text-blue-700'} hover:underline`}>
                  {c.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Worlds · quest map ───────────────────────────────────────── */}
      <section id="worlds" className="relative border-y border-whisper bg-white py-12 sm:py-16 md:py-24 overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] sm:h-[600px] w-[600px] sm:w-[900px] rounded-full bg-paper opacity-60 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 md:px-8">
          <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.14em] text-terracotta uppercase">Choose your path</p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-ink">
                The five exploratory worlds
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-[15px] leading-6 text-ink-secondary">
                Each practices a foundational skill, mapped to DALI (NBRC) frameworks. Follow the path in order for a full battery — or tap any world to try it alone. <span className="font-medium text-ink">Rune Realm&rsquo;s wand is the one camera world; the rest are reliable touch + voice.</span>
              </p>
            </div>
            <Link href="/screening" className="hidden md:inline-flex items-center gap-1.5 text-[15px] font-medium text-terracotta hover:underline">
              Run the full battery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Quest path */}
            <div className="lg:col-span-7 relative">
              <div className="hidden lg:block absolute left-[28px] top-6 bottom-6 w-px bg-gradient-to-b from-terracotta/0 via-hairline to-terracotta/0" aria-hidden="true" />
              <div className="space-y-3">
                {worlds.map((w, i) => {
                  const Icon = w.icon;
                  const isActive = activeWorld === i;
                  const isSupp = w.no === '05';
                  return (
                    <button
                      type="button"
                      key={w.id}
                      onClick={() => setActiveWorld(i)}
                      className={`group relative flex w-full items-center gap-3 sm:gap-4 rounded-2xl border-2 px-3 sm:px-4 py-3 sm:py-4 text-left transition-all ${isActive ? `${w.cardBg} ${w.ring} shadow-soft-md scale-[1.01]` : 'bg-white border-hairline hover:bg-sand/40 hover:border-ink/20'}`}
                    >
                      {/* node */}
                      <span className={`relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border-2 transition-all ${isActive ? `${w.accent} text-white border-transparent shadow-soft-xs scale-[1.05]` : `bg-sand/60 text-ink/60 border-hairline group-hover:text-ink`}`}>
                        <Icon className="h-5 w-5" />
                        {isActive && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber text-[10px] font-bold text-white shadow-sm">✓</span>}
                      </span>

                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className={`font-mono text-xs font-bold tracking-wide ${isActive ? 'text-ink' : 'text-ink-quaternary'}`}>{w.no}</span>
                          <span className="hidden sm:inline h-1 w-1 rounded-full bg-hairline" aria-hidden="true" />
                          <span className="font-display text-sm sm:text-[15px] font-extrabold tracking-tight text-ink">{w.name}</span>
                          {isSupp && <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-amber-900 uppercase">Supplementary</span>}
                          {isActive && !isSupp && <span className={`hidden sm:inline-flex items-center gap-1 rounded-full ${w.badgeBg} px-2.5 py-0.5 text-[11px] font-extrabold`}>Active</span>}
                        </span>
                        <span className="block text-xs sm:text-[13px] leading-5 text-ink/70 font-medium truncate">{w.line}</span>
                        <span className="block text-xs text-ink-tertiary mt-0.5 sm:hidden">{w.tag}</span>
                      </span>

                      <span className="flex items-center gap-2 flex-shrink-0">
                        <span className={`hidden lg:inline text-xs text-ink/50 font-medium ${isActive ? '!text-ink/80 font-bold' : ''}`}>{w.tag}</span>
                        <span className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition-colors ${isActive ? 'bg-white border-amber-300 text-ink shadow-xs' : 'bg-sand/60 border-hairline text-ink-quaternary group-hover:text-ink'}`}>
                          <ArrowRight className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform ${isActive ? 'translate-x-0' : 'group-hover:translate-x-0.5'}`} />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* footprints hint + mobile CTA */}
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sand/60 border border-hairline px-3 py-1.5 text-xs font-bold text-ink/60">
                  <span className="tracking-widest">· · ·</span> Follow the footsteps
                </span>
                <Link href="/screening" className="md:hidden inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-terracotta hover:underline">
                  Full battery <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Active world detail */}
            <div className="lg:col-span-5 lg:sticky lg:top-20 self-start">
              <div className={`relative rounded-3xl border-2 ${active.cardBg} p-5 sm:p-7 flex flex-col shadow-soft-md overflow-hidden ${active.ring}`}>
                <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full blur-2xl opacity-40 ${active.accentSoft}`} aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${active.accent} text-white shadow-soft-xs`}>
                      <ActiveIcon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-white/90 border border-hairline px-3 py-1 text-xs font-extrabold text-ink shadow-xs">World {active.no} of 05</span>
                  </div>

                  <p className="mt-3 sm:mt-4 font-mono text-xs font-bold tracking-[0.14em] text-ink/60 uppercase">World {active.no} — {active.name}</p>
                  <h3 className="mt-1 font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-ink leading-tight">{active.name}</h3>
                  <p className="mt-2 text-sm sm:text-[15px] leading-6 text-ink/80 font-body">{active.desc}</p>
                  <p className="mt-1 text-xs font-bold text-ink/60">{active.line}</p>

                  <div className="mt-4 sm:mt-5 rounded-2xl border border-hairline bg-white/80 backdrop-blur-xs p-3.5 sm:p-4 flex gap-3 items-start shadow-soft-xs">
                    <div className="hidden sm:block flex-shrink-0">
                      <LanternMascot mood={activeWorld === 0 ? 'celebrating' : activeWorld === 4 ? 'thinking' : 'encouraging'} size={48} />
                    </div>
                    <p className="text-xs sm:text-sm leading-5 text-ink/80 font-medium">
                      {activeWorld === 0 && 'Wave your finger — the wand draws with star dust. This is the one camera world.'}
                      {activeWorld === 1 && 'Listen, then blend. The forest rewards smooth listening, not speed.'}
                      {activeWorld === 2 && 'Name them fast — 25 little friends racing down the mountain.'}
                      {activeWorld === 3 && 'Read the stones. Teacher taps if needed — voice is optional.'}
                      {activeWorld === 4 && 'Follow the sentence with your eyes. Lanterns mark where you looked — supplementary signal only.'}
                    </p>
                  </div>

                  <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2">
                    <Link
                      href={active.id}
                      className={`inline-flex items-center justify-center gap-2 rounded-full ${active.btnBg} px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold text-white transition-all hover:brightness-105 active:scale-[0.97] uppercase tracking-wider`}
                    >
                      <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white" /> Launch
                    </Link>
                    <Link
                      href="/screening"
                      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-hairline bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-ink transition-colors hover:bg-sand/60 shadow-soft-xs"
                    >
                      Full battery <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-ink-tertiary" />
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-ink/70 font-medium border-t border-hairline pt-3 sm:pt-4">
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> DALI-aligned signals</span>
                    <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Personal badges</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1.5 text-xs text-cyan-900 font-bold"><Wand2 className="h-3.5 w-3.5 text-cyan-600" /> Rune Realm = camera wand</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs text-blue-900 font-bold"><Eye className="h-3.5 w-3.5 text-blue-600" /> Vision Valley = supplementary</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy ─────────────────────────────────────────────────── */}
      <section id="privacy" className="py-12 sm:py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-panel border border-whisper bg-whisper md:grid-cols-3">
            <div className="bg-paper p-6 sm:p-7">
              <ShieldCheck className="h-5 w-5 text-terracotta" />
              <h4 className="mt-3 font-display text-sm sm:text-base font-semibold text-ink">100% in-memory privacy</h4>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink-tertiary">Camera frames and audio buffers are processed on-device. Zero biometric media is ever recorded or transmitted.</p>
            </div>
            <div className="bg-paper p-6 sm:p-7">
              <Award className="h-5 w-5 text-terracotta" />
              <h4 className="mt-3 font-display text-sm sm:text-base font-semibold text-ink">DALI framework aligned</h4>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink-tertiary">Stimuli and thresholds mapped to DALI (NBRC) research frameworks for Indian languages.</p>
            </div>
            <div className="bg-paper p-6 sm:p-7">
              <Globe2 className="h-5 w-5 text-terracotta" />
              <h4 className="mt-3 font-display text-sm sm:text-base font-semibold text-ink">Bilingual & offline-ready</h4>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink-tertiary">English and Devanagari Hindi with local offline caching for municipal school resilience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-whisper py-6 sm:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-start md:justify-between md:px-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs sm:text-sm leading-relaxed text-ink-tertiary">
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

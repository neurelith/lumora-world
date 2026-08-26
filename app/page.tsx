'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { InteractiveLumiCompanion } from '@/components/ui/InteractiveLumiCompanion';
import { UniversalAirWand } from '@/components/ui/UniversalAirWand';
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
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';

export default function HomePage() {
  const { t, language, setLanguage } = useTranslation();
  const [activeWorld, setActiveWorld] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [airWandActive, setAirWandActive] = useState(false);

  const worlds = [
    {
      id: '/screening/rune-realm',
      name: 'Rune Realm',
      no: '01',
      domain: 'Handwriting and Motor Planning',
      line: 'Draw letters in the air or scan paper notes',
      desc: 'Checks pencil grip rhythm, stroke speed, and letter reversals like b and d.',
      icon: Wand2,
      accent: 'bg-gradient-to-br from-teal-400 to-cyan-500',
      accentSoft: 'bg-cyan-100',
      ring: 'ring-cyan-400 border-cyan-300',
      cardBg: 'bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/50',
      badgeBg: 'bg-cyan-100 text-cyan-800 border border-cyan-300',
      btnBg: 'bg-gradient-to-r from-teal-500 to-cyan-600 shadow-candy-cyan',
      tag: 'Air wand or paper scan',
    },
    {
      id: '/screening/sound-forest',
      name: 'Sound Forest',
      no: '02',
      domain: 'Phonological Dyslexia',
      line: 'Listen to individual sounds and speak the blended word',
      desc: 'Plays sound tokens like c-a-t and measures how quickly the child speaks the answer.',
      icon: Volume2,
      accent: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      accentSoft: 'bg-emerald-100',
      ring: 'ring-emerald-400 border-emerald-300',
      cardBg: 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50',
      badgeBg: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      btnBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-candy-emerald',
      tag: 'Voice recognition blending',
    },
    {
      id: '/screening/memory-mountains',
      name: 'Memory Mountains',
      no: '03',
      domain: 'Processing Speed and Rapid Naming',
      line: 'Name 25 shapes and colors in order',
      desc: 'Times how fast a child names items on a 5 by 5 grid to flag retrieval speed delays.',
      icon: Brain,
      accent: 'bg-gradient-to-br from-orange-500 to-amber-500',
      accentSoft: 'bg-orange-100',
      ring: 'ring-orange-400 border-orange-300',
      cardBg: 'bg-gradient-to-br from-orange-50/90 via-white to-amber-50/50',
      badgeBg: 'bg-orange-100 text-orange-800 border border-orange-300',
      btnBg: 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-candy-coral',
      tag: '25-item timed matrix',
    },
    {
      id: '/screening/story-castle',
      name: 'Story Castle',
      no: '04',
      domain: 'Word Decoding and Fluency',
      line: 'Read pronounceable practice words',
      desc: 'Checks if the child sounds out new words step by step or struggles with letter patterns.',
      icon: BookOpen,
      accent: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      accentSoft: 'bg-purple-100',
      ring: 'ring-purple-400 border-purple-300',
      cardBg: 'bg-gradient-to-br from-purple-50/90 via-white to-indigo-50/50',
      badgeBg: 'bg-purple-100 text-purple-800 border border-purple-300',
      btnBg: 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-candy-purple',
      tag: 'One-tap teacher scoring',
    },
    {
      id: '/screening/vision-valley',
      name: 'Vision Valley',
      no: '05',
      domain: 'Reading Gaze and Focus Flow',
      line: 'Follow moving stars across a line of text',
      desc: 'Tracks eye movement to check if a child rereads lines or loses their place on the page.',
      icon: Eye,
      accent: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      accentSoft: 'bg-blue-100',
      ring: 'ring-blue-400 border-blue-300',
      cardBg: 'bg-gradient-to-br from-blue-50/90 via-white to-sky-50/50',
      badgeBg: 'bg-blue-100 text-blue-800 border border-blue-300',
      btnBg: 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-soft-md',
      tag: 'Webcam eye tracker',
    },
  ];

  const active = worlds[activeWorld];
  const ActiveIcon = active.icon;

  return (
    <div className="min-h-screen bg-[#FAF9FC] text-ink selection:bg-amber-200">
      {/* ── Navigation Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-8 h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image src="/lumora_logo_transparent.png" alt="Lumora World" fill className="object-contain" priority />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight text-ink">
              Lumora<span className="text-amber-600"> World</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-ink-secondary">
            <Link href="#how-it-works" className="transition-colors hover:text-ink">
              How It Works
            </Link>
            <Link href="#worlds" className="transition-colors hover:text-ink">
              The 5 Activities
            </Link>
            <Link href="#approach" className="transition-colors hover:text-ink">
              For Schools
            </Link>
            <Link href="#privacy" className="transition-colors hover:text-ink">
              Privacy
            </Link>
            <Link href="/feedback" className="transition-colors hover:text-amber-700 text-amber-900 font-bold">
              Feedback
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full transition-all ${
                  language === 'en' ? 'bg-white text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-full transition-all ${
                  language === 'hi' ? 'bg-white text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <Link
              href="/doctor"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-ink transition-colors hover:border-slate-400 hover:bg-slate-50 shadow-xs"
            >
              <Stethoscope className="h-4 w-4 text-purple-600" />
              <span>Specialist Hub</span>
            </Link>

            <Link
              href="/screening"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#22C55E] to-[#16A34A] border-b-2 border-[#15803D] px-4 py-1.5 text-xs font-extrabold text-white shadow-candy-emerald hover:brightness-105 active:translate-y-0.5"
            >
              <Sparkles className="h-3.5 w-3.5 fill-white" />
              <span>Start Screening</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-0.5 rounded-full ${language === 'en' ? 'bg-white text-ink shadow-xs' : 'text-ink-secondary'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-0.5 rounded-full ${language === 'hi' ? 'bg-white text-ink shadow-xs' : 'text-ink-secondary'}`}
              >
                हि
              </button>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-ink"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 sm:hidden animate-fade-in shadow-xl">
            <nav className="flex flex-col gap-2.5 text-sm font-bold text-ink">
              <Link
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-slate-100 flex items-center justify-between"
              >
                <span>How It Works</span>
                <ArrowRight className="h-4 w-4 text-ink-tertiary" />
              </Link>
              <Link
                href="#worlds"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-slate-100 flex items-center justify-between"
              >
                <span>The 5 Activities</span>
                <ArrowRight className="h-4 w-4 text-ink-tertiary" />
              </Link>
              <Link
                href="/doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Specialist Hub</span>
                <ArrowRight className="h-4 w-4 text-ink-tertiary" />
              </Link>
              <Link
                href="/feedback"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-amber-50 text-amber-900 flex items-center justify-between font-bold"
              >
                <span>Community Feedback</span>
                <ArrowRight className="h-4 w-4 text-amber-700" />
              </Link>
              <div className="pt-2 border-t border-slate-200">
                <Link
                  href="/screening"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-extrabold text-white shadow-md"
                >
                  <Sparkles className="h-4 w-4" /> Start Screening Free
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Main Hero Cockpit ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24 border-b border-slate-200/80">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-[420px] w-[420px] sm:h-[540px] sm:w-[540px] rounded-full bg-amber-200/35 blur-[90px]" />
          <div className="absolute top-48 -left-20 h-[360px] w-[360px] rounded-full bg-emerald-100/45 blur-[90px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Direct and Clear Message */}
            <div className="lg:col-span-7 max-w-2xl space-y-6">
              
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-amber-200 bg-amber-50/80 px-3.5 py-1 text-xs font-display font-extrabold text-amber-900 shadow-soft-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Early Pediatric Screening &middot; English &amp; Hindi &middot; Ages 5 to 8</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl md:text-[3.75rem] font-extrabold leading-[1.12] tracking-tight text-ink">
                Spot learning differences early,{' '}
                <br className="hidden sm:inline" />
                in{' '}
                <span className="relative inline-flex items-center gap-1.5 mx-1 px-3 sm:px-4 py-0.5 sm:py-1 rounded-2xl bg-amber-100 border-2 border-b-4 border-amber-300 text-amber-950 shadow-soft-xs -rotate-1 align-middle">
                  <span>15 minutes</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 fill-amber-500 animate-pulse" />
                </span>{' '}
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-terracotta bg-clip-text text-transparent">
                  of playful games.
                </span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-ink/80 font-body">
                Five short tablet activities that help teachers and parents identify early signs of dyslexia, dysgraphia, and processing delays before school struggles begin.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-bold text-ink/80">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free 15 minute check
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Runs 100% on your device
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
                  <Award className="w-4 h-4 text-indigo-600" /> Aligned with DALI standards
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/screening"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#22C55E] to-[#16A34A] border-b-4 border-[#15803D] px-6 py-3.5 text-base font-display font-extrabold text-white shadow-lg shadow-emerald-500/25 transition-all hover:brightness-105 active:translate-y-1 active:border-b-0"
                >
                  <Sparkles className="w-5 h-5 fill-white" />
                  <span>Start Free Screening</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setAirWandActive((prev) => !prev)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-b-4 px-5 py-3.5 text-sm font-display font-extrabold shadow-soft-xs transition-all active:translate-y-1 active:border-b-2 cursor-pointer ${
                    airWandActive
                      ? 'bg-cyan-500 text-white border-cyan-400 ring-2 ring-cyan-300 shadow-candy-cyan'
                      : 'bg-white border-slate-200 text-ink hover:border-cyan-400 hover:bg-cyan-50/50'
                  }`}
                >
                  <Wand2 className={`w-4 h-4 ${airWandActive ? 'text-white animate-spin' : 'text-cyan-600'}`} />
                  <span>{airWandActive ? 'Magic Wand Active ✨' : 'Try Magic Air Wand'}</span>
                </button>
              </div>

              <p className="text-xs text-ink/60 font-medium">
                No sign-up or credit card required. Works on iPads, Android tablets, Chromebooks, and laptops.
              </p>
            </div>

            {/* Right Column: Living Interactive Lumi Mascot Companion */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <InteractiveLumiCompanion
                isAirWandActive={airWandActive}
                onToggleAirWand={() => setAirWandActive((prev) => !prev)}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── 3-Step "How It Works" ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-6xl px-4 md:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-display font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Three Simple Steps
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-ink">
              How Lumora Works in the Classroom
            </h2>
            <p className="text-sm sm:text-base text-ink/70 font-body">
              A quick way for teachers to check an entire class without extra paperwork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl border-2 border-b-4 border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-white shadow-soft-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-display font-extrabold flex items-center justify-center text-lg shadow-candy-amber">
                1
              </div>
              <h3 className="font-display font-extrabold text-lg text-ink">Child Plays 5 Short Games</h3>
              <p className="text-xs sm:text-sm text-ink/70 leading-relaxed font-body">
                The child traces letters in the air with their finger, blends spoken sounds, and names colorful shapes on the screen.
              </p>
              <div className="pt-2 text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> Positive, encouraging, and friendly
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl border-2 border-b-4 border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-white shadow-soft-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-display font-extrabold flex items-center justify-center text-lg shadow-candy-emerald">
                2
              </div>
              <h3 className="font-display font-extrabold text-lg text-ink">Device Measures Natural Cues</h3>
              <p className="text-xs sm:text-sm text-ink/70 leading-relaxed font-body">
                The camera and microphone track hand stability, speech reaction times, and letter orientation locally on the device.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> No camera video or audio is ever uploaded
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl border-2 border-b-4 border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-white shadow-soft-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-display font-extrabold flex items-center justify-center text-lg shadow-soft-sm">
                3
              </div>
              <h3 className="font-display font-extrabold text-lg text-ink">Get Instant Summary Reports</h3>
              <p className="text-xs sm:text-sm text-ink/70 leading-relaxed font-body">
                Teachers receive clear guidance on which children are progressing well and which children might benefit from extra support.
              </p>
              <div className="pt-2 text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" /> Printable specialist referral packets
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The 5 Activities Showcase ─────────────────────────────────── */}
      <section id="worlds" className="py-14 sm:py-20 bg-[#FAF9FC] border-b border-slate-200/80">
        <div className="mx-auto max-w-6xl px-4 md:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-display font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Explore the Games
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-ink">
                What Each Activity Checks
              </h2>
              <p className="text-sm sm:text-base text-ink/70 font-body">
                Each game checks a specific developmental skill using standard educational methods.
              </p>
            </div>
            <Link
              href="/screening"
              className="inline-flex items-center gap-2 text-sm font-display font-extrabold text-emerald-700 hover:text-emerald-800"
            >
              <span>Play All 5 Games</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* World List (Left) */}
            <div className="lg:col-span-7 space-y-3">
              {worlds.map((w, idx) => {
                const Icon = w.icon;
                const isSelected = activeWorld === idx;
                return (
                  <button
                    key={w.id}
                    onClick={() => setActiveWorld(idx)}
                    className={`w-full p-4 rounded-3xl border-2 text-left transition-all flex items-center gap-4 ${
                      isSelected
                        ? `${w.cardBg} ${w.ring} shadow-md scale-[1.01]`
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${w.accent} text-white flex items-center justify-center shadow-xs flex-shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink/50">{w.no}</span>
                        <h4 className="font-display font-extrabold text-base text-ink">{w.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-display font-extrabold ${w.badgeBg}`}>
                          {w.domain}
                        </span>
                      </div>
                      <p className="text-xs text-ink/70 font-medium truncate pt-0.5">{w.line}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-ink translate-x-1' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Active World Spotlight (Right) */}
            <div className="lg:col-span-5 sticky top-24">
              <div className={`p-6 sm:p-7 rounded-3xl border-2 ${active.ring} ${active.cardBg} shadow-lg space-y-5`}>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${active.accent} text-white flex items-center justify-center shadow-xs`}>
                    <ActiveIcon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-mono font-bold text-ink shadow-xs">
                    Game {active.no} of 05
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink/60">{active.domain}</span>
                  <h3 className="font-display font-extrabold text-2xl text-ink">{active.name}</h3>
                  <p className="text-xs sm:text-sm text-ink/80 leading-relaxed font-body pt-1">{active.desc}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-display font-extrabold text-ink">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>How it works: {active.tag}</span>
                  </div>
                  <p className="text-[11px] text-ink/70 font-body">
                    {activeWorld === 0 && 'Draw in the air using your webcam, or take a quick camera picture of paper handwriting.'}
                    {activeWorld === 1 && 'Listen to phoneme sounds, then pronounce the word into the tablet microphone.'}
                    {activeWorld === 2 && 'Name 25 shapes as fast as you can to measure rapid processing speed.'}
                    {activeWorld === 3 && 'Read playful test words with simple one-tap teacher verification.'}
                    {activeWorld === 4 && 'Follow the moving guide to check reading pace and eye focus.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    href={active.id}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl ${active.btnBg} py-3 text-xs font-display font-extrabold text-white transition-all hover:brightness-105 active:scale-98 uppercase tracking-wider`}
                  >
                    <Play className="w-4 h-4 fill-white" /> Try Game {active.no}
                  </Link>
                  <Link
                    href="/screening"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-slate-200 py-3 text-xs font-display font-extrabold text-ink transition-all hover:bg-slate-50 shadow-xs"
                  >
                    All 5 Games <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-Tier Support ──────────────────────────────────────────── */}
      <section id="approach" className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-6xl px-4 md:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-display font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              For Schools and Families
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-ink">
              Three Levels of Support
            </h2>
            <p className="text-sm sm:text-base text-ink/70 font-body">
              From fast classroom checks to daily home practice and doctor reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="p-7 rounded-3xl border-2 border-b-4 border-amber-200 bg-gradient-to-br from-amber-50/60 to-white shadow-soft-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 fill-white" />
                </div>
                <span className="text-[11px] font-display font-extrabold uppercase tracking-wider text-amber-900">Tier 1: Classroom Check</span>
                <h3 className="font-display font-extrabold text-xl text-ink">Universal Screening</h3>
                <p className="text-xs sm:text-sm text-ink/70 font-body leading-relaxed">
                  A 15 minute check that any teacher can run on a tablet to identify students who need attention.
                </p>
              </div>
              <Link
                href="/screening"
                className="inline-flex items-center gap-1.5 text-xs font-display font-extrabold text-amber-700 hover:underline pt-2"
              >
                <span>Start Screening</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tier 2 */}
            <div className="p-7 rounded-3xl border-2 border-b-4 border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white shadow-soft-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 fill-white" />
                </div>
                <span className="text-[11px] font-display font-extrabold uppercase tracking-wider text-emerald-900">Tier 2: Daily Practice</span>
                <h3 className="font-display font-extrabold text-xl text-ink">The Practice Haven</h3>
                <p className="text-xs sm:text-sm text-ink/70 font-body leading-relaxed">
                  Daily mini-practice activities with streaks and rewards to build confidence at home and school.
                </p>
              </div>
              <Link
                href="/haven"
                className="inline-flex items-center gap-1.5 text-xs font-display font-extrabold text-emerald-700 hover:underline pt-2"
              >
                <span>Open Haven</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tier 3 */}
            <div className="p-7 rounded-3xl border-2 border-b-4 border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white shadow-soft-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-display font-extrabold uppercase tracking-wider text-indigo-900">Tier 3: Specialist Hub</span>
                <h3 className="font-display font-extrabold text-xl text-ink">Doctor and DALI Reports</h3>
                <p className="text-xs sm:text-sm text-ink/70 font-body leading-relaxed">
                  Detailed progress curves, DALI normative scores, and printable referral packets for psychologists.
                </p>
              </div>
              <Link
                href="/doctor"
                className="inline-flex items-center gap-1.5 text-xs font-display font-extrabold text-indigo-700 hover:underline pt-2"
              >
                <span>Open Doctor Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy and Ethics ────────────────────────────────────────── */}
      <section id="privacy" className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-display font-extrabold text-ink text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>On-Device Privacy</span>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed font-body">
                Camera and audio processing happens in your browser memory. No photos, video streams, or sound recordings are ever saved or sent over the internet.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-display font-extrabold text-ink text-sm">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>Standardized DALI Norms</span>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed font-body">
                Calibrated against research data from the National Brain Research Centre for bilingual Indian school cohorts in English and Hindi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-display font-extrabold text-ink text-sm">
                <Globe2 className="w-5 h-5 text-amber-600" />
                <span>Works Offline</span>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed font-body">
                Built to work reliably in low-resource classrooms and rural schools with local caching and touch or voice alternatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="py-8 bg-white">
        <div className="mx-auto max-w-6xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink/60">
          <div className="max-w-2xl space-y-1 text-center md:text-left">
            <p className="font-medium">
              <strong>Clinical Disclaimer:</strong> Lumora World is an early screening triage and practice tool, not a clinical diagnostic instrument. Formal diagnoses must be conducted by certified clinical psychologists or special educators.
            </p>
            <p className="text-[11px] text-ink/40">
              &copy; 2026 Lumora World. Bilingual Developmental Screening Platform.
            </p>
          </div>
          <div className="flex items-center gap-4 font-bold text-ink/70 flex-shrink-0">
            <Link href="/screening" className="hover:text-ink">Screening</Link>
            <Link href="/haven" className="hover:text-ink">Haven</Link>
            <Link href="/doctor" className="hover:text-ink">Specialist Hub</Link>
            <Link href="/feedback" className="text-amber-700 hover:text-amber-800 font-extrabold">Feedback</Link>
          </div>
        </div>
      </footer>

      {/* Floating Magic Air Wand with Camera Tracking */}
      <UniversalAirWand active={airWandActive} onToggle={setAirWandActive} accentColor="#E8A33D" />
    </div>
  );
}

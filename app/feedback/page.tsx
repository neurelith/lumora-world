'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { LanternMascot, MascotMood } from '@/components/ui/LanternMascot';
import {
  ArrowLeft,
  Star,
  Send,
  Sparkles,
  CheckCircle2,
  Heart,
  Wand2,
  Stethoscope,
  Volume2,
  Brain,
  Eye,
  BookOpen,
  School,
  User,
  ShieldCheck,
  Award,
  Globe2,
} from 'lucide-react';

export default function FeedbackPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Form State
  const [role, setRole] = useState<'teacher' | 'specialist' | 'parent' | 'judge' | 'other'>('teacher');
  const [device, setDevice] = useState<string>('tablet');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [airWandRating, setAirWandRating] = useState<number>(5);
  const [testedWorlds, setTestedWorlds] = useState<string[]>(['rune', 'sound', 'story', 'memory', 'vision']);
  const [triageRating, setTriageRating] = useState<number>(5);
  const [specialistRating, setSpecialistRating] = useState<number>(5);
  const [likedFeature, setLikedFeature] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string>('');
  const [bugs, setBugs] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dynamic mascot mood & reaction text based on user input
  const getMascotState = (): { mood: MascotMood; speech: string } => {
    if (isSubmitted) {
      return { mood: 'celebrating', speech: 'Thank you so much! Your feedback helps children everywhere! 🌟🎉' };
    }
    const currentRating = hoverRating || rating;
    if (currentRating === 5) {
      return { mood: 'celebrating', speech: '5 Stars! Woohoo! We love having you in Lumora World! ✨' };
    }
    if (currentRating === 4) {
      return { mood: 'encouraging', speech: 'Thank you! What can we polish to make it 5 stars? 🪄' };
    }
    if (currentRating === 3) {
      return { mood: 'thinking', speech: 'Tell us how we can make the activities smoother for you! 💡' };
    }
    return { mood: 'confused', speech: 'Oh no! Please share any bugs so we can fix them right away! 🛠️' };
  };

  const mascotState = getMascotState();

  const toggleWorld = (worldId: string) => {
    setTestedWorlds((prev) =>
      prev.includes(worldId) ? prev.filter((id) => id !== worldId) : [...prev, worldId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackData = {
      role,
      device,
      rating,
      airWandRating,
      testedWorlds,
      triageRating,
      specialistRating,
      likedFeature,
      suggestions,
      bugs,
      email: email || undefined,
      timestamp: Date.now(),
      submittedAt: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    try {
      // 1. Save to local storage cache for demonstration
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('lumora_community_feedback') || '[]');
        stored.push(feedbackData);
        localStorage.setItem('lumora_community_feedback', JSON.stringify(stored));
      }

      // 2. Network simulation delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.warn('[Feedback] Submission note:', err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const worldBadges = [
    { id: 'rune', name: '🪄 Rune Realm', desc: 'Air Tracing & Motor Planning', color: 'border-cyan-400 bg-cyan-50/80 text-cyan-950' },
    { id: 'sound', name: '🌿 Sound Forest', desc: 'Phonological Voice Blending', color: 'border-emerald-400 bg-emerald-50/80 text-emerald-950' },
    { id: 'story', name: '🏰 Story Castle', desc: 'Decoding & Nonword Fluency', color: 'border-indigo-400 bg-indigo-50/80 text-indigo-950' },
    { id: 'memory', name: '🏔️ Memory Mountains', desc: 'Rapid Automatized Naming', color: 'border-amber-400 bg-amber-50/80 text-amber-950' },
    { id: 'vision', name: '👁️ Vision Valley', desc: 'Visual Flow & Pacing', color: 'border-teal-400 bg-teal-50/80 text-teal-950' },
  ];

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

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-display font-bold text-ink hover:bg-slate-50 transition-colors shadow-soft-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full transition-all ${
                  language === 'en' ? 'bg-white text-ink shadow-xs' : 'text-ink/60 hover:text-ink'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-full transition-all ${
                  language === 'hi' ? 'bg-white text-ink shadow-xs' : 'text-ink/60 hover:text-ink'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────────── */}
      <main className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Soft Ambient Background Auras */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-10 right-10 h-[400px] w-[400px] rounded-full bg-amber-200/35 blur-[90px]" />
          <div className="absolute top-96 -left-20 h-[350px] w-[350px] rounded-full bg-emerald-100/40 blur-[90px]" />
        </div>

        {/* Hero Header Strip */}
        <div className="mb-8 md:mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-amber-200 bg-amber-50/90 px-3.5 py-1 text-xs font-display font-extrabold text-amber-900 shadow-soft-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Community &amp; Clinical Feedback &middot; Shaping Lumora</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-ink leading-tight">
            Help us make Lumora{' '}
            <span className="relative inline-flex items-center gap-1.5 px-3 py-0.5 rounded-2xl bg-amber-100 border-2 border-b-4 border-amber-300 text-amber-950 shadow-soft-xs -rotate-1 align-middle">
              <span>delightful</span>
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-ink/75 font-body leading-relaxed">
            Your feedback directly refines our 15-minute developmental triage battery, camera kinematics, and DALI-aligned reports for primary schools across India.
          </p>
        </div>

        {/* Success View */}
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-b-4 border-emerald-300 shadow-candy-emerald text-center space-y-6 max-w-xl mx-auto"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-soft-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="flex justify-center py-2">
              <LanternMascot mood="celebrating" size={120} speechBubble={mascotState.speech} />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink">
                Thank You For Your Feedback!
              </h2>
              <p className="text-sm font-body text-ink/70 leading-relaxed max-w-md mx-auto">
                Your responses have been recorded. Together, we are creating a warmer, more accessible learning landscape for every child.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-extrabold text-sm shadow-md border-b-4 border-emerald-800 active:translate-y-0.5 active:border-b-2 transition-all"
              >
                Back to Home Page
              </Link>
              <Link
                href="/screening"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-ink font-display font-extrabold text-sm shadow-soft-xs border-2 border-slate-200 transition-all"
              >
                Try 15-Min Screening Free
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Main Interactive Form Body */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form Cards */}
            <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
              
              {/* CARD 1: Role & Testing Device */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-b-4 border-slate-200 shadow-soft-sm space-y-6">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs">01</div>
                  <h3 className="font-display font-extrabold text-lg text-ink">About You &amp; Testing Device</h3>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink mb-2.5">
                    What is your primary perspective?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'teacher', label: 'Teacher', icon: School },
                      { id: 'specialist', label: 'Specialist / Psychologist', icon: Stethoscope },
                      { id: 'parent', label: 'Parent / Guardian', icon: User },
                      { id: 'judge', label: 'Reviewer / Judge', icon: Award },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = role === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRole(item.id as any)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col items-start gap-2 ${
                            isSelected
                              ? 'bg-amber-50 border-amber-400 border-b-4 shadow-soft-xs text-amber-950 scale-[1.02]'
                              : 'bg-paper border-slate-200 hover:border-amber-300 text-ink/70'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span className="font-display font-extrabold text-xs leading-tight">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Device Selection */}
                <div>
                  <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink mb-2">
                    Which hardware did you test on?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'tablet', label: '📱 iPad / Android Tablet' },
                      { id: 'laptop', label: '💻 Laptop / PC' },
                      { id: 'chromebook', label: '💻 Chromebook' },
                      { id: 'phone', label: '📱 Mobile Phone' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDevice(d.id)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-display font-bold transition-all cursor-pointer ${
                          device === d.id
                            ? 'bg-ink text-white border-ink shadow-soft-xs'
                            : 'bg-paper text-ink/70 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD 2: Experience & Ergonomics */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-b-4 border-slate-200 shadow-soft-sm space-y-6">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="p-2 rounded-xl bg-cyan-100 text-cyan-900 font-bold text-xs">02</div>
                  <h3 className="font-display font-extrabold text-lg text-ink">Child Experience &amp; Ergonomics</h3>
                </div>

                {/* Star Rating */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink">
                      Overall Experience Rating
                    </label>
                    <span className="text-xs font-display font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      {rating === 5 ? '🌟 5/5 — Extraordinary' : rating === 4 ? '✨ 4/5 — Very Good' : rating === 3 ? '👍 3/5 — Good' : '🛠️ Needs Polish'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              isFilled
                                ? 'text-amber-500 fill-amber-400 drop-shadow-xs'
                                : 'text-slate-300 fill-slate-100'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Magic Air Wand Rating */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink">
                      🪄 Magic Air Wand (Camera Finger Tracking &amp; Pinch Click)
                    </label>
                    <span className="text-xs font-display font-extrabold text-cyan-900">
                      {airWandRating} / 5
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAirWandRating(val)}
                        className={`py-2 rounded-xl border-2 font-display font-extrabold text-sm transition-all cursor-pointer ${
                          airWandRating === val
                            ? 'bg-cyan-500 text-white border-cyan-600 border-b-4 shadow-soft-xs'
                            : 'bg-paper text-ink/70 border-slate-200 hover:border-cyan-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-ink/50 font-body px-1 mt-1">
                    <span>1 (Laggy / Hard)</span>
                    <span>5 (Smooth &amp; Magic)</span>
                  </div>
                </div>

                {/* Tested Worlds Multi-Select */}
                <div>
                  <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink mb-2">
                    Which game activities did you explore? (Tap to toggle)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {worldBadges.map((w) => {
                      const isChecked = testedWorlds.includes(w.id);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => toggleWorld(w.id)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? `${w.color} border-b-4 shadow-soft-xs scale-[1.01]`
                              : 'bg-paper border-slate-200 text-ink/50 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <p className="font-display font-extrabold text-xs leading-snug">{w.name}</p>
                            <p className="text-[11px] font-body opacity-80">{w.desc}</p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                              isChecked ? 'bg-ink text-white border-ink' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked ? '✓' : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* CARD 3: Open Insights & Suggestions */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-b-4 border-slate-200 shadow-soft-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs">03</div>
                  <h3 className="font-display font-extrabold text-lg text-ink">Your Thoughts &amp; Ideas</h3>
                </div>

                {/* Favorite Feature */}
                <div>
                  <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink mb-1.5">
                    ⭐ What was your favorite moment or feature?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lumi following finger in air, voice blending sounds, clean report card..."
                    value={likedFeature}
                    onChange={(e) => setLikedFeature(e.target.value)}
                    className="w-full min-h-[44px] px-4 rounded-2xl border-2 border-slate-200 font-body text-xs text-ink focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 shadow-soft-xs"
                  />
                </div>

                {/* Improvements */}
                <div>
                  <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink mb-1.5">
                    🛠️ What could be improved, simplified, or added?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share any friction, pacing thoughts, or ideas for Indian classrooms..."
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 font-body text-xs text-ink focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 shadow-soft-xs resize-none"
                  />
                </div>

                {/* Bugs */}
                <div>
                  <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink mb-1.5">
                    🐛 Any bugs or glitches noticed?
                  </label>
                  <input
                    type="text"
                    placeholder="Mention browser (Chrome/Safari/Edge), camera permissions, or visual bugs..."
                    value={bugs}
                    onChange={(e) => setBugs(e.target.value)}
                    className="w-full min-h-[44px] px-4 rounded-2xl border-2 border-slate-200 font-body text-xs text-ink focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 shadow-soft-xs"
                  />
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-xs font-display font-extrabold uppercase tracking-wider text-ink mb-1.5">
                    📬 Email <span className="text-ink/40 font-normal lowercase">(optional · for updates on clinical trials)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@school.edu or your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-[44px] px-4 rounded-2xl border-2 border-slate-200 font-body text-xs text-ink focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 shadow-soft-xs"
                  />
                </div>

                {/* Submit Action Strip */}
                <div className="pt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-ink/60 font-body">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Zero tracking pixels · 100% private</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-display font-extrabold text-sm shadow-md border-b-4 border-amber-700 active:translate-y-0.5 active:border-b-2 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Right Column: Sticky Living Mascot Companion Card */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="p-6 rounded-3xl bg-white border-2 border-b-4 border-amber-200 shadow-candy-amber flex flex-col items-center text-center space-y-4">
                <span className="text-[11px] font-display font-extrabold tracking-wider text-amber-900 bg-amber-100/90 px-3 py-1 rounded-full uppercase">
                  LIVE COMPANION
                </span>

                <div className="py-2">
                  <LanternMascot
                    mood={mascotState.mood}
                    size={110}
                    speechBubble={mascotState.speech}
                  />
                </div>

                <div className="border-t border-amber-100 pt-3 w-full space-y-2 text-xs font-body text-ink/75">
                  <div className="flex items-center gap-2 text-left">
                    <Heart className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>Built for teachers &amp; pediatricians across India</span>
                  </div>
                  <div className="flex items-center gap-2 text-left">
                    <Award className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Calibrated with DALI assessment norms</span>
                  </div>
                  <div className="flex items-center gap-2 text-left">
                    <Globe2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Bilingual English &amp; Hindi support</span>
                  </div>
                </div>
              </div>

              {/* Quick Links Card */}
              <div className="p-5 rounded-3xl bg-paper border border-slate-200 shadow-soft-xs space-y-2.5 text-xs font-display font-bold text-ink/70">
                <p className="uppercase text-[10px] tracking-wider text-ink/40 font-extrabold">Quick Exploration</p>
                <Link href="/screening" className="flex items-center justify-between p-2 rounded-xl hover:bg-white transition-colors">
                  <span>15-Minute Battery</span>
                  <span className="text-emerald-600">Start Free &rarr;</span>
                </Link>
                <Link href="/haven" className="flex items-center justify-between p-2 rounded-xl hover:bg-white transition-colors">
                  <span>My Haven Companion</span>
                  <span className="text-amber-600">3-Min Quest &rarr;</span>
                </Link>
                <Link href="/doctor" className="flex items-center justify-between p-2 rounded-xl hover:bg-white transition-colors">
                  <span>Specialist Hub</span>
                  <span className="text-indigo-600">DALI Intake &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

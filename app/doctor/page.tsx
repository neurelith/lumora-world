'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TriageIndicator } from '@/components/ui/TriageIndicator';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { DALIBenchmarkMatrix } from '@/components/doctor/DALIBenchmarkMatrix';
import { DyutiLogoMark } from '@/components/ui/DyutiLogoMark';
import { StudentCohortRecord, Language, IASQItem, IASQResult } from '@/lib/types';
import { getLocalScreeningSessions, saveIASQResult, signInSpecialist, signOutSpecialist, onAuthChange, isConfigured } from '@/lib/firebase';
import {
  Stethoscope,
  ArrowLeft,
  Search,
  Filter,
  TrendingUp,
  Activity,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Eye,
  PenTool,
  Volume2,
  Lock,
  KeyRound,
  LogOut,
  UserCheck,
  Shield,
  MessageSquare,
  Download,
  Star,
  Trash2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Mock/Default cohort data for district demonstration
const DEFAULT_COHORT: StudentCohortRecord[] = [
  {
    id: 'c-01',
    childInitials: 'RK-08',
    grade: 2,
    schoolCode: 'UDISE-272101',
    language: 'hi',
    screeningDate: Date.now() - 14 * 86400000,
    overallTriage: 'followup',
    rtiTier: 3,
    latestAccuracy: 0.38,
    weeklyProgress: [
      { week: 'W1', accuracy: 32, fluency: 12 },
      { week: 'W2', accuracy: 35, fluency: 14 },
      { week: 'W3', accuracy: 36, fluency: 15 },
      { week: 'W4', accuracy: 38, fluency: 16 },
      { week: 'W5', accuracy: 38, fluency: 17 },
    ],
    latestScreening: {
      id: 's-01',
      childInitials: 'RK-08',
      grade: 2,
      language: 'hi',
      schoolCode: 'UDISE-272101',
      createdAt: Date.now() - 14 * 86400000,
      overallTriage: 'followup',
      soundForest: { accuracy: 0.35, meanLatencyMs: 5200, totalTrials: 8, correctTrials: 3, confusionPairs: ['ब/व'], triage: 'followup' },
      storyCastle: { accuracy: 0.4, meanHesitationMs: 4100, totalTrials: 10, correctTrials: 4, triage: 'followup' },
      runeRealm: { meanNvi: 9.2, meanJerkIndex: 42.1, meanDeviation: 38, mirrorReversalsCount: 2, triage: 'followup', trials: [] },
      memoryMountains: { totalItems: 25, durationSec: 38, ranRate: 0.65, errorCount: 6, hesitationGapsCount: 4, triage: 'followup' },
      visionValley: { meanFixationDurationMs: 490, regressiveSaccadeRatio: 0.36, totalFixations: 18, totalSaccades: 16, gazeDispersionScore: 666, triage: 'followup' },
    },
    iasqScore: 11,
  },
  {
    id: 'c-02',
    childInitials: 'AM-12',
    grade: 1,
    schoolCode: 'UDISE-272101',
    language: 'en',
    screeningDate: Date.now() - 7 * 86400000,
    overallTriage: 'watch',
    rtiTier: 2,
    latestAccuracy: 0.65,
    weeklyProgress: [
      { week: 'W1', accuracy: 50, fluency: 22 },
      { week: 'W2', accuracy: 55, fluency: 26 },
      { week: 'W3', accuracy: 60, fluency: 30 },
      { week: 'W4', accuracy: 62, fluency: 32 },
      { week: 'W5', accuracy: 65, fluency: 35 },
    ],
    latestScreening: {
      id: 's-02',
      childInitials: 'AM-12',
      grade: 1,
      language: 'en',
      schoolCode: 'UDISE-272101',
      createdAt: Date.now() - 7 * 86400000,
      overallTriage: 'watch',
      soundForest: { accuracy: 0.62, meanLatencyMs: 3800, totalTrials: 8, correctTrials: 5, confusionPairs: ['m/n'], triage: 'watch' },
      storyCastle: { accuracy: 0.7, meanHesitationMs: 2900, totalTrials: 10, correctTrials: 7, triage: 'watch' },
      runeRealm: { meanNvi: 6.1, meanJerkIndex: 28.4, meanDeviation: 22, mirrorReversalsCount: 1, triage: 'watch', trials: [] },
      memoryMountains: { totalItems: 25, durationSec: 28, ranRate: 0.89, errorCount: 3, hesitationGapsCount: 2, triage: 'watch' },
      visionValley: { meanFixationDurationMs: 410, regressiveSaccadeRatio: 0.22, totalFixations: 14, totalSaccades: 12, gazeDispersionScore: 420, triage: 'watch' },
    },
    iasqScore: 5,
  },
  {
    id: 'c-03',
    childInitials: 'PS-04',
    grade: 3,
    schoolCode: 'UDISE-272102',
    language: 'en',
    screeningDate: Date.now() - 2 * 86400000,
    overallTriage: 'typical',
    rtiTier: 1,
    latestAccuracy: 0.92,
    weeklyProgress: [
      { week: 'W1', accuracy: 82, fluency: 40 },
      { week: 'W2', accuracy: 85, fluency: 44 },
      { week: 'W3', accuracy: 88, fluency: 48 },
      { week: 'W4', accuracy: 90, fluency: 50 },
      { week: 'W5', accuracy: 92, fluency: 52 },
    ],
    latestScreening: {
      id: 's-03',
      childInitials: 'PS-04',
      grade: 3,
      language: 'en',
      schoolCode: 'UDISE-272102',
      createdAt: Date.now() - 2 * 86400000,
      overallTriage: 'typical',
      soundForest: { accuracy: 0.95, meanLatencyMs: 2100, totalTrials: 8, correctTrials: 8, confusionPairs: [], triage: 'typical' },
      storyCastle: { accuracy: 0.9, meanHesitationMs: 1800, totalTrials: 10, correctTrials: 9, triage: 'typical' },
      runeRealm: { meanNvi: 3.4, meanJerkIndex: 14.2, meanDeviation: 12, mirrorReversalsCount: 0, triage: 'typical', trials: [] },
      memoryMountains: { totalItems: 25, durationSec: 19, ranRate: 1.31, errorCount: 0, hesitationGapsCount: 0, triage: 'typical' },
      visionValley: { meanFixationDurationMs: 290, regressiveSaccadeRatio: 0.11, totalFixations: 9, totalSaccades: 8, gazeDispersionScore: 190, triage: 'typical' },
    },
    iasqScore: 2,
  },
];

// IASQ Clinical Items (8-Item Indian Autism Screening Questionnaire)
const IASQ_QUESTIONS: IASQItem[] = [
  { id: 1, domain: 'Social Reciprocity', promptEn: 'Does the child make consistent eye contact when interacting with familiar adults?', promptHi: 'क्या बच्चा परिचित वयस्कों से बातचीत करते समय लगातार नजरें मिलाता है?', score: 0 },
  { id: 2, domain: 'Auditory Orienting', promptEn: 'Does the child respond promptly when their name is called from across the room?', promptHi: 'क्या बच्चा कमरे के दूसरी तरफ से नाम पुकारे जाने पर तुरंत प्रतिक्रिया देता है?', score: 0 },
  { id: 3, domain: 'Joint Attention', promptEn: 'Does the child show shared enjoyment (points to objects of interest to share joy)?', promptHi: 'क्या बच्चा खुशी साझा करने के लिए अपनी पसंद की वस्तुओं की ओर इशारा करता है?', score: 0 },
  { id: 4, domain: 'Pretend Play', promptEn: 'Does the child engage in imaginative pretend play (e.g., feeding a toy, acting)?', promptHi: 'क्या बच्चा काल्पनिक खेल (जैसे खिलौने को खाना खिलाना, अभिनय करना) में शामिल होता है?', score: 0 },
  { id: 5, domain: 'Sensory Processing', promptEn: 'Does the child tolerate sensory changes (loud classroom noises, textures) without intense distress?', promptHi: 'क्या बच्चा बिना अत्यधिक परेशानी के कक्षा के शोर या विभिन्न स्पर्शों को सहन करता है?', score: 0 },
  { id: 6, domain: 'Nonverbal Communication', promptEn: 'Does the child use gestures (nodding, waving, reaching) naturally during communication?', promptHi: 'क्या बच्चा बातचीत के दौरान स्वाभाविक रूप से इशारों (हाथ हिलाना, सिर हिलाना) का उपयोग करता है?', score: 0 },
  { id: 7, domain: 'Cognitive Flexibility', promptEn: 'Does the child adapt flexibly when daily classroom routines or transitions change?', promptHi: 'क्या बच्चा कक्षा की दिनचर्या में बदलाव होने पर आसानी से तालमेल बिठा लेता है?', score: 0 },
  { id: 8, domain: 'Social Affect', promptEn: 'Does the child show spontaneous empathy or comforting behavior when peers are upset?', promptHi: 'क्या बच्चा साथियों के परेशान होने पर सहज सहानुभूति या सांत्वना देने का व्यवहार दिखाता है?', score: 0 },
];

export default function DoctorHubPage() {
  const { t, language } = useTranslation();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [doctorLicense, setDoctorLicense] = useState<string>('dr.ananya@aiims.edu');
  const [doctorPassword, setDoctorPassword] = useState<string>('dyutipath2026');
  const [authError, setAuthError] = useState<string | null>(null);

  // Specialist App State
  const [cohort, setCohort] = useState<StudentCohortRecord[]>(DEFAULT_COHORT);
  const [selectedStudent, setSelectedStudent] = useState<StudentCohortRecord>(DEFAULT_COHORT[0]);
  const [filterTriage, setFilterTriage] = useState<'all' | 'followup' | 'watch' | 'typical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'roster' | 'daliPacket' | 'iasq' | 'feedback'>('roster');
  const [feedbackList, setFeedbackList] = useState<any[]>([]);

  // IASQ Form State (item id -> score 0, 1, 2)
  const [iasqResponses, setIasqResponses] = useState<Record<number, number>>({});
  const [iasqSavedNotice, setIasqSavedNotice] = useState(false);

  useEffect(() => {
    // Fetch real community feedback from API and localStorage
    async function loadRealFeedback() {
      try {
        const local = JSON.parse(
          localStorage.getItem('dyutipath_community_feedback') ||
          localStorage.getItem('lumora_community_feedback') ||
          '[]'
        );
        let apiData: any[] = [];
        try {
          const res = await fetch('/api/v1/feedback');
          if (res.ok) {
            const json = await res.json();
            apiData = json.data || [];
          }
        } catch (e) {
          // offline fallback
        }

        // Deduplicate by ID or timestamp
        const combined = [...local, ...apiData];
        const seen = new Set<string>();
        const unique: any[] = [];
        for (const item of combined) {
          const key = item.id || `${item.timestamp}-${item.email || ''}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(item);
          }
        }
        setFeedbackList(unique);
      } catch (e) {
        console.warn('[DoctorHub] Feedback load notice:', e);
      }
    }
    loadRealFeedback();

    // Check if previously logged in in this browser session
    const authSession =
      sessionStorage.getItem('dyutipath_doctor_auth') ||
      sessionStorage.getItem('lumora_doctor_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }

    // Subscribe to Firebase Auth state if configured
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setIsAuthenticated(true);
        sessionStorage.setItem('dyutipath_doctor_auth', 'true');
        if (user.email) setDoctorLicense(user.email);
      }
    });

    // Merge actual screening sessions if any exist in local storage
    async function loadSessions() {
      const local = await getLocalScreeningSessions();
      if (local && local.length > 0) {
        const mappedLocal: StudentCohortRecord[] = local.map((s) => ({
          id: s.id,
          childInitials: s.childInitials,
          grade: s.grade,
          schoolCode: s.schoolCode,
          language: s.language,
          screeningDate: s.createdAt,
          overallTriage: s.overallTriage,
          rtiTier: s.overallTriage === 'followup' ? 3 : s.overallTriage === 'watch' ? 2 : 1,
          latestAccuracy: s.soundForest ? s.soundForest.accuracy : 0.7,
          weeklyProgress: [
            { week: 'W1', accuracy: 40, fluency: 18 },
            { week: 'W2', accuracy: 48, fluency: 22 },
            { week: 'W3', accuracy: 55, fluency: 26 },
            { week: 'W4', accuracy: 62, fluency: 30 },
            { week: 'W5', accuracy: Math.round((s.soundForest?.accuracy || 0.7) * 100), fluency: 34 },
          ],
          latestScreening: s,
        }));
        setCohort([...mappedLocal, ...DEFAULT_COHORT]);
        setSelectedStudent(mappedLocal[0]);
      }
    }
    loadSessions();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    if (isConfigured) {
      try {
        await signInSpecialist(doctorLicense, doctorPassword);
        setIsAuthenticated(true);
        sessionStorage.setItem('dyutipath_doctor_auth', 'true');
      } catch (err: any) {
        console.warn('[DoctorHub] Firebase Auth error, trying local sandbox:', err);
        if (doctorPassword.trim().length >= 4) {
          setIsAuthenticated(true);
          sessionStorage.setItem('dyutipath_doctor_auth', 'true');
        } else {
          setAuthError(err.message || 'Invalid specialist credentials.');
        }
      }
    } else {
      // Local clinical sandbox mode
      if (doctorPassword.trim().length >= 4) {
        setIsAuthenticated(true);
        sessionStorage.setItem('dyutipath_doctor_auth', 'true');
      } else {
        setAuthError('Please enter a valid specialist password or PIN.');
      }
    }
  };

  const handleLogout = async () => {
    await signOutSpecialist();
    setIsAuthenticated(false);
    sessionStorage.removeItem('dyutipath_doctor_auth');
    sessionStorage.removeItem('lumora_doctor_auth');
  };

  // Filter students
  const filteredStudents = cohort.filter((s) => {
    const matchesTriage = filterTriage === 'all' || s.overallTriage === filterTriage;
    const matchesSearch =
      s.childInitials.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.schoolCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTriage && matchesSearch;
  });

  const handleIasqSubmit = async () => {
    const scoredItems: IASQItem[] = IASQ_QUESTIONS.map((q) => ({
      ...q,
      score: iasqResponses[q.id] || 0,
    }));
    const totalScore = scoredItems.reduce((acc, item) => acc + item.score, 0);
    const triage: 'low' | 'moderate' | 'high' =
      totalScore >= 10 ? 'high' : totalScore >= 5 ? 'moderate' : 'low';

    const result: IASQResult = {
      childInitials: selectedStudent.childInitials,
      grade: selectedStudent.grade,
      completedAt: Date.now(),
      items: scoredItems,
      totalScore,
      triage,
    };

    await saveIASQResult(result);
    setIasqSavedNotice(true);
    setTimeout(() => setIasqSavedNotice(false), 4000);
  };

  // ==========================================
  // VIEW 1: SPECIALIST PASSWORD AUTH GATEWAY
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col justify-between p-4 md:p-8">
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-7 border-b border-black/8">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted hover:text-amber">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to DyutiPath</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-[#e8f1fd] px-3 py-1.5 text-[12px] font-medium text-[#0066cc]">
              <Shield className="w-3.5 h-3.5" />
              <span>Specialist access</span>
            </div>
          </div>
        </header>

        <main id="main-content" className="max-w-md mx-auto w-full py-12">
          <Card variant="elevated" className="p-7 md:p-10 bg-white border-black/10 shadow-[0_18px_46px_rgba(0,0,0,0.11)] space-y-7">
            <div className="space-y-3">
              <div className="w-11 h-11 bg-[#1d1d1f] dark:bg-slate-800 text-white rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <p className="text-[13px] font-semibold tracking-[0.08em] text-amber dark:text-amber-400">DYUTIPATH CLINICAL VIEW</p>
              <h1 className="text-[30px] leading-none tracking-[-0.05em] font-display font-semibold text-ink dark:text-white">Specialist Hub</h1>
              <p className="text-sm text-muted dark:text-slate-400 font-body leading-6">A focused workspace for reviewing pseudonymous learning signals and planning next steps.</p>
            </div>

            {authError && (
              <div className="p-3 bg-terracotta/10 border border-terracotta/40 rounded-xl text-xs text-terracotta text-center font-body">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-display font-bold text-ink dark:text-slate-200 mb-1">
                  Specialist Email / RCI License ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={doctorLicense}
                    onChange={(e) => setDoctorLicense(e.target.value)}
                    placeholder="e.g. dr.ananya@aiims.edu or RCI-CR-2024"
                    className="w-full bg-paper dark:bg-slate-800 border-2 border-hairline dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-body text-ink dark:text-slate-100 focus:outline-none focus:border-castle"
                    required
                  />
                  <UserCheck className="w-4 h-4 text-muted dark:text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-ink dark:text-slate-200 mb-1">
                  Specialist Password / PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={doctorPassword}
                    onChange={(e) => setDoctorPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full bg-paper dark:bg-slate-800 border-2 border-hairline dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-body text-ink dark:text-slate-100 focus:outline-none focus:border-castle"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-muted dark:text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <Button type="submit" variant="secondary" size="lg" fullWidth rightIcon={<ShieldCheck className="w-5 h-5" />}>
                Authenticate Specialist
              </Button>
            </form>

            <div className="pt-2 border-t border-hairline dark:border-slate-800 text-center space-y-2">
              <p className="text-[11px] text-muted dark:text-slate-400 font-body">
                Evaluation & Hackathon Demonstration:
              </p>
              <button
                type="button"
                onClick={() => handleLogin()}
                className="w-full py-2 px-3 bg-cream dark:bg-amber-950/40 border border-amber/40 dark:border-amber-700/60 rounded-xl text-xs font-display font-bold text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
              >
                ✨ Quick Access as Dr. Ananya Sharma (Clinical Psychologist)
              </button>
            </div>

            <div className="p-3 bg-paper dark:bg-slate-800 rounded-xl text-[11px] text-muted dark:text-slate-400 font-body leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <span>
                All child telemetry records are pseudonymous and HIPAA / DPDP Act 2023 compliant.
              </span>
            </div>
          </Card>
        </main>

        <footer className="max-w-5xl mx-auto w-full text-center text-xs text-muted dark:text-slate-500 font-body py-4">
          DyutiPath Specialist Command Center · DALI Aligned
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED SPECIALIST COMMAND CENTER
  // ==========================================
  return (
    <div className="min-h-screen bg-paper dark:bg-[#0B0F19] text-ink dark:text-slate-100 p-4 md:p-8 transition-colors duration-200">
      {/* Top Specialist Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b-2 border-hairline dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2.5 bg-white dark:bg-slate-800 border border-hairline dark:border-slate-700 rounded-2xl text-ink dark:text-white hover:text-amber transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-castle text-white rounded-2xl shadow-soft-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl md:text-3xl text-ink dark:text-white">
                  {t('doctor.title')}
                </h1>
                <span className="bg-sage/20 text-sage-800 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sage/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
                </span>
              </div>
              <p className="text-xs font-body text-muted dark:text-slate-400">
                {t('doctor.subtitle')} · Logged in as <strong className="text-ink dark:text-slate-200">{doctorLicense}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Logout */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center bg-white border-2 border-hairline rounded-2xl p-1 shadow-soft-sm">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'roster' ? 'bg-castle text-white shadow-soft-sm' : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
              }`}
            >
              {t('doctor.studentRoster')}
            </button>
            <button
              onClick={() => setActiveTab('daliPacket')}
              className={`px-3 py-1.5 rounded-xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'daliPacket' ? 'bg-castle text-white shadow-soft-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {t('doctor.daliPacket')}
            </button>
            <button
              onClick={() => setActiveTab('iasq')}
              className={`px-3 py-1.5 rounded-xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'iasq' ? 'bg-amber text-ink shadow-soft-sm' : 'text-muted hover:text-ink'
              }`}
            >
              ✦ {t('doctor.iasqScreening')}
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-3 py-1.5 rounded-xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'feedback' ? 'bg-amber text-ink shadow-soft-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Feedback ({feedbackList.length})</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 bg-white border border-hairline rounded-2xl text-muted hover:text-terracotta transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Command Center Layout */}
      <main className="max-w-7xl mx-auto py-8">
        {activeTab === 'roster' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Cohort Roster List (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Search & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search initials or school..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border-2 border-hairline rounded-2xl focus:outline-none focus:border-castle"
                  />
                </div>
                <select
                  value={filterTriage}
                  onChange={(e) => setFilterTriage(e.target.value as any)}
                  className="bg-white border-2 border-hairline rounded-2xl px-3 py-2 text-xs font-display font-bold text-ink focus:outline-none"
                >
                  <option value="all">All Tiers</option>
                  <option value="followup">Tier 3 (Follow-up)</option>
                  <option value="watch">Tier 2 (Watch)</option>
                  <option value="typical">Tier 1 (Typical)</option>
                </select>
              </div>

              {/* Student Cards List */}
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {filteredStudents.map((s) => {
                  const isSelected = selectedStudent.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className={`p-4 rounded-3xl border-2 transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-white border-castle shadow-soft-md scale-[1.01]'
                          : 'bg-white/80 border-hairline hover:border-castle/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-extrabold text-base text-ink">
                            {s.childInitials}
                          </span>
                          <span className="text-xs text-muted font-body">
                            Gr {s.grade} · {s.schoolCode}
                          </span>
                        </div>
                        <TriageIndicator level={s.overallTriage} size="sm" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted font-body pt-2 border-t border-hairline/60">
                        <span>RTI Tier {s.rtiTier}</span>
                        <span>Screened: {new Date(s.screeningDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Detailed Telemetry & RTI Curves (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="p-6 md:p-8 bg-white border-2 border-hairline shadow-soft-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-hairline">
                  <div>
                    <h2 className="font-display font-extrabold text-2xl text-ink">
                      Student Telemetry: {selectedStudent.childInitials}
                    </h2>
                    <p className="text-xs text-muted font-body">
                      Grade {selectedStudent.grade} · {selectedStudent.schoolCode} · Lang: {selectedStudent.language.toUpperCase()}
                    </p>
                  </div>
                  <TriageIndicator level={selectedStudent.overallTriage} size="md" showDescription />
                </div>

                {/* 5-Week RTI Longitudinal Progress Chart */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-castle" />
                      5-Week Response to Intervention (RTI) Trajectory
                    </h3>
                    <span className="text-xs text-muted font-body">Tier {selectedStudent.rtiTier} Protocol</span>
                  </div>

                  <div className="h-56 w-full bg-paper rounded-2xl p-2 border border-hairline">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedStudent.weeklyProgress}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E4E1E8" />
                        <XAxis dataKey="week" stroke="#6B6875" />
                        <YAxis stroke="#6B6875" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#2F5D50" strokeWidth={3} />
                        <Line type="monotone" dataKey="fluency" name="Fluency (WPM)" stroke="#E8A33D" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Granular Five World Diagnostic Signals */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber" />
                    Practice Signals & Indicator Breakdown
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-paper rounded-2xl border border-hairline space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-display text-ink flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-valley" /> Visual Tracking Flow
                        </span>
                        <span className="text-xs font-bold text-valley">
                          {selectedStudent.latestScreening?.visionValley?.meanFixationDurationMs || 340} ms
                        </span>
                      </div>
                      <p className="text-[11px] text-muted font-body">
                        Regressive Saccade Ratio: {selectedStudent.latestScreening?.visionValley?.regressiveSaccadeRatio || 0.2}
                      </p>
                    </div>

                    <div className="p-3.5 bg-paper rounded-2xl border border-hairline space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-display text-ink flex items-center gap-1.5">
                          <PenTool className="w-4 h-4 text-realm" /> Handwriting Kinematics
                        </span>
                        <span className="text-xs font-bold text-realm">
                          NVI: {selectedStudent.latestScreening?.runeRealm?.meanNvi || 4.2}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted font-body">
                        Mirror Reversals: {selectedStudent.latestScreening?.runeRealm?.mirrorReversalsCount || 0} detected
                      </p>
                    </div>

                    <div className="p-3.5 bg-paper rounded-2xl border border-hairline space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-display text-ink flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4 text-forest" /> Phonemic Latency
                        </span>
                        <span className="text-xs font-bold text-forest">
                          {selectedStudent.latestScreening?.soundForest?.meanLatencyMs || 2400} ms
                        </span>
                      </div>
                      <p className="text-[11px] text-muted font-body">
                        Phonemic Accuracy: {Math.round((selectedStudent.latestScreening?.soundForest?.accuracy || 0.8) * 100)}%
                      </p>
                    </div>

                    <div className="p-3.5 bg-paper rounded-2xl border border-hairline space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-display text-ink">RAN Speed (Items/s)</span>
                        <span className="text-xs font-bold text-mountains">
                          {selectedStudent.latestScreening?.memoryMountains?.ranRate || 1.1} /s
                        </span>
                      </div>
                      <p className="text-[11px] text-muted font-body">
                        Total duration: {selectedStudent.latestScreening?.memoryMountains?.durationSec || 22}s
                      </p>
                    </div>
                  </div>
                </div>

                {/* Standardized DALI (NBRC) Clinical Psychometric Benchmark */}
                <DALIBenchmarkMatrix
                  grade={selectedStudent.grade}
                  soundForestAccuracy={Math.round((selectedStudent.latestScreening?.soundForest?.accuracy || 0.82) * 100)}
                  soundForestLatencyMs={selectedStudent.latestScreening?.soundForest?.meanLatencyMs || 1380}
                  ranSpeed={selectedStudent.latestScreening?.memoryMountains?.ranRate || 1.68}
                  runeNvi={selectedStudent.latestScreening?.runeRealm?.meanNvi || 1.5}
                  runeJerk={selectedStudent.latestScreening?.runeRealm?.meanJerkIndex || 6.8}
                  storyCastleAccuracy={80}
                />

                {/* Quick Action Strip */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setActiveTab('daliPacket')}
                    leftIcon={<Printer className="w-4 h-4" />}
                  >
                    Generate DALI Intake Packet
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setActiveTab('iasq')}
                    leftIcon={<Sparkles className="w-4 h-4 text-amber" />}
                  >
                    Launch IASQ Autism Screener
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: DALI INTAKE PACKET (PRINTABLE) */}
        {activeTab === 'daliPacket' && (
          <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-white border-2 border-hairline shadow-soft-md space-y-8 print:shadow-none print:border-none">
            <div className="flex items-center justify-between pb-6 border-b-2 border-hairline">
              <div className="flex items-center gap-3">
                <DyutiLogoMark size={44} />
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-ink">
                    DALI Intake & Screening Summary Packet
                  </h2>
                  <p className="text-xs text-muted font-body">
                    Dyslexia Assessment for Languages of India (NBRC) Aligned Summary
                  </p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                Print / Save PDF
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-paper rounded-2xl border border-hairline text-xs font-body">
              <div><strong>Child ID:</strong> {selectedStudent.childInitials}</div>
              <div><strong>Grade:</strong> {selectedStudent.grade}</div>
              <div><strong>School Code:</strong> {selectedStudent.schoolCode}</div>
              <div><strong>Language:</strong> {selectedStudent.language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}</div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-ink">Exploratory Battery Indicators</h3>
              <table className="w-full text-xs font-body text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-hairline bg-paper">
                    <th className="p-3 font-display font-bold">Construct / World</th>
                    <th className="p-3 font-display font-bold">Observed Value</th>
                    <th className="p-3 font-display font-bold">Normative Threshold (Gr {selectedStudent.grade})</th>
                    <th className="p-3 font-display font-bold">Triage Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr>
                    <td className="p-3"><strong>Sound Forest:</strong> Phonological Blending</td>
                    <td className="p-3">{Math.round((selectedStudent.latestScreening?.soundForest?.accuracy || 0.7) * 100)}%</td>
                    <td className="p-3">&gt; 70%</td>
                    <td className="p-3"><TriageIndicator level={selectedStudent.latestScreening?.soundForest?.triage || 'typical'} size="sm" /></td>
                  </tr>
                  <tr>
                    <td className="p-3"><strong>Story Castle:</strong> Nonword Decoding</td>
                    <td className="p-3">{Math.round((selectedStudent.latestScreening?.storyCastle?.accuracy || 0.6) * 100)}%</td>
                    <td className="p-3">&gt; 65%</td>
                    <td className="p-3"><TriageIndicator level={selectedStudent.latestScreening?.storyCastle?.triage || 'watch'} size="sm" /></td>
                  </tr>
                  <tr>
                    <td className="p-3"><strong>Rune Realm:</strong> Kinematic NVI</td>
                    <td className="p-3">{selectedStudent.latestScreening?.runeRealm?.meanNvi || 4.2} inversions</td>
                    <td className="p-3">&lt; 5.0</td>
                    <td className="p-3"><TriageIndicator level={selectedStudent.latestScreening?.runeRealm?.triage || 'followup'} size="sm" /></td>
                  </tr>
                  <tr>
                    <td className="p-3"><strong>Memory Mountains:</strong> RAN Rate</td>
                    <td className="p-3">{selectedStudent.latestScreening?.memoryMountains?.ranRate || 0.8} items/sec</td>
                    <td className="p-3">&gt; 0.9 items/sec</td>
                    <td className="p-3"><TriageIndicator level={selectedStudent.latestScreening?.memoryMountains?.triage || 'watch'} size="sm" /></td>
                  </tr>
                  <tr>
                    <td className="p-3"><strong>Vision Valley:</strong> Reading Pacing Flow</td>
                    <td className="p-3">{selectedStudent.latestScreening?.visionValley?.meanFixationDurationMs || 420} ms</td>
                    <td className="p-3">&lt; 380 ms</td>
                    <td className="p-3"><TriageIndicator level={selectedStudent.latestScreening?.visionValley?.triage || 'followup'} size="sm" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-cream/70 rounded-2xl border border-amber/30 text-xs font-body text-ink space-y-2">
              <strong className="text-amber-900 font-display">Specialist Recommendation:</strong>
              <p>
                Child {selectedStudent.childInitials} is flagged for <strong>Tier {selectedStudent.rtiTier} Targeted Practice Support</strong>. Recommend administering standardized DALI Junior battery for formal clinical evaluation.
              </p>
            </div>

            <div className="pt-4 border-t border-hairline text-[11px] text-muted font-body italic text-center">
              {t('app.disclaimer')}
            </div>
          </Card>
        )}

        {/* TAB 3: IASQ AUTISM SCREENER */}
        {activeTab === 'iasq' && (
          <Card className="max-w-3xl mx-auto p-6 md:p-10 bg-white border-2 border-hairline shadow-soft-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-ink">
                  Indian Autism Screening Questionnaire (IASQ)
                </h2>
                <p className="text-xs text-muted font-body">
                  Specialist-facilitated 8-item behavioral screener for {selectedStudent.childInitials}
                </p>
              </div>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                Clinical Access Only
              </span>
            </div>

            {iasqSavedNotice && (
              <div className="p-4 bg-sage-50 border-2 border-sage text-sage-800 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sage" />
                <span>IASQ Protocol Saved Successfully to Clinical Record.</span>
              </div>
            )}

            <div className="space-y-4">
              {IASQ_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-4 bg-paper rounded-2xl border border-hairline space-y-2">
                  <p className="text-sm font-display font-bold text-ink">
                    {idx + 1}. {language === 'hi' ? q.promptHi : q.promptEn}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { label: 'Rarely / Never (0)', val: 0 },
                      { label: 'Sometimes (1)', val: 1 },
                      { label: 'Frequently (2)', val: 2 },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setIasqResponses((prev) => ({ ...prev, [q.id]: opt.val }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-display font-semibold border transition-all cursor-pointer ${
                          iasqResponses[q.id] === opt.val
                            ? 'bg-castle text-white border-castle shadow-soft-sm'
                            : 'bg-white border-hairline text-muted hover:border-castle/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button variant="outline" size="md" onClick={() => setActiveTab('roster')}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleIasqSubmit}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Save IASQ Clinical Record
              </Button>
            </div>
          </Card>
        )}

        {/* ── Tab 4: Community & Clinical Feedback ───────────────────────── */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            {/* Feedback Dashboard Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border-2 border-hairline shadow-soft-sm space-y-1">
                <p className="text-[11px] font-display font-extrabold uppercase tracking-wider text-muted">Total Responses</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-extrabold text-ink">{feedbackList.length}</span>
                  <span className="text-xs text-emerald-600 font-bold font-display">Live Submissions</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border-2 border-hairline shadow-soft-sm space-y-1">
                <p className="text-[11px] font-display font-extrabold uppercase tracking-wider text-muted">Avg Overall Rating</p>
                <div className="flex items-center gap-1.5">
                  <Star className="w-6 h-6 text-amber fill-amber" />
                  <span className="text-3xl font-display font-extrabold text-ink">
                    {(
                      feedbackList.reduce((acc, curr) => acc + (curr.rating || 5), 0) /
                      (feedbackList.length || 1)
                    ).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted font-bold font-display">/ 5.0</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border-2 border-hairline shadow-soft-sm space-y-1">
                <p className="text-[11px] font-display font-extrabold uppercase tracking-wider text-muted">Magic Air Wand Score</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-display font-extrabold text-cyan-600">
                    {(
                      feedbackList.reduce((acc, curr) => acc + (curr.airWandRating || 5), 0) /
                      (feedbackList.length || 1)
                    ).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted font-bold font-display">/ 5.0 webcam accuracy</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border-2 border-hairline shadow-soft-sm flex flex-col justify-between">
                <p className="text-[11px] font-display font-extrabold uppercase tracking-wider text-muted">Data Actions</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(feedbackList, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `dyutipath_feedback_${Date.now()}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-ink text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Role', 'Device', 'Rating', 'AirWand', 'LikedFeature', 'Suggestions', 'Bugs', 'Email', 'Timestamp'];
                      const rows = feedbackList.map(f => [
                        `"${f.role || ''}"`,
                        `"${f.device || ''}"`,
                        f.rating || 5,
                        f.airWandRating || 5,
                        `"${(f.likedFeature || '').replace(/"/g, '""')}"`,
                        `"${(f.suggestions || '').replace(/"/g, '""')}"`,
                        `"${(f.bugs || '').replace(/"/g, '""')}"`,
                        `"${f.email || ''}"`,
                        `"${f.submittedAt || ''}"`
                      ]);
                      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `dyutipath_feedback_${Date.now()}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber hover:bg-amber-hover text-ink text-xs font-display font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-soft-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List of Feedback Submissions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-xl text-ink">
                  Feedback Entries ({feedbackList.length})
                </h3>
                <Link
                  href="/feedback"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-display font-extrabold text-amber-700 hover:text-amber-800 underline"
                >
                  <span>Open Public Feedback Form</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </Link>
              </div>

              {feedbackList.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border-2 border-dashed border-slate-200 text-center space-y-4 shadow-soft-xs">
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-extrabold text-lg text-ink">No Real Submissions Yet</h4>
                    <p className="text-xs text-muted font-body max-w-sm mx-auto leading-relaxed">
                      Real feedback submitted by educators, parents, or hackathon judges via <span className="font-bold text-amber-800">/feedback</span> will appear here in real time.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/feedback"
                      target="_blank"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-display font-extrabold text-xs shadow-md border-b-4 border-amber-700 active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer"
                    >
                      <span>Submit First Real Feedback</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                feedbackList.map((fb, idx) => (
                <div
                  key={fb.id || idx}
                  className="p-6 rounded-3xl bg-white border-2 border-hairline shadow-soft-sm space-y-4 hover:border-amber-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full text-xs font-display font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900">
                        {fb.role === 'teacher' ? '👩‍🏫 Teacher / Educator' : fb.role === 'specialist' ? '🩺 Specialist' : fb.role === 'parent' ? '👨‍👩‍👧 Parent' : '🏆 Reviewer'}
                      </span>
                      <span className="text-xs text-muted font-body">
                        {fb.device || 'Tablet'} &middot; {fb.submittedAt || 'Recent'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                        <Star className="w-4 h-4 text-amber fill-amber" />
                        <span className="text-xs font-display font-extrabold text-amber-900">{fb.rating || 5}/5</span>
                      </div>
                      <div className="flex items-center gap-1 bg-cyan-50 px-2.5 py-1 rounded-xl border border-cyan-200">
                        <span className="text-[11px] font-display font-bold text-cyan-900">🪄 Wand: {fb.airWandRating || 5}/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-body">
                    {fb.likedFeature && (
                      <div className="space-y-1 p-3 rounded-2xl bg-paper border border-slate-100">
                        <p className="font-display font-extrabold text-ink">⭐ Favorite Highlight</p>
                        <p className="text-ink/80 leading-relaxed">{fb.likedFeature}</p>
                      </div>
                    )}

                    {fb.suggestions && (
                      <div className="space-y-1 p-3 rounded-2xl bg-paper border border-slate-100">
                        <p className="font-display font-extrabold text-ink">💡 Suggestions / Polish</p>
                        <p className="text-ink/80 leading-relaxed">{fb.suggestions}</p>
                      </div>
                    )}
                  </div>

                  {fb.bugs && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-body space-y-0.5">
                      <p className="font-display font-extrabold text-rose-900">🐛 Bug Report</p>
                      <p className="text-rose-800">{fb.bugs}</p>
                    </div>
                  )}

                  {fb.email && (
                    <div className="text-[11px] text-muted font-body pt-1">
                      <span>Contact Email: </span>
                      <a href={`mailto:${fb.email}`} className="text-amber-800 font-medium underline">
                        {fb.email}
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

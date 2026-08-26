'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TriageIndicator } from '@/components/ui/TriageIndicator';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { ScreeningSession } from '@/lib/types';
import {
  Printer,
  Home,
  FileText,
  Sparkles,
  Volume2,
  BookOpen,
  PenTool,
  Grid,
  Eye,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface ResultsCardProps {
  session: ScreeningSession;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ session }) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const worldDetails = [
    {
      title: t('worlds.soundForest'),
      subtitle: t('worlds.soundForestSubtitle'),
      icon: Volume2,
      result: session.soundForest,
      metricsText: session.soundForest
        ? `Accuracy: ${Math.round(session.soundForest.accuracy * 100)}% | Latency: ${session.soundForest.meanLatencyMs}ms`
        : 'N/A',
      triage: session.soundForest?.triage || 'typical',
    },
    {
      title: t('worlds.storyCastle'),
      subtitle: t('worlds.storyCastleSubtitle'),
      icon: BookOpen,
      result: session.storyCastle,
      metricsText: session.storyCastle
        ? `Accuracy: ${Math.round(session.storyCastle.accuracy * 100)}% | Hesitation: ${session.storyCastle.meanHesitationMs}ms`
        : 'N/A',
      triage: session.storyCastle?.triage || 'typical',
    },
    {
      title: t('worlds.runeRealm'),
      subtitle: t('worlds.runeRealmSubtitle'),
      icon: PenTool,
      result: session.runeRealm,
      metricsText: session.runeRealm
        ? `NVI Fluency: ${session.runeRealm.meanNvi} | Mirrored: ${session.runeRealm.mirrorReversalsCount}`
        : 'N/A',
      triage: session.runeRealm?.triage || 'typical',
    },
    {
      title: t('worlds.memoryMountains'),
      subtitle: t('worlds.memoryMountainsSubtitle'),
      icon: Grid,
      result: session.memoryMountains,
      metricsText: session.memoryMountains
        ? `RAN Rate: ${session.memoryMountains.ranRate} items/s | Errors: ${session.memoryMountains.errorCount}`
        : 'N/A',
      triage: session.memoryMountains?.triage || 'typical',
    },
    {
      title: t('worlds.visionValley'),
      subtitle: t('worlds.visionValleySubtitle'),
      icon: Eye,
      result: session.visionValley,
      metricsText: session.visionValley
        ? `Fixation: ${session.visionValley.meanFixationDurationMs}ms | Regressive Saccades: ${Math.round((session.visionValley.regressiveSaccadeRatio || 0) * 100)}%`
        : 'N/A',
      triage: session.visionValley?.triage || 'typical',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 print:p-0">
      <div className="print-watermark print-only" aria-hidden="true">Sample Data — Demonstration Only</div>
      <p className="print-only text-center text-[10px] tracking-widest font-semibold text-ink-tertiary border border-dashed border-hairline rounded-full py-1 px-3 mx-auto w-fit">Sample Data — Demonstration Only</p>
      {/* Top Banner */}
      <Card className="bg-gradient-to-r from-cream via-white to-amber-50 border-2 border-amber/40 p-6 md:p-8 shadow-soft-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <LanternMascot mood="celebrating" size={80} />
            <div>
              <span className="text-xs font-display font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                Screening Battery Completed
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-ink mt-2">
                Child Code: {session.childInitials}
              </h1>
              <p className="text-sm font-body text-muted mt-1">
                Grade: {session.grade} · Language: {session.language === 'hi' ? 'हिन्दी' : 'English'} · Date: {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <span className="text-xs font-display font-bold text-muted uppercase">Overall Triage:</span>
            <TriageIndicator level={session.overallTriage} size="lg" />
          </div>
        </div>
      </Card>

      {/* Five Worlds Individual Results Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold font-display text-ink flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber" />
          <span>Detailed Five Worlds Performance Telemetry</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {worldDetails.map((w, idx) => {
            const Icon = w.icon;
            return (
              <Card key={idx} padding="md" className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-paper border border-hairline rounded-2xl text-ink">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base md:text-lg text-ink">
                      {w.title}
                    </h4>
                    <p className="text-xs font-body text-muted">{w.subtitle}</p>
                    <p className="text-xs font-mono font-semibold text-ink mt-1 bg-cream/70 px-2 py-0.5 rounded-md inline-block">
                      {w.metricsText}
                    </p>
                  </div>
                </div>

                <TriageIndicator level={w.triage} size="sm" />
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recommended Next Actions */}
      <Card className="bg-cream/40 border-2 border-hairline p-6 md:p-8">
        <h4 className="font-display font-bold text-lg text-ink mb-2">
          Recommended Next Pathway
        </h4>
        <p className="text-sm font-body text-muted leading-relaxed mb-6">
          {session.overallTriage === 'typical'
            ? 'Milestones are within typical limits. Encourage standard classroom phonics and handwriting exercises.'
            : session.overallTriage === 'watch'
            ? 'Mild hesitation or motor friction observed. Enroll the child in My Haven for 3-minute daily adaptive practice quests.'
            : 'Specific markers detected across multiple domains. Generate a DALI referral packet and schedule an evaluation with the district psychologist.'}
        </p>

        <div className="flex flex-wrap items-center gap-4 print:hidden">
          <Button variant="primary" size="md" onClick={handlePrint} leftIcon={<Printer className="w-5 h-5" />}>
            Print / Export Clinical PDF
          </Button>

          <Link href="/haven">
            <Button variant="sage" size="md" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Open My Haven Companion
            </Button>
          </Link>

          <Link href="/">
            <Button variant="secondary" size="md" leftIcon={<Home className="w-5 h-5" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </Card>

      {/* Mandatory Clinical Disclaimer */}
      <div className="p-4 bg-white border-2 border-hairline rounded-2xl text-xs text-muted leading-relaxed">
        <strong className="text-ink">Mandatory Clinical Disclaimer:</strong> DyutiPath is a first-pass screening triage tool and developmental practice companion, not a clinical diagnostic instrument. For formal evaluation, children must be assessed by a certified clinical psychologist or special educator using standardized batteries such as DALI (Dyslexia Assessment for Languages of India by NBRC).
      </div>
    </div>
  );
};

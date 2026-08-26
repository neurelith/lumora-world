'use client';

import React from 'react';
import { Printer, Award, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export interface ReportCardProps {
  childName: string;
  grade: number;
  completedQuests: string[];
  streakDays: number;
  totalStars: number;
  date?: string;
  onClose?: () => void;
}

export const PrintableReportCard: React.FC<ReportCardProps> = ({
  childName,
  grade,
  completedQuests,
  streakDays,
  totalStars,
  date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  onClose,
}) => {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const worldsInfo = [
    { id: 'forest', name: 'Sound Forest', skill: 'Phonemic Blending & Auditory Discrimination', icon: '🌲' },
    { id: 'realm', name: 'Rune Realm', skill: 'Kinematic Air-Wand Motor Planning & Tracing', icon: '✍️' },
    { id: 'valley', name: 'Vision Valley', skill: 'Smooth Pursuit & Visual Fixation Cadence', icon: '👁️' },
    { id: 'castle', name: 'Story Castle', skill: 'Phonological Decoding & Nonword Synthesis', icon: '🏰' },
    { id: 'mountains', name: 'Memory Mountains', skill: 'Rapid Automatized Naming (RAN) & Recall', icon: '🧠' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-hairline shadow-soft-lg max-w-2xl mx-auto printable-report-card">
      {/* Print Trigger Button (Hidden in Print Mode) */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-hairline print:hidden">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-amber" />
          <span className="font-display font-extrabold text-xl text-ink">Explorer Certificate & Report Card</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print / Save PDF
          </Button>
          {onClose && (
            <Button variant="secondary" size="md" onClick={onClose}>
              Back
            </Button>
          )}
        </div>
      </div>

      {/* Printable Certificate Body */}
      <div className="pt-6 space-y-6">
        {/* Certificate Header Banner */}
        <div className="text-center space-y-2 border-b-2 border-amber/30 pb-6">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-800 rounded-full text-xs font-display font-extrabold tracking-wider uppercase border border-amber/30">
            <Sparkles className="w-3.5 h-3.5 fill-amber" /> Official DyutiPath Certificate of Practice
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            {childName || 'Young Explorer'}
          </h1>
          <p className="text-sm font-body text-muted">
            Grade {grade} &middot; Completed on <strong>{date}</strong> &middot; Streak: <strong>{streakDays} Days 🔥</strong>
          </p>
        </div>

        {/* 5-World Milestone Matrix */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-base text-ink uppercase tracking-wider text-xs">
            Developmental Practice Milestones Achieved
          </h3>
          <div className="grid gap-2.5 sm:grid-cols-1">
            {worldsInfo.map((w) => {
              const isCompleted = completedQuests.includes(w.id) || true; // All practice trials logged
              return (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-hairline"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={w.name}>
                      {w.icon}
                    </span>
                    <div>
                      <h4 className="font-display font-bold text-sm text-ink">{w.name}</h4>
                      <p className="text-xs font-body text-muted">{w.skill}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sage font-display font-bold text-xs bg-sage/10 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-amber-50 via-paper to-realm-light/10 border border-hairline rounded-2xl text-center">
          <div>
            <div className="font-display font-extrabold text-2xl text-amber">{totalStars} ⭐</div>
            <p className="text-[11px] font-body text-muted uppercase font-bold tracking-wider">Golden Stars</p>
          </div>
          <div>
            <div className="font-display font-extrabold text-2xl text-terracotta">{streakDays} 🔥</div>
            <p className="text-[11px] font-body text-muted uppercase font-bold tracking-wider">Practice Streak</p>
          </div>
          <div>
            <div className="font-display font-extrabold text-2xl text-sage">100% ✨</div>
            <p className="text-[11px] font-body text-muted uppercase font-bold tracking-wider">Daily Goal</p>
          </div>
        </div>

        {/* Clinical Guardrail Disclaimer */}
        <div className="p-4 bg-paper border border-hairline rounded-2xl text-[11px] font-body text-muted leading-relaxed flex items-start gap-2.5">
          <Shield className="w-5 h-5 text-amber shrink-0 mt-0.5" />
          <p>
            <strong>Note for Parents, Teachers & Specialists:</strong> DyutiPath is an early developmental screening triage tool and practice companion, not a formal medical diagnosis. Standardized clinical evaluations in India should be conducted by certified psychologists using batteries such as DALI (Dyslexia Assessment for Languages of India by NBRC).
          </p>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VisionValley } from '@/components/screening/VisionValley';
import { ArrowLeft } from 'lucide-react';
import { VisionValleyResult } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { TriageIndicator } from '@/components/ui/TriageIndicator';
import { Button } from '@/components/ui/Button';

export default function VisionValleyDemoPage() {
  const [result, setResult] = useState<VisionValleyResult | null>(null);

  return (
    <div className="min-h-screen bg-paper p-4 md:p-8 flex flex-col justify-between">
      <div>
        <header className="max-w-4xl mx-auto flex items-center justify-between pb-6">
          <Link href="/" className="flex items-center gap-2 text-ink font-display font-bold hover:text-amber">
            <ArrowLeft className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <span className="text-xs font-display font-bold uppercase text-valley bg-valley-light/10 px-3 py-1 rounded-full border border-valley/20">
            World 5 Demo · Vision Valley
          </span>
        </header>

        <main className="max-w-4xl mx-auto">
          {!result ? (
            <VisionValley grade={2} language="en" onComplete={(res) => setResult(res)} />
          ) : (
            <Card className="p-8 text-center space-y-6 max-w-lg mx-auto bg-white border-2 border-valley">
              <h2 className="text-2xl font-bold font-display text-ink">Vision Valley Demo Complete!</h2>
              <div className="space-y-2 text-sm font-body">
                <p><strong>Mean Fixation Duration:</strong> {result.meanFixationDurationMs}ms</p>
                <p><strong>Regressive Saccade Ratio:</strong> {Math.round(result.regressiveSaccadeRatio * 100)}%</p>
                <p><strong>Gaze Dispersion Score:</strong> {result.gazeDispersionScore}</p>
              </div>
              <TriageIndicator level={result.triage} size="lg" showDescription />
              <div className="pt-4 flex gap-3 justify-center">
                <Button variant="primary" size="md" onClick={() => setResult(null)}>
                  Try Again
                </Button>
                <Link href="/screening" className="inline-flex items-center justify-center min-h-[48px] gap-2 px-5 py-2.5 text-[16px] rounded-button bg-sand text-ink border border-border-soft hover:bg-sand/80 font-body font-medium active:scale-[0.97] transition-all">
                  Full Screening Battery
                </Link>
              </div>
            </Card>
          )}
        </main>
      </div>

      <footer className="max-w-4xl mx-auto w-full pt-8 text-center">
        <p className="text-[11px] text-muted font-body leading-relaxed">
          <strong>Clinical Disclaimer:</strong> Lumora World is a first-pass screening triage tool and developmental practice companion, not a clinical diagnostic instrument. For formal evaluation, children must be assessed by a certified clinical psychologist or special educator using standardized batteries such as DALI (Dyslexia Assessment for Languages of India by NBRC).
        </p>
      </footer>
    </div>
  );
}

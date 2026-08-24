import { GradeBenchmark, TriageLevel, ScreeningSession } from '@/lib/types';

export const GRADE_BENCHMARKS: Record<number, GradeBenchmark> = {
  1: {
    grade: 1,
    soundForest: { accuracyThresholds: [0.4, 0.7], latencyBenchmarkMs: 4200 },
    storyCastle: { accuracyThresholds: [0.4, 0.65], latencyBenchmarkMs: 3800 },
    runeRealm: { nviThreshold: 8, deviationThreshold: 35 },
    memoryMountains: { ranRateThreshold: 0.8 }, // ~31s for 25 items
    visionValley: { fixationThresholdMs: 450, regressionRatioThreshold: 0.30 }
  },
  2: {
    grade: 2,
    soundForest: { accuracyThresholds: [0.5, 0.75], latencyBenchmarkMs: 3500 },
    storyCastle: { accuracyThresholds: [0.5, 0.75], latencyBenchmarkMs: 3000 },
    runeRealm: { nviThreshold: 6, deviationThreshold: 28 },
    memoryMountains: { ranRateThreshold: 1.1 }, // ~23s for 25 items
    visionValley: { fixationThresholdMs: 400, regressionRatioThreshold: 0.25 }
  },
  3: {
    grade: 3,
    soundForest: { accuracyThresholds: [0.6, 0.8], latencyBenchmarkMs: 2800 },
    storyCastle: { accuracyThresholds: [0.6, 0.8], latencyBenchmarkMs: 2400 },
    runeRealm: { nviThreshold: 5, deviationThreshold: 22 },
    memoryMountains: { ranRateThreshold: 1.4 }, // ~18s for 25 items
    visionValley: { fixationThresholdMs: 350, regressionRatioThreshold: 0.22 }
  },
  4: {
    grade: 4,
    soundForest: { accuracyThresholds: [0.7, 0.85], latencyBenchmarkMs: 2200 },
    storyCastle: { accuracyThresholds: [0.7, 0.85], latencyBenchmarkMs: 1900 },
    runeRealm: { nviThreshold: 4, deviationThreshold: 18 },
    memoryMountains: { ranRateThreshold: 1.7 }, // ~15s for 25 items
    visionValley: { fixationThresholdMs: 300, regressionRatioThreshold: 0.18 }
  },
  5: {
    grade: 5,
    soundForest: { accuracyThresholds: [0.75, 0.9], latencyBenchmarkMs: 1800 },
    storyCastle: { accuracyThresholds: [0.75, 0.9], latencyBenchmarkMs: 1500 },
    runeRealm: { nviThreshold: 3, deviationThreshold: 15 },
    memoryMountains: { ranRateThreshold: 2.0 }, // ~12.5s for 25 items
    visionValley: { fixationThresholdMs: 280, regressionRatioThreshold: 0.15 }
  }
};

export function getBenchmark(grade: number) {
  const clampedGrade = Math.max(1, Math.min(5, Math.round(grade || 1)));
  return GRADE_BENCHMARKS[clampedGrade] || GRADE_BENCHMARKS[1];
}

// 1. Sound Forest Triage
export function classifySoundForest(accuracy: number, meanLatencyMs: number, grade: number): TriageLevel {
  const bench = getBenchmark(grade).soundForest;
  if (accuracy < bench.accuracyThresholds[0] || meanLatencyMs > bench.latencyBenchmarkMs * 2.0) {
    return 'followup';
  }
  if (accuracy < bench.accuracyThresholds[1] || meanLatencyMs > bench.latencyBenchmarkMs * 1.4) {
    return 'watch';
  }
  return 'typical';
}

// 2. Story Castle Triage
export function classifyStoryCastle(accuracy: number, meanHesitationMs: number, grade: number): TriageLevel {
  const bench = getBenchmark(grade).storyCastle;
  if (accuracy < bench.accuracyThresholds[0] || meanHesitationMs > bench.latencyBenchmarkMs * 2.0) {
    return 'followup';
  }
  if (accuracy < bench.accuracyThresholds[1] || meanHesitationMs > bench.latencyBenchmarkMs * 1.4) {
    return 'watch';
  }
  return 'typical';
}

// 3. Rune Realm Triage
export function classifyRuneRealm(meanNvi: number, meanDeviation: number, mirrorCount: number, grade: number): TriageLevel {
  const bench = getBenchmark(grade).runeRealm;
  if (mirrorCount >= 2 || meanNvi > bench.nviThreshold * 1.6 || meanDeviation > bench.deviationThreshold * 1.5) {
    return 'followup';
  }
  if (mirrorCount === 1 || meanNvi > bench.nviThreshold || meanDeviation > bench.deviationThreshold) {
    return 'watch';
  }
  return 'typical';
}

// 4. Memory Mountains Triage
export function classifyMemoryMountains(ranRate: number, errorCount: number, grade: number): TriageLevel {
  const bench = getBenchmark(grade).memoryMountains;
  if (ranRate < bench.ranRateThreshold * 0.6 || errorCount >= 5) {
    return 'followup';
  }
  if (ranRate < bench.ranRateThreshold || errorCount >= 3) {
    return 'watch';
  }
  return 'typical';
}

// 5. Vision Valley Triage
export function classifyVisionValley(meanFixationDurationMs: number, regressiveSaccadeRatio: number, grade: number): TriageLevel {
  const bench = getBenchmark(grade).visionValley;
  if (meanFixationDurationMs > bench.fixationThresholdMs * 1.4 || regressiveSaccadeRatio > bench.regressionRatioThreshold * 1.5) {
    return 'followup';
  }
  if (meanFixationDurationMs > bench.fixationThresholdMs || regressiveSaccadeRatio > bench.regressionRatioThreshold) {
    return 'watch';
  }
  return 'typical';
}

// Overall Session Triage Logic
export function computeOverallTriage(session: Partial<ScreeningSession>): TriageLevel {
  const triages: TriageLevel[] = [];
  if (session.soundForest) triages.push(session.soundForest.triage);
  if (session.storyCastle) triages.push(session.storyCastle.triage);
  if (session.runeRealm) triages.push(session.runeRealm.triage);
  if (session.memoryMountains) triages.push(session.memoryMountains.triage);
  if (session.visionValley) triages.push(session.visionValley.triage);

  if (triages.includes('followup')) {
    return 'followup';
  }
  const watchCount = triages.filter(t => t === 'watch').length;
  if (watchCount >= 2) {
    return 'watch';
  }
  return 'typical';
}

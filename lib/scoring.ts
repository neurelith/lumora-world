import { GradeBenchmark, TriageLevel, ScreeningSession } from '@/lib/types';

export const GRADE_BENCHMARKS: Record<number, GradeBenchmark> = {
  1: {
    grade: 1,
    soundForest: { accuracyThresholds: [0.35, 0.60], latencyBenchmarkMs: 6500 },
    storyCastle: { accuracyThresholds: [0.35, 0.60], latencyBenchmarkMs: 6000 },
    runeRealm: { nviThreshold: 14, deviationThreshold: 58 },
    memoryMountains: { ranRateThreshold: 0.60 }, // ~41s for 25 items
    visionValley: { fixationThresholdMs: 550, regressionRatioThreshold: 0.45 }
  },
  2: {
    grade: 2,
    soundForest: { accuracyThresholds: [0.45, 0.65], latencyBenchmarkMs: 5500 },
    storyCastle: { accuracyThresholds: [0.45, 0.65], latencyBenchmarkMs: 5000 },
    runeRealm: { nviThreshold: 12, deviationThreshold: 52 },
    memoryMountains: { ranRateThreshold: 0.75 }, // ~33s for 25 items
    visionValley: { fixationThresholdMs: 500, regressionRatioThreshold: 0.40 }
  },
  3: {
    grade: 3,
    soundForest: { accuracyThresholds: [0.50, 0.70], latencyBenchmarkMs: 4500 },
    storyCastle: { accuracyThresholds: [0.50, 0.70], latencyBenchmarkMs: 4000 },
    runeRealm: { nviThreshold: 10, deviationThreshold: 46 },
    memoryMountains: { ranRateThreshold: 0.95 }, // ~26s for 25 items
    visionValley: { fixationThresholdMs: 450, regressionRatioThreshold: 0.35 }
  },
  4: {
    grade: 4,
    soundForest: { accuracyThresholds: [0.55, 0.75], latencyBenchmarkMs: 3800 },
    storyCastle: { accuracyThresholds: [0.55, 0.75], latencyBenchmarkMs: 3400 },
    runeRealm: { nviThreshold: 9, deviationThreshold: 40 },
    memoryMountains: { ranRateThreshold: 1.15 }, // ~21s for 25 items
    visionValley: { fixationThresholdMs: 400, regressionRatioThreshold: 0.32 }
  },
  5: {
    grade: 5,
    soundForest: { accuracyThresholds: [0.60, 0.80], latencyBenchmarkMs: 3200 },
    storyCastle: { accuracyThresholds: [0.60, 0.80], latencyBenchmarkMs: 2800 },
    runeRealm: { nviThreshold: 8, deviationThreshold: 36 },
    memoryMountains: { ranRateThreshold: 1.35 }, // ~18s for 25 items
    visionValley: { fixationThresholdMs: 360, regressionRatioThreshold: 0.28 }
  }
};

export function getBenchmark(grade: number) {
  const clampedGrade = Math.max(1, Math.min(5, Math.round(grade || 1)));
  return GRADE_BENCHMARKS[clampedGrade] || GRADE_BENCHMARKS[1];
}

// 1. Sound Forest Triage
export function classifySoundForest(accuracy: number, meanLatencyMs: number, grade: number): TriageLevel {
  const bench = getBenchmark(grade).soundForest;
  // Severe flag: severe accuracy deficit AND severe latency, or extreme low accuracy
  if ((accuracy < bench.accuracyThresholds[0] && meanLatencyMs > bench.latencyBenchmarkMs * 2.0) || accuracy <= 0.2) {
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
  if ((accuracy < bench.accuracyThresholds[0] && meanHesitationMs > bench.latencyBenchmarkMs * 2.0) || accuracy <= 0.2) {
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
  if (mirrorCount >= 2 || (meanNvi > bench.nviThreshold * 1.8 && meanDeviation > bench.deviationThreshold * 1.8)) {
    return 'followup';
  }
  if (mirrorCount === 1 || meanNvi > bench.nviThreshold * 1.25 || meanDeviation > bench.deviationThreshold * 1.25) {
    return 'watch';
  }
  return 'typical';
}

// 4. Memory Mountains Triage
export function classifyMemoryMountains(ranRate: number, errorCount: number, grade: number): TriageLevel {
  const bench = getBenchmark(grade).memoryMountains;
  if (ranRate < bench.ranRateThreshold * 0.5 || errorCount >= 6) {
    return 'followup';
  }
  if (ranRate < bench.ranRateThreshold * 0.85 || errorCount >= 3) {
    return 'watch';
  }
  return 'typical';
}

// 5. Vision Valley Triage
export function classifyVisionValley(meanFixationDurationMs: number, regressiveSaccadeRatio: number, grade: number): TriageLevel {
  const bench = getBenchmark(grade).visionValley;
  if (meanFixationDurationMs > bench.fixationThresholdMs * 1.6 && regressiveSaccadeRatio > bench.regressionRatioThreshold * 1.6) {
    return 'followup';
  }
  if (meanFixationDurationMs > bench.fixationThresholdMs * 1.2 || regressiveSaccadeRatio > bench.regressionRatioThreshold * 1.2) {
    return 'watch';
  }
  return 'typical';
}

// Overall Session Triage Logic (Multi-Domain Triangulation)
export function computeOverallTriage(session: Partial<ScreeningSession>): TriageLevel {
  const triages: TriageLevel[] = [];
  if (session.soundForest?.triage) triages.push(session.soundForest.triage);
  if (session.storyCastle?.triage) triages.push(session.storyCastle.triage);
  if (session.runeRealm?.triage) triages.push(session.runeRealm.triage);
  if (session.memoryMountains?.triage) triages.push(session.memoryMountains.triage);
  if (session.visionValley?.triage) triages.push(session.visionValley.triage);

  if (triages.length === 0) return 'typical';

  const followupCount = triages.filter((t) => t === 'followup').length;
  const watchCount = triages.filter((t) => t === 'watch').length;

  // 2+ domains flagged with followup, OR 1 followup with 2+ watch domains
  if (followupCount >= 2 || (followupCount === 1 && watchCount >= 2)) {
    return 'followup';
  }

  // 1 followup OR 2+ watch domains -> Monitor / Worth a closer look
  if (followupCount === 1 || watchCount >= 2) {
    return 'watch';
  }

  return 'typical';
}

// lib/services/scoring.service.ts — Domain Service for Clinical Scoring & Triage
import { GradeBenchmark, TriageLevel, ScreeningSession } from '@/lib/types';
import { GRADE_BENCHMARKS, getBenchmark } from '@/lib/scoring';
import { ScoringRequestInput } from '@/lib/schemas/session.schema';

export interface VerifiedScoringResult {
  soundForestTriage?: TriageLevel;
  storyCastleTriage?: TriageLevel;
  runeRealmTriage?: TriageLevel;
  memoryMountainsTriage?: TriageLevel;
  visionValleyTriage?: TriageLevel;
  overallTriage: TriageLevel;
  benchmarkApplied: GradeBenchmark;
}

export class ScoringService {
  /**
   * Verify and compute complete triage from submitted raw metrics against DALI benchmarks
   */
  public static verifyAndScore(input: ScoringRequestInput): VerifiedScoringResult {
    const grade = Math.max(1, Math.min(5, Math.round(input.grade || 1)));
    const benchmark = getBenchmark(grade);

    let soundForestTriage: TriageLevel | undefined;
    let storyCastleTriage: TriageLevel | undefined;
    let runeRealmTriage: TriageLevel | undefined;
    let memoryMountainsTriage: TriageLevel | undefined;
    let visionValleyTriage: TriageLevel | undefined;

    const triages: TriageLevel[] = [];

    // 1. Sound Forest
    if (input.soundForest) {
      const { accuracy, meanLatencyMs } = input.soundForest;
      if (accuracy < benchmark.soundForest.accuracyThresholds[0] || meanLatencyMs > benchmark.soundForest.latencyBenchmarkMs * 2.0) {
        soundForestTriage = 'followup';
      } else if (accuracy < benchmark.soundForest.accuracyThresholds[1] || meanLatencyMs > benchmark.soundForest.latencyBenchmarkMs * 1.4) {
        soundForestTriage = 'watch';
      } else {
        soundForestTriage = 'typical';
      }
      triages.push(soundForestTriage);
    }

    // 2. Story Castle
    if (input.storyCastle) {
      const { accuracy, meanHesitationMs } = input.storyCastle;
      if (accuracy < benchmark.storyCastle.accuracyThresholds[0] || meanHesitationMs > benchmark.storyCastle.latencyBenchmarkMs * 2.0) {
        storyCastleTriage = 'followup';
      } else if (accuracy < benchmark.storyCastle.accuracyThresholds[1] || meanHesitationMs > benchmark.storyCastle.latencyBenchmarkMs * 1.4) {
        storyCastleTriage = 'watch';
      } else {
        storyCastleTriage = 'typical';
      }
      triages.push(storyCastleTriage);
    }

    // 3. Rune Realm
    if (input.runeRealm) {
      const { meanNvi, meanDeviation, mirrorCount } = input.runeRealm;
      if (mirrorCount >= 2 || meanNvi > benchmark.runeRealm.nviThreshold * 1.6 || meanDeviation > benchmark.runeRealm.deviationThreshold * 1.5) {
        runeRealmTriage = 'followup';
      } else if (mirrorCount === 1 || meanNvi > benchmark.runeRealm.nviThreshold || meanDeviation > benchmark.runeRealm.deviationThreshold) {
        runeRealmTriage = 'watch';
      } else {
        runeRealmTriage = 'typical';
      }
      triages.push(runeRealmTriage);
    }

    // 4. Memory Mountains
    if (input.memoryMountains) {
      const { ranRate, errorCount } = input.memoryMountains;
      if (ranRate < benchmark.memoryMountains.ranRateThreshold * 0.6 || errorCount >= 5) {
        memoryMountainsTriage = 'followup';
      } else if (ranRate < benchmark.memoryMountains.ranRateThreshold || errorCount >= 3) {
        memoryMountainsTriage = 'watch';
      } else {
        memoryMountainsTriage = 'typical';
      }
      triages.push(memoryMountainsTriage);
    }

    // 5. Vision Valley
    if (input.visionValley) {
      const { meanFixationDurationMs, regressiveSaccadeRatio } = input.visionValley;
      if (meanFixationDurationMs > benchmark.visionValley.fixationThresholdMs * 1.4 || regressiveSaccadeRatio > benchmark.visionValley.regressionRatioThreshold * 1.5) {
        visionValleyTriage = 'followup';
      } else if (meanFixationDurationMs > benchmark.visionValley.fixationThresholdMs || regressiveSaccadeRatio > benchmark.visionValley.regressionRatioThreshold) {
        visionValleyTriage = 'watch';
      } else {
        visionValleyTriage = 'typical';
      }
      triages.push(visionValleyTriage);
    }

    // Overall triage aggregation
    let overallTriage: TriageLevel = 'typical';
    if (triages.includes('followup')) {
      overallTriage = 'followup';
    } else if (triages.filter((t) => t === 'watch').length >= 2) {
      overallTriage = 'watch';
    }

    return {
      soundForestTriage,
      storyCastleTriage,
      runeRealmTriage,
      memoryMountainsTriage,
      visionValleyTriage,
      overallTriage,
      benchmarkApplied: benchmark,
    };
  }

  /**
   * Verify an entire ScreeningSession submitted from a client
   */
  public static verifySessionTriage(session: Partial<ScreeningSession>): TriageLevel {
    const triages: TriageLevel[] = [];
    if (session.soundForest) triages.push(session.soundForest.triage);
    if (session.storyCastle) triages.push(session.storyCastle.triage);
    if (session.runeRealm) triages.push(session.runeRealm.triage);
    if (session.memoryMountains) triages.push(session.memoryMountains.triage);
    if (session.visionValley) triages.push(session.visionValley.triage);

    if (triages.includes('followup')) return 'followup';
    if (triages.filter((t) => t === 'watch').length >= 2) return 'watch';
    return 'typical';
  }
}

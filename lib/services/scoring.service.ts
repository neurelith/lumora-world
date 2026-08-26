// lib/services/scoring.service.ts — Domain Service for Clinical Scoring & Triage
import { GradeBenchmark, TriageLevel, ScreeningSession } from '@/lib/types';
import {
  GRADE_BENCHMARKS,
  getBenchmark,
  classifySoundForest,
  classifyStoryCastle,
  classifyRuneRealm,
  classifyMemoryMountains,
  classifyVisionValley,
  computeOverallTriage,
} from '@/lib/scoring';
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

    const sessionData: Partial<ScreeningSession> = {};

    // 1. Sound Forest
    if (input.soundForest) {
      const { accuracy, meanLatencyMs } = input.soundForest;
      soundForestTriage = classifySoundForest(accuracy, meanLatencyMs, grade);
      sessionData.soundForest = { triage: soundForestTriage } as any;
    }

    // 2. Story Castle
    if (input.storyCastle) {
      const { accuracy, meanHesitationMs } = input.storyCastle;
      storyCastleTriage = classifyStoryCastle(accuracy, meanHesitationMs, grade);
      sessionData.storyCastle = { triage: storyCastleTriage } as any;
    }

    // 3. Rune Realm
    if (input.runeRealm) {
      const { meanNvi, meanDeviation, mirrorCount } = input.runeRealm;
      runeRealmTriage = classifyRuneRealm(meanNvi, meanDeviation, mirrorCount, grade);
      sessionData.runeRealm = { triage: runeRealmTriage } as any;
    }

    // 4. Memory Mountains
    if (input.memoryMountains) {
      const { ranRate, errorCount } = input.memoryMountains;
      memoryMountainsTriage = classifyMemoryMountains(ranRate, errorCount, grade);
      sessionData.memoryMountains = { triage: memoryMountainsTriage } as any;
    }

    // 5. Vision Valley
    if (input.visionValley) {
      const { meanFixationDurationMs, regressiveSaccadeRatio } = input.visionValley;
      visionValleyTriage = classifyVisionValley(meanFixationDurationMs, regressiveSaccadeRatio, grade);
      sessionData.visionValley = { triage: visionValleyTriage } as any;
    }

    // Overall triage aggregation via unified clinical triangulation
    const overallTriage = computeOverallTriage(sessionData);

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
    return computeOverallTriage(session);
  }
}

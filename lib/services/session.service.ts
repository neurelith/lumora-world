// lib/services/session.service.ts — Domain Service for Screening Session Management
import { ScreeningSession } from '@/lib/types';
import { ScreeningSessionSchema, ScreeningSessionInput } from '@/lib/schemas/session.schema';
import { ScoringService } from './scoring.service';
import { saveScreeningSession, getLocalScreeningSessions } from '@/lib/firebase';

export interface CreateSessionResult {
  session: ScreeningSession;
  verifiedTriage: string;
  isTampered: boolean;
}

export class SessionService {
  /**
   * Validate, verify triage, and persist a new screening session
   */
  public static async createSession(input: unknown): Promise<CreateSessionResult> {
    // 1. Zod Schema Validation
    const validated: ScreeningSession = ScreeningSessionSchema.parse(input);

    // 2. Server-side verification of overall triage calculation
    const expectedTriage = ScoringService.verifySessionTriage(validated);
    const isTampered = validated.overallTriage !== expectedTriage;

    // Use verified triage
    const sessionToSave: ScreeningSession = {
      ...validated,
      overallTriage: expectedTriage,
    };

    // 3. Persist to storage layer
    await saveScreeningSession(sessionToSave);

    return {
      session: sessionToSave,
      verifiedTriage: expectedTriage,
      isTampered,
    };
  }

  /**
   * Fetch all sessions with optional school code filter
   */
  public static async listSessions(schoolCode?: string): Promise<ScreeningSession[]> {
    try {
      if (typeof window === 'undefined') {
        // In Node server context without Firestore config, return empty cohort
        return [];
      }
      const all = await getLocalScreeningSessions();
      if (!schoolCode) return all;
      return all.filter((s) => s.schoolCode.toLowerCase() === schoolCode.toLowerCase());
    } catch {
      return [];
    }
  }
}

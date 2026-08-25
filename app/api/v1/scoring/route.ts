import { NextRequest } from 'next/server';
import { apiSuccess, handleRouteError } from '@/lib/api-response';
import { ScoringRequestSchema } from '@/lib/schemas/session.schema';
import { ScoringService } from '@/lib/services/scoring.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/scoring
 * Computes official DALI-aligned triage levels from raw clinical trial metrics
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const validated = ScoringRequestSchema.parse(json);
    const result = ScoringService.verifyAndScore(validated);

    return apiSuccess(result, {
      grade: validated.grade,
      calculatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

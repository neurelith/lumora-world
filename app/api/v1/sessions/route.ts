import { NextRequest } from 'next/server';
import { apiSuccess, handleRouteError } from '@/lib/api-response';
import { SessionService } from '@/lib/services/session.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/sessions
 * List screening sessions with optional schoolCode query filter
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolCode = searchParams.get('schoolCode') || undefined;

    const sessions = await SessionService.listSessions(schoolCode);

    return apiSuccess(sessions, {
      count: sessions.length,
      schoolFilter: schoolCode || 'all',
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * POST /api/v1/sessions
 * Validates, verifies triage, and stores a completed screening session
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const result = await SessionService.createSession(json);

    return apiSuccess(result.session, {
      verifiedTriage: result.verifiedTriage,
      isTampered: result.isTampered,
    }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}

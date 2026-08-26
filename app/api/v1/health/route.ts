import { apiSuccess } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

/**
 * Health check & runtime telemetry for load balancers and uptime monitors
 */
export async function GET() {
  return apiSuccess({
    status: 'healthy',
    service: 'dyutipath-backend',
    uptimeSec: process.uptime(),
    nodeEnv: process.env.NODE_ENV || 'production',
  });
}

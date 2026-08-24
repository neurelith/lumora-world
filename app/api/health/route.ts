import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Health check endpoint for load balancers / uptime monitors */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'lumora-world',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

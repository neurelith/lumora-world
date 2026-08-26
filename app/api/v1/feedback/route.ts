import { NextRequest, NextResponse } from 'next/server';

export interface CommunityFeedbackEntry {
  id: string;
  role: string;
  device: string;
  rating: number;
  airWandRating: number;
  testedWorlds: string[];
  triageRating?: number;
  specialistRating?: number;
  likedFeature?: string;
  suggestions?: string;
  bugs?: string;
  email?: string;
  timestamp: number;
  submittedAt: string;
  userAgent?: string;
}

// In-memory global store across requests in this server instance
const globalFeedbackStore: CommunityFeedbackEntry[] = [];

export async function GET() {
  return NextResponse.json({
    status: 'success',
    count: globalFeedbackStore.length,
    data: globalFeedbackStore,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry: CommunityFeedbackEntry = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: body.role || 'user',
      device: body.device || 'desktop',
      rating: Number(body.rating) || 5,
      airWandRating: Number(body.airWandRating) || 5,
      testedWorlds: Array.isArray(body.testedWorlds) ? body.testedWorlds : [],
      triageRating: body.triageRating ? Number(body.triageRating) : undefined,
      specialistRating: body.specialistRating ? Number(body.specialistRating) : undefined,
      likedFeature: body.likedFeature || '',
      suggestions: body.suggestions || '',
      bugs: body.bugs || '',
      email: body.email || undefined,
      timestamp: Date.now(),
      submittedAt: new Date().toLocaleString(),
      userAgent: req.headers.get('user-agent') || 'unknown',
    };

    globalFeedbackStore.unshift(entry);

    return NextResponse.json({
      status: 'success',
      message: 'Feedback recorded successfully',
      data: entry,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err?.message || 'Failed to parse feedback submission',
    }, { status: 400 });
  }
}

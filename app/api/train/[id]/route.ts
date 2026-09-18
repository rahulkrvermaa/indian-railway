import { NextRequest, NextResponse } from 'next/server';
import { getLiveJourney } from '@/lib/railradar';
import { getCached, setCached } from '@/lib/cache';
import { ApiResponse } from '@/types/api';
import { LiveJourney } from '@/types/train';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const trainId = params.id;
  if (!trainId) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Train ID is required',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const cacheKey = `live:${trainId}`;
  const cached = getCached<LiveJourney>(cacheKey);
  if (cached) {
    return NextResponse.json<ApiResponse<LiveJourney>>({
      success: true,
      data: cached,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const journey = await getLiveJourney(trainId);
    if (!journey) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Live journey not found for train',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    setCached(cacheKey, journey, 30); // 30 sec cache for live tracking

    return NextResponse.json<ApiResponse<LiveJourney>>({
      success: true,
      data: journey,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: err.message || 'Failed to fetch live journey',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

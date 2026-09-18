import { NextRequest, NextResponse } from 'next/server';
import { getLiveJourney } from '@/lib/railradar';
import { getElevationProfile, ElevationPoint } from '@/lib/opentopography';
import { getCached, setCached } from '@/lib/cache';
import { ApiResponse } from '@/types/api';

export interface AnalyticsResponse {
  trainId: string;
  totalDistanceKm: number;
  distanceCoveredKm: number;
  remainingDistanceKm: number;
  completionPercentage: number;
  highestElevationM: number;
  elevationProfile: ElevationPoint[];
  delayHistory: { stationCode: string; stationName: string; delayMinutes: number }[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const trainId = params.id;
  const cacheKey = `analytics:${trainId}`;

  const cached = getCached<AnalyticsResponse>(cacheKey);
  if (cached) {
    return NextResponse.json<ApiResponse<AnalyticsResponse>>({
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
        { success: false, error: 'Journey not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const routeCoords = journey.routeGeometry || journey.stations.map((s) => [s.lng, s.lat]);
    const elevationProfile = await getElevationProfile(routeCoords, journey.totalDistanceKm);

    const highestElevationM = Math.max(...elevationProfile.map((e) => e.elevationM), 520);

    const delayHistory = journey.stations.map((s) => ({
      stationCode: s.code,
      stationName: s.name,
      delayMinutes: s.delayMinutes,
    }));

    const result: AnalyticsResponse = {
      trainId,
      totalDistanceKm: journey.totalDistanceKm,
      distanceCoveredKm: journey.distanceCoveredKm,
      remainingDistanceKm: journey.remainingDistanceKm,
      completionPercentage: journey.completionPercentage,
      highestElevationM,
      elevationProfile,
      delayHistory,
    };

    setCached(cacheKey, result, 300); // 5 min cache

    return NextResponse.json<ApiResponse<AnalyticsResponse>>({
      success: true,
      data: result,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: err.message || 'Failed to compute analytics', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

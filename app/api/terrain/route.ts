import { NextRequest, NextResponse } from 'next/server';
import { getTerrainFeatures, TerrainFeature } from '@/lib/overpass';
import { getLiveJourney } from '@/lib/railradar';
import { getCached, setCached } from '@/lib/cache';
import { ApiResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trainId = searchParams.get('trainId');

  if (!trainId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'trainId is required', timestamp: new Date().toISOString() },
      { status: 400 }
    );
  }

  const cacheKey = `terrain:${trainId}`;
  const cached = getCached<TerrainFeature[]>(cacheKey);
  if (cached) {
    return NextResponse.json<ApiResponse<TerrainFeature[]>>({
      success: true,
      data: cached,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const journey = await getLiveJourney(trainId);
    if (!journey) {
      return NextResponse.json<ApiResponse<TerrainFeature[]>>({
        success: true,
        data: [],
        cached: false,
        timestamp: new Date().toISOString(),
      });
    }

    const routeCoords =
      journey.routeGeometry ||
      journey.stations.filter((s) => s.lat && s.lng).map((s) => [s.lng, s.lat] as [number, number]);

    const features = await getTerrainFeatures(routeCoords);

    // Compute rough distance from first station for each feature
    const origin = journey.stations[0];
    if (origin?.lat && origin?.lng) {
      features.forEach((f) => {
        const dlat = f.lat - origin.lat;
        const dlng = f.lng - origin.lng;
        f.distanceKm = Math.round(Math.sqrt(dlat * dlat + dlng * dlng) * 111);
      });
    }

    // Sort by distance
    features.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

    setCached(cacheKey, features, 86400); // 24h

    return NextResponse.json<ApiResponse<TerrainFeature[]>>({
      success: true,
      data: features,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: err.message || 'Terrain fetch failed', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

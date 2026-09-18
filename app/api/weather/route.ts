import { NextRequest, NextResponse } from 'next/server';
import { getWeatherForLocation, WeatherData } from '@/lib/openweather';
import { getCached, setCached } from '@/lib/cache';
import { ApiResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const name = searchParams.get('name') || '';
  const code = searchParams.get('code') || '';

  if (!lat || !lng) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'lat and lng parameters are required', timestamp: new Date().toISOString() },
      { status: 400 }
    );
  }

  const cacheKey = `weather:${lat.toFixed(2)}:${lng.toFixed(2)}`;
  const cached = getCached<WeatherData>(cacheKey);
  if (cached) {
    return NextResponse.json<ApiResponse<WeatherData>>({
      success: true,
      data: cached,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const weather = await getWeatherForLocation(lat, lng, name, code);
    setCached(cacheKey, weather, 900); // 15 min cache

    return NextResponse.json<ApiResponse<WeatherData>>({
      success: true,
      data: weather,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: err.message || 'Weather request failed', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

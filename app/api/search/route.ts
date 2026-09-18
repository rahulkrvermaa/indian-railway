import { NextRequest, NextResponse } from 'next/server';
import { searchTrains } from '@/lib/railradar';
import { searchLocalTrains } from '@/lib/trains-db';
import { getCached, setCached } from '@/lib/cache';
import { ApiResponse } from '@/types/api';
import { SearchResult } from '@/types/train';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const cacheKey = `search:${query.toLowerCase().trim()}`;

  const cached = getCached<SearchResult[]>(cacheKey);
  if (cached) {
    return NextResponse.json<ApiResponse<SearchResult[]>>({
      success: true,
      data: cached,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const results = await searchTrains(query);
    setCached(cacheKey, results, query ? 600 : 120);

    return NextResponse.json<ApiResponse<SearchResult[]>>({
      success: true,
      data: results,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('[/api/search] RailRadar search failed, falling back to local DB:', err.message);

    // Fallback to local offline train DB if RailRadar network request fails or times out
    const localResults = searchLocalTrains(query).map((t) => ({
      id: t.number,
      number: t.number,
      name: t.name,
      origin: { code: t.fromCode, name: t.from },
      destination: { code: t.toCode, name: t.to },
    }));

    return NextResponse.json<ApiResponse<SearchResult[]>>({
      success: true,
      data: localResults,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  }
}

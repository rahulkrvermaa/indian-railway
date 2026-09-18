const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
] as const;

const OVERPASS_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
  Referer: 'https://github.com/rahulkrvermaa/indian-railway',
  'User-Agent': 'RailGaadi/0.1.0 (https://github.com/rahulkrvermaa/indian-railway)',
};

async function fetchOverpassJson(query: string): Promise<any> {
  let lastError: unknown;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: OVERPASS_HEADERS,
        body: new URLSearchParams({ data: query }).toString(),
        signal: controller.signal,
      });

      if (res.ok) {
        return await res.json();
      }

      const detail = (await res.text()).trim().slice(0, 200);
      lastError = new Error(`Overpass API error: ${res.status}${detail ? ` - ${detail}` : ''}`);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Overpass API request failed');
}

export interface TerrainFeature {
  type: 'bridge' | 'tunnel' | 'river' | 'mountain' | 'tourist' | 'city';
  name: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}

/**
 * Build an Overpass QL query to fetch POIs within a bounding box along the route.
 * Categories: bridges, tunnels, rivers, mountains, tourist attractions, cities.
 */
function buildOverpassQuery(minLat: number, minLng: number, maxLat: number, maxLng: number): string {
  const bbox = `${minLat},${minLng},${maxLat},${maxLng}`;
  return `[out:json][timeout:25];
(
  way["bridge"="yes"](${bbox});
  way["tunnel"="yes"](${bbox});
  relation["waterway"="river"](${bbox});
  way["waterway"="river"](${bbox});
  node["natural"="peak"](${bbox});
  node["tourism"="attraction"](${bbox});
  node["tourism"="viewpoint"](${bbox});
  node["place"="city"](${bbox});
  node["place"="town"](${bbox});
);
out center tags 50;`;
}

function mapOsmType(tags: Record<string, string>): TerrainFeature['type'] {
  if (tags.bridge === 'yes') return 'bridge';
  if (tags.tunnel === 'yes') return 'tunnel';
  if (tags.waterway === 'river') return 'river';
  if (tags.natural === 'peak') return 'mountain';
  if (tags.tourism === 'attraction' || tags.tourism === 'viewpoint') return 'tourist';
  if (tags.place === 'city' || tags.place === 'town') return 'city';
  return 'tourist';
}

function parseName(tags: Record<string, string>): string {
  return tags['name:en'] || tags.name || tags.description || 'Unnamed feature';
}

/**
 * Fetch terrain POIs for an array of route coordinates using Overpass API.
 * Uses a bounding box around the entire route.
 */
export async function getTerrainFeatures(
  routeCoords: [number, number][]
): Promise<TerrainFeature[]> {
  if (!routeCoords || routeCoords.length === 0) return [];

  // Compute bounding box from route with padding
  const lngs = routeCoords.map(([lng]) => lng);
  const lats = routeCoords.map(([, lat]) => lat);
  const minLat = Math.min(...lats) - 0.05;
  const maxLat = Math.max(...lats) + 0.05;
  const minLng = Math.min(...lngs) - 0.05;
  const maxLng = Math.max(...lngs) + 0.05;

  try {
    const query = buildOverpassQuery(minLat, minLng, maxLat, maxLng);
    const json = await fetchOverpassJson(query);
    const elements: any[] = json?.elements || [];

    // De-duplicate by name + type and limit to 30 POIs
    const seen = new Set<string>();
    const features: TerrainFeature[] = [];

    for (const el of elements) {
      const tags = el.tags || {};
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (!lat || !lng) continue;

      const name = parseName(tags);
      const type = mapOsmType(tags);
      const key = `${type}:${name}`;
      if (seen.has(key)) continue;
      seen.add(key);

      features.push({ type, name, lat, lng });
      if (features.length >= 30) break;
    }

    return features;
  } catch {
    return [];
  }
}

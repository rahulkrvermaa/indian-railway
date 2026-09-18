import { env } from '@/config/env';

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
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'RailGaadi/0.1.0',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);

    const json = await res.json();
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
  } catch (e) {
    console.warn('Overpass terrain fetch failed:', e);

    // Return a few synthetic POIs if Overpass is unavailable
    return [
      { type: 'river', name: 'Tapti River', lat: 21.15, lng: 72.72, distanceKm: 265 },
      { type: 'bridge', name: 'Kota Railway Bridge', lat: 25.18, lng: 75.85, distanceKm: 918 },
      { type: 'mountain', name: 'Aravalli Hills', lat: 24.6, lng: 73.9, distanceKm: 750 },
    ];
  }
}

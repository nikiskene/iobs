// src/lib/mapbox.ts
export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as
  | string
  | undefined;

export type CityResult = {
  label: string;
  city: string;
  lat: number;
  lng: number;
};

export async function searchCities(query: string): Promise<CityResult[]> {
  if (!MAPBOX_ACCESS_TOKEN) {
    console.warn('Missing VITE_MAPBOX_ACCESS_TOKEN');
    return [];
  }

  if (query.trim().length < 2) return [];

  const params = new URLSearchParams({
    access_token: MAPBOX_ACCESS_TOKEN,
    autocomplete: 'true',
    types: 'place',
    limit: '5',
  });

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query.trim(),
  )}.json?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    console.error('Mapbox geocoding failed:', response.status, text);
    return [];
  }

  const data = await response.json();
  console.log('Mapbox city results:', data.features);

  const features = (data.features || []) as Array<{
    center: [number, number];
    place_name?: string;
    text: string;
  }>;

  return features
    .filter((feature) => Array.isArray(feature.center))
    .map((feature) => {
      const [lng, lat] = feature.center;

      return {
        label: feature.place_name || feature.text,
        city: feature.text,
        lat,
        lng,
      };
    });
}

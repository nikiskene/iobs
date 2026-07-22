// src/hooks/useMemberLocations.ts
import { useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';

export type MemberLocation = {
  id: string;
  full_name: string | null;
  photo_url: string | null;
  city: string | null;
  location_label: string | null;
  geo_lat: number;
  geo_lng: number;
};

export function useMemberLocations() {
  const [members, setMembers] = useState<MemberLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, photo_url, city, location_label, geo_lat, geo_lng')
      .eq('is_active', true)
      .eq('is_public', true)
      .eq('show_on_map', true)
      .not('geo_lat', 'is', null)
      .not('geo_lng', 'is', null)
      .then(({ data }) => {
        setMembers((data as MemberLocation[]) || []);
        setLoading(false);
      });
  }, []);

  return { members, loading };
}
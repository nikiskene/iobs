// src/hooks/useMembers.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

type Options = {
  excludeCurrentUser?: boolean;
};

export function useMembers(options: Options = {}) {
  const { excludeCurrentUser = false } = options;
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadMembers() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .order('full_name');

      if (excludeCurrentUser && user) {
        query = query.neq('id', user.id);
      }

      const { data } = await query;

      if (!mounted) return;

      setMembers((data as Profile[]) || []);
      setLoading(false);
    }

    loadMembers();

    return () => {
      mounted = false;
    };
  }, [excludeCurrentUser]);

  return {
    members,
    loading,
  };
}
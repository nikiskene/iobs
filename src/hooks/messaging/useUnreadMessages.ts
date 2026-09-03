// src/hooks/messaging/useUnreadMessages.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getUnreadMessageCount } from '../../lib/messaging/messagingApi';
import { useAuth } from '../useAuth';

export function useUnreadMessages() {
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }

    async function load() {
      try {
        setCount(await getUnreadMessageCount());
      } catch {
        setCount(0);
      }
    }

    load();

    const channel = supabase
      .channel('unread-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        load
      )
      .subscribe();

    window.addEventListener('inbox-read-state-changed', load);

    return () => {
      window.removeEventListener('inbox-read-state-changed', load);
      supabase.removeChannel(channel);
    };
  }, [user]);

  return count;
}

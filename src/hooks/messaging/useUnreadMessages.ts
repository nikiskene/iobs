// src/hooks/messaging/useUnreadMessages.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getUnreadMessageCount } from '../../lib/messaging/messagingApi';

export function useUnreadMessages() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      setCount(await getUnreadMessageCount());
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
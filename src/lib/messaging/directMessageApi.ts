// src/lib/messaging/directMessageApi.ts
import { supabase } from '../supabase';

export async function getOrCreateMemberDm(otherUserId: string) {
  const { data, error } = await supabase.rpc('get_or_create_member_dm', {
    other_user_id: otherUserId,
  });

  if (error) throw error;

  return data as string;
}
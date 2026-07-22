// supabase/functions/identity-discovery/auth.ts
import { getSupabase } from './db.ts';

export async function authorizeScan(req: Request, mode: string): Promise<void> {
  if (mode === 'scheduled') {
    const expected = Deno.env.get('IDENTITY_CRON_SECRET');
    const supplied = req.headers.get('x-cron-secret');
    if (!expected || !supplied || supplied !== expected) throw new Error('Unauthorized scheduled scan.');
    return;
  }

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new Error('Authentication required.');
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error('Invalid session.');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();
  if (profile?.role !== 'admin') throw new Error('Admin access required.');
}

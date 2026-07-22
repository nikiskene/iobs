// supabase/functions/identity-discovery/index.ts
import { corsHeaders } from './cors.ts';
import { runScan } from './scan.ts';
import { authorizeScan } from './auth.ts';
import { getSupabase, shouldRunScheduled } from './db.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode === 'scheduled' ? 'scheduled' : 'manual';
    await authorizeScan(req, mode);
    if (mode === 'scheduled' && !(await shouldRunScheduled(getSupabase()))) {
      return new Response(JSON.stringify({ ok: true, skipped: true, message: 'Outside configured scan window or already completed.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const result = await runScan(mode);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown scan error';
    const status = /Authentication required|Invalid session/.test(message)
      ? 401
      : /Unauthorized|Admin access required/.test(message) ? 403 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

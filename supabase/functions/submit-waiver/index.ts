import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { WAIVER_TEXT, WAIVER_VERSION } from '../_shared/waiver.ts';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
Deno.serve(async (req) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  try {
    if (Number(req.headers.get('content-length') || 0) > 410000) return reply({ error: 'Request too large' }, 413);
    // Bound the stream even when Content-Length is absent.
    const reader = req.body?.getReader(); if (!reader) return reply({ error: 'Body required' }, 400);
    let raw = ''; let size = 0; const decoder = new TextDecoder();
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 410000) { await reader.cancel(); return reply({ error: 'Request too large' }, 413); } raw += decoder.decode(value, { stream: true }); }
    raw += decoder.decode();
    const body = JSON.parse(raw);
    if (body.website) return reply({ error: 'Invalid submission' }, 400);
    if (typeof body.full_name !== 'string' || !body.full_name.trim() || body.full_name.trim().length > 120 || typeof body.email !== 'string' || body.email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || body.accepted !== true || body.version !== WAIVER_VERSION || typeof body.signature !== 'string' || !body.signature.startsWith('data:image/png;base64,')) return reply({ error: 'Valid name, email, consent and signature required' }, 400);
    const bytes = Uint8Array.from(atob(body.signature.slice(22)), c => c.charCodeAt(0));
    const magic = [137,80,78,71,13,10,26,10];
    if (bytes.length < 1000 || bytes.length > 300000 || !magic.every((v, i) => bytes[i] === v) || String.fromCharCode(...bytes.slice(12,16)) !== 'IHDR') return reply({ error: 'Invalid signature image' }, 400);
    const view = new DataView(bytes.buffer);
    if (view.getUint32(16) !== 1000 || view.getUint32(20) !== 300) return reply({ error: 'Invalid image dimensions' }, 400);
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
    const key = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2,'0')).join('');
    const limit = await db.rpc('waiver_allow_request', { request_key: key });
    if (limit.error || !limit.data) return reply({ error: 'Please wait before trying again' }, 429);
    const id = crypto.randomUUID(); const path = `${id}/signature.png`;
    const upload = await db.storage.from('waiver-signatures').upload(path, bytes, { contentType: 'image/png', upsert: false });
    if (upload.error) throw upload.error;
    const insert = await db.from('media_waivers').insert({ id, full_name: body.full_name.trim(), email: body.email.trim(), accepted: true, legal_version: WAIVER_VERSION, legal_text: WAIVER_TEXT, signature_path: path });
    if (insert.error) { await db.storage.from('waiver-signatures').remove([path]); throw insert.error; }
    return reply({ id });
  } catch { return reply({ error: 'The waiver could not be saved. Please try again.' }, 400); }
});

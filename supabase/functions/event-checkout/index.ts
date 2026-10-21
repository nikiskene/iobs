import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import Stripe from "npm:stripe@18.5.0";
const url = Deno.env.get("SUPABASE_URL")!;
const db = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const site = Deno.env.get("EVENT_SITE_URL")!;
Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const allowed = new Set([site]);
  if (site) {
    const u = new URL(site);
    u.hostname = u.hostname.startsWith("www.")
      ? u.hostname.slice(4)
      : `www.${u.hostname}`;
    allowed.add(u.origin);
  }
  const headers = {
    "Access-Control-Allow-Origin":
      origin && allowed.has(origin) ? origin : site,
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  const respond = (body: unknown, status = 200) =>
    Response.json(body, { status, headers });
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST")
    return respond({ error: "Method not allowed" }, 405);
  if (origin && !allowed.has(origin))
    return respond({ error: "Origin not allowed" }, 403);
  try {
    if (!site || !/^https:\/\//.test(site))
      throw new Error("Configuration missing");
    if (Number(req.headers.get("content-length") || 0) > 4096)
      return respond({ error: "Request too large" }, 413);
    const raw = await req.text();
    if (raw.length > 4096) return respond({ error: "Request too large" }, 413);
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(ip),
    );
    const requestKey = Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    const limit = await db.rpc("event_registration_allow_request", {
      request_key: requestKey,
    });
    if (limit.error || !limit.data)
      return respond(
        { error: "Too many requests. Please wait a minute." },
        429,
      );
    const body = JSON.parse(raw);
    if (
      typeof body.event_id !== "string" ||
      typeof body.name !== "string" ||
      typeof body.email !== "string"
    )
      return respond({ error: "Name, email and event required." }, 400);
    let uid: null | string = null;
    const token = req.headers.get("Authorization")?.replace(/^Bearer /i, "");
    // An anon API JWT carries no user. Only getUser's verified user can be linked.
    if (token) {
      const { data } = await db.auth.getUser(token);
      uid = data.user?.id || null;
    }
    const { data: r, error } = await db.rpc("prepare_event_registration", {
      eid: body.event_id,
      attendee: body.name,
      email: body.email,
      verified_user: uid,
    });
    if (error)
      return respond(
        {
          error: "Registration unavailable. Check your details and event date.",
        },
        400,
      );
    if (["free", "paid", "refunded"].includes(r.payment_status))
      return respond({ registered: true });
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
    if (r.stripe_checkout_session_id) {
      const old = await stripe.checkout.sessions.retrieve(
        r.stripe_checkout_session_id,
      );
      if (old.status === "open") return respond({ url: old.url });
      if (old.status === "complete")
        return respond({ registered: true, pending: true });
      const { data: updated, error: retryError } = await db
        .from("event_registrations")
        .update({
          stripe_checkout_session_id: null,
          checkout_attempt: r.checkout_attempt + 1,
        })
        .eq("id", r.id)
        .eq("checkout_attempt", r.checkout_attempt)
        .select()
        .single();
      if (retryError)
        return respond({ error: "Please retry registration." }, 409);
      r.checkout_attempt = updated.checkout_attempt;
    }
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: r.attendee_email,
        client_reference_id: r.id,
        metadata: { registration_id: r.id },
        payment_intent_data: { metadata: { registration_id: r.id } },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: r.currency.toLowerCase(),
              unit_amount: r.amount_cents,
              product_data: { name: r.event_title },
            },
          },
        ],
        success_url: `${site}/events/${encodeURIComponent(r.event_slug)}?checkout=returned`,
        cancel_url: `${site}/events/${encodeURIComponent(r.event_slug)}?checkout=cancelled`,
      },
      { idempotencyKey: `event-registration-${r.id}-${r.checkout_attempt}` },
    );
    const { error: saveError } = await db
      .from("event_registrations")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", r.id)
      .eq("checkout_attempt", r.checkout_attempt);
    if (saveError) throw saveError;
    return respond({ url: session.url });
  } catch (e) {
    console.error(
      "Event registration failed",
      e instanceof Error ? e.name : "unknown",
    );
    return respond(
      { error: "Registration could not be completed. Please try again." },
      500,
    );
  }
});

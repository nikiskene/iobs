import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import Stripe from "npm:stripe@18.5.0";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
Deno.serve(async (req) => {
  if (
    !Deno.env.get("STRIPE_SECRET_KEY") ||
    !Deno.env.get("STRIPE_EVENT_WEBHOOK_SECRET")
  )
    return new Response("Payments not configured", { status: 503 });
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await req.text(),
      req.headers.get("stripe-signature") || "",
      Deno.env.get("STRIPE_EVENT_WEBHOOK_SECRET")!,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.metadata?.registration_id && s.payment_status === "paid") {
        const { data: r, error } = await db
          .from("event_registrations")
          .select("*")
          .eq("id", s.metadata?.registration_id || "")
          .single();
        if (error || !r) throw new Error("Registration missing");
        if (
          s.amount_total !== r.amount_cents ||
          s.currency !== r.currency.toLowerCase() ||
          s.client_reference_id !== r.id
        )
          throw new Error("Payment mismatch");
        // A webhook may arrive before checkout creation writes the session ID.
        if (
          r.stripe_checkout_session_id &&
          r.stripe_checkout_session_id !== s.id
        )
          throw new Error("Session mismatch");
        const pi =
          typeof s.payment_intent === "string"
            ? await stripe.paymentIntents.retrieve(s.payment_intent, {
                expand: ["latest_charge"],
              })
            : null;
        const refunded =
          pi?.latest_charge &&
          typeof pi.latest_charge !== "string" &&
          pi.latest_charge.refunded;
        const { error: updateError } = await db
          .from("event_registrations")
          .update({
            payment_status: refunded ? "refunded" : "paid",
            stripe_checkout_session_id: s.id,
            stripe_payment_intent_id:
              typeof s.payment_intent === "string"
                ? s.payment_intent
                : s.payment_intent?.id,
          })
          .eq("id", r.id)
          .eq("payment_status", "pending");
        if (updateError) throw updateError;
      }
    }
    if (event.type === "charge.refunded") {
      const c = event.data.object as Stripe.Charge;
      if (c.refunded && typeof c.payment_intent === "string") {
        const { error } = await db
          .from("event_registrations")
          .update({ payment_status: "refunded" })
          .eq("stripe_payment_intent_id", c.payment_intent)
          .eq("payment_status", "paid");
        if (error) throw error;
      }
    }
    return Response.json({ received: true });
  } catch {
    console.error("Event webhook processing failed", event.id);
    return new Response("Retry required", { status: 500 });
  }
});

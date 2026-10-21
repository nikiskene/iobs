import Stripe from "npm:stripe@18.5.0";
const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};
const stripe = new Stripe("sk_test_fixture");
Deno.env.set("SUPABASE_URL", "http://localhost:9999");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "fixture");
Deno.env.set("STRIPE_SECRET_KEY", "sk_test_fixture");
Deno.env.set("EVENT_SITE_URL", "https://example.com");
Deno.env.set("STRIPE_EVENT_WEBHOOK_SECRET", "whsec_fixture");
let checkoutHandler: (r: Request) => Promise<Response>,
  webhookHandler: (r: Request) => Promise<Response>;
const serve = Deno.serve;
// Capture handlers; tests never open a listener or contact production.
Deno.serve = ((handler: typeof checkoutHandler) => {
  if (!checkoutHandler) checkoutHandler = handler;
  else webhookHandler = handler;
  return {} as Deno.HttpServer;
}) as typeof Deno.serve;

const originalFetch = globalThis.fetch;
let sentPrice = "",
  updates: Record<string, unknown>[] = [];
let paid = false,
  refunded = false;
const registration = {
  id: "00000000-0000-4000-8000-000000000001",
  attendee_email: "guest@example.com",
  amount_cents: 1500,
  currency: "EUR",
  event_title: "Test",
  event_slug: "test",
  checkout_attempt: 0,
};
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input instanceof Request ? input.url : input);
  const json = (v: unknown) =>
    new Response(JSON.stringify(v), {
      headers: { "Content-Type": "application/json" },
    });
  if (url.includes("/rpc/event_registration_allow_request")) return json(true);
  if (url.includes("/rpc/prepare_event_registration"))
    return json({ ...registration, payment_status: paid ? "free" : "pending" });
  if (url.includes("/v1/checkout/sessions")) {
    const params = new URLSearchParams(String(init?.body));
    sentPrice = params.get("line_items[0][price_data][unit_amount]") || "";
    return json({ id: "cs_test", url: "https://checkout.stripe.com/fixture" });
  }
  if (url.includes("/v1/payment_intents/"))
    return json({ id: "pi_test", latest_charge: { id: "ch_test", refunded } });
  if (url.includes("/event_registrations")) {
    if (init?.method === "PATCH") {
      updates.push(JSON.parse(String(init.body)));
      return json(null);
    }
    return json({
      ...registration,
      payment_status: "pending",
      stripe_checkout_session_id: "cs_test",
    });
  }
  throw new Error("Unexpected network request: " + url);
}) as typeof fetch;
await import("./event-checkout/index.ts");
await import("./event-webhook/index.ts");
Deno.serve = serve;
const request = (extra = {}) =>
  new Request("http://localhost/checkout", {
    method: "POST",
    headers: { Origin: "https://example.com" },
    body: JSON.stringify({
      event_id: registration.id,
      name: "Guest",
      email: "guest@example.com",
      ...extra,
    }),
  });
Deno.test(
  "checkout ignores browser price and redirects to server-created Stripe session",
  async () => {
    const res = await checkoutHandler(
      request({ price: 1, amount: 1, currency: "JPY" }),
    );
    assert(res.status === 200, "checkout response");
    assert(sentPrice === "1500", "trusted database price");
    assert(
      (await res.json()).url.includes("checkout.stripe.com"),
      "checkout URL",
    );
  },
);
Deno.test("free event bypasses Stripe", async () => {
  paid = true;
  sentPrice = "";
  const res = await checkoutHandler(request());
  assert((await res.json()).registered, "free registration");
  assert(sentPrice === "", "Stripe bypassed");
  paid = false;
});
Deno.test("checkout rejects unexpected origin and method", async () => {
  assert(
    (await checkoutHandler(new Request("http://localhost", { method: "GET" })))
      .status === 405,
    "method blocked",
  );
  assert(
    (
      await checkoutHandler(
        new Request("http://localhost", {
          method: "POST",
          headers: { Origin: "https://evil.example" },
          body: "{}",
        }),
      )
    ).status === 403,
    "origin blocked",
  );
});
async function signed(type: string, object: unknown) {
  const payload = JSON.stringify({ id: "evt_test", type, data: { object } });
  const signature = await stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret: "whsec_fixture",
    cryptoProvider: Stripe.createSubtleCryptoProvider(),
  });
  return new Request("http://localhost/webhook", {
    method: "POST",
    headers: { "stripe-signature": signature },
    body: payload,
  });
}
const session = {
  id: "cs_test",
  metadata: { registration_id: registration.id },
  client_reference_id: registration.id,
  amount_total: 1500,
  currency: "eur",
  payment_status: "paid",
  payment_intent: "pi_test",
};
Deno.test("webhook rejects forged signature", async () => {
  assert(
    (
      await webhookHandler(
        new Request("http://localhost", { method: "POST", body: "{}" }),
      )
    ).status === 400,
    "signature required",
  );
});
Deno.test("signed paid webhook validates amount and records paid", async () => {
  updates = [];
  const r = await webhookHandler(
    await signed("checkout.session.completed", session),
  );
  assert(r.status === 200, "accepted signed webhook");
  assert(updates.at(-1)?.payment_status === "paid", "paid state");
});
Deno.test("signed webhook with wrong amount never fulfills", async () => {
  updates = [];
  const r = await webhookHandler(
    await signed("checkout.session.completed", { ...session, amount_total: 1 }),
  );
  assert(r.status === 500, "mismatch requires investigation");
  assert(updates.length === 0, "no fulfillment");
});
Deno.test("payment return or unpaid completion never marks paid", async () => {
  updates = [];
  await webhookHandler(
    await signed("checkout.session.completed", {
      ...session,
      payment_status: "unpaid",
    }),
  );
  assert(updates.length === 0, "unpaid not fulfilled");
});
Deno.test(
  "full refund received before completion remains refunded",
  async () => {
    updates = [];
    refunded = true;
    await webhookHandler(await signed("checkout.session.completed", session));
    assert(
      updates.at(-1)?.payment_status === "refunded",
      "late completion preserves refund",
    );
    refunded = false;
  },
);
Deno.test("full refunds update matching payment intent", async () => {
  updates = [];
  await webhookHandler(
    await signed("charge.refunded", {
      id: "ch_test",
      payment_intent: "pi_test",
      refunded: true,
    }),
  );
  assert(updates.at(-1)?.payment_status === "refunded", "full refund status");
});
Deno.test(
  "unrelated Stripe checkouts are acknowledged without retry storm",
  async () => {
    updates = [];
    const r = await webhookHandler(
      await signed("checkout.session.completed", { ...session, metadata: {} }),
    );
    assert(r.status === 200 && updates.length === 0, "other checkout ignored");
  },
);
// Restoring fetch is unnecessary: Deno exits after these isolated tests.
void originalFetch;

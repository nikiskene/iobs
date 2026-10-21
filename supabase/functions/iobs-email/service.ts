import {
  EmailError,
  username,
  existingLocal,
  validPassword,
  recentlyAuthenticated,
  marker,
  mailboxStatus,
  messages,
  DOMAIN,
  type Mailbox,
} from "./domain.ts";
import type { EmailProvider } from "./migadu.ts";
export type Actor = {
  uid: string;
  member_id: string;
  admin: boolean;
  name: string;
};
export interface EmailStore {
  authenticate(token: string): Promise<Actor>;
  eligible(memberId: string): Promise<boolean>;
  rate(memberId: string, action: string, max: number): Promise<boolean>;
  mailbox(memberId: string): Promise<Mailbox | null>;
  reserve(uid: string, local: string): Promise<Mailbox>;
  markCreating(row: Mailbox): Promise<void>;
  finish(row: Mailbox, status: string): Promise<void>;
  lock(row: Mailbox): Promise<Mailbox>;
  link(memberId: string, local: string, status: string): Promise<void>;
}
export function createEmailHandler(
  store: EmailStore,
  provider: EmailProvider,
  config: { enabled: boolean; configured: boolean },
) {
  return async (req: Request): Promise<Response> => {
    const headers = {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin":
        req.headers.get("origin") || "https://www.iobs.cc",
      Vary: "Origin",
      "Access-Control-Allow-Headers":
        "authorization, apikey, content-type, x-client-info",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
    // Access control is authentication + RLS, not CORS. Supabase JWTs are verified on every request.
    const respond = (body: unknown, status = 200) =>
      Response.json(body, { status, headers });
    if (req.method === "OPTIONS") return new Response(null, { headers });
    if (req.method !== "POST")
      return respond({ error: "Method not allowed" }, 405);
    try {
      if (Number(req.headers.get("content-length") || 0) > 4096)
        throw new EmailError("invalid_request", 413);
      const raw = await req.text();
      if (raw.length > 4096) throw new EmailError("invalid_request", 413);
      let body: Record<string, unknown>;
      try {
        body = JSON.parse(raw);
      } catch {
        throw new EmailError("invalid_request");
      }
      if (!body || Array.isArray(body) || typeof body !== "object")
        throw new EmailError("invalid_request");
      const token = req.headers
        .get("Authorization")
        ?.match(/^Bearer (.+)$/i)?.[1];
      if (!token) throw new EmailError("unauthorized", 401);
      const actor = await store.authenticate(token);
      if (
        typeof body.action !== "string" ||
        ![
          "availability",
          "create",
          "password",
          "status",
          "link",
          "check_provider",
        ].includes(body.action)
      )
        throw new EmailError("invalid_request");
      const action = body.action;
      if (
        ["create", "password", "link", "check_provider"].includes(action) &&
        !recentlyAuthenticated(token)
      )
        throw new EmailError("reauthenticate", 401);
      if (["link", "check_provider"].includes(action) && !actor.admin)
        throw new EmailError("forbidden", 403);
      if (
        body.member_id !== undefined &&
        !actor.admin &&
        body.member_id !== actor.member_id
      )
        throw new EmailError("forbidden", 403);
      const memberId =
        actor.admin && typeof body.member_id === "string"
          ? body.member_id
          : actor.member_id;
      if (action === "password" && memberId !== actor.member_id)
        throw new EmailError("forbidden", 403);
      if (
        !config.configured ||
        (!config.enabled && action !== "check_provider")
      )
        throw new EmailError("disabled", 503);
      const rateKind = ["link", "check_provider"].includes(action)
        ? "admin"
        : action;
      const max = action === "availability" ? 30 : action === "status" ? 20 : 5;
      if (!(await store.rate(actor.member_id, rateKind, max)))
        throw new EmailError("rate_limited", 429);
      if (action === "check_provider")
        return respond({ ready: await provider.check() });
      if (action === "link") {
        const local = existingLocal(body.username);
        if (await store.mailbox(memberId))
          throw new EmailError("already_exists", 409);
        const boxes = await provider.mailboxes();
        if (!boxes.some((b) => b.local_part === local))
          throw new EmailError("missing", 404);
        const box = await provider.get(local);
        await store.link(memberId, local, mailboxStatus(box));
        return respond({ linked: true });
      }
      if (action === "availability" || action === "create") {
        if (!(await store.eligible(actor.member_id)))
          throw new EmailError("not_eligible", 403);
        const local = username(body.username);
        const existing = await store.mailbox(actor.member_id);
        if (
          existing &&
          ["active", "disabled", "missing"].includes(existing.status)
        )
          throw new EmailError("already_exists", 409);
        if (
          existing &&
          (existing.provider_create_started_at ||
            existing.status === "needs_review")
        )
          throw new EmailError("reconciliation_required", 409);
        if (action === "availability") {
          const inventory = await provider.inventory();
          return respond({ available: !inventory.occupied.has(local) });
        }
        if (!validPassword(body.password))
          throw new EmailError("invalid_password");
        const row = await store.reserve(actor.uid, local);
        let attempted = false;
        try {
          const inventory = await provider.inventory();
          if (inventory.occupied.has(local)) {
            await store.finish(row, "conflict");
            throw new EmailError("taken", 409);
          }
          await store.markCreating(row);
          attempted = true;
          await provider.create(local, marker(row.operation_id), body.password);
          // Re-read effective provider flags. Never infer send/receive readiness from HTTP 200 alone.
          const box = await provider.get(local);
          if (box.name !== marker(row.operation_id))
            throw new EmailError("needs_review", 409);
          await store.finish(row, mailboxStatus(box));
          return respond({
            created: true,
            email_address: `${local}@${DOMAIN}`,
            status: mailboxStatus(box),
          });
        } catch (error) {
          if (error instanceof EmailError && error.code === "taken")
            throw error;
          // A timeout is ambiguous: keep the same address reserved and never blindly POST again.
          try {
            await store.finish(row, attempted ? "needs_review" : "retryable");
          } catch {
            /* persisted operation marker allows read-only reconciliation */
          }
          throw new EmailError(
            attempted
              ? "needs_review"
              : error instanceof EmailError
                ? error.code
                : "save_failed",
            503,
          );
        }
      }
      const current = await store.mailbox(memberId);
      if (!current) throw new EmailError("missing", 404);
      // A mailbox already linked by an administrator remains usable after eligibility is turned off.
      if (action === "password") {
        if (!validPassword(body.password))
          throw new EmailError("invalid_password");
        if (!["active", "disabled"].includes(current.status))
          throw new EmailError("reconciliation_required", 409);
        const row = await store.lock(current);
        try {
          await provider.changePassword(
            row.migadu_mailbox_identifier,
            body.password,
          );
          await store.finish(row, current.status);
        } catch {
          try {
            await store.finish(row, current.status);
          } catch {
            /* retry can verify provider state without saving a password */
          }
          throw new EmailError("provider_unavailable", 503);
        }
        return respond({ changed: true });
      }
      const row = await store.lock(current);
      try {
        const boxes = await provider.mailboxes();
        if (
          !boxes.some((box) => box.local_part === row.migadu_mailbox_identifier)
        ) {
          const status = ["active", "disabled", "missing"].includes(row.status)
            ? "missing"
            : row.provider_create_started_at
              ? "needs_review"
              : "retryable";
          await store.finish(row, status);
          return respond({ status });
        }
        const box = await provider.get(row.migadu_mailbox_identifier);
        if (
          !["active", "disabled", "missing"].includes(row.status) &&
          (!row.provider_create_started_at ||
            box.name !== marker(row.operation_id))
        ) {
          await store.finish(row, "needs_review");
          throw new EmailError("reconciliation_required", 409);
        }
        await store.finish(row, mailboxStatus(box));
        return respond({ status: mailboxStatus(box) });
      } catch (error) {
        try {
          await store.finish(row, row.status);
        } catch {
          /* preserve durable reservation */
        }
        throw error;
      }
    } catch (error) {
      const safe =
        error instanceof EmailError
          ? error
          : new EmailError("save_failed", 503);
      return respond(
        {
          code: safe.code,
          error:
            messages[safe.code] ||
            "Email account management is temporarily unavailable.",
        },
        safe.status,
      );
    }
  };
}

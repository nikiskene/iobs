import type { SupabaseClient } from "npm:@supabase/supabase-js@2.57.4";
import { DOMAIN, EmailError, type Mailbox } from "./domain.ts";
import type { Actor, EmailStore } from "./service.ts";
export class SupabaseEmailStore implements EmailStore {
  constructor(private db: SupabaseClient) {}
  private async rpc<T>(
    name: string,
    args: Record<string, unknown>,
  ): Promise<T> {
    const { data, error } = await this.db.rpc(name, args);
    if (error) {
      const code =
        error.code === "55P03"
          ? "busy"
          : error.code === "23505"
            ? "taken"
            : error.code === "42501"
              ? "not_eligible"
              : error.message?.includes("already has")
                ? "already_exists"
                : error.message?.includes("verification")
                  ? "reconciliation_required"
                  : "save_failed";
      throw new EmailError(
        code,
        code === "not_eligible"
          ? 403
          : code === "busy" ||
              code === "taken" ||
              code === "already_exists" ||
              code === "reconciliation_required"
            ? 409
            : 503,
      );
    }
    return data as T;
  }
  async authenticate(token: string): Promise<Actor> {
    const { data, error } = await this.db.auth.getUser(token);
    if (error || !data.user) throw new EmailError("unauthorized", 401);
    const p = await this.db
      .from("profiles")
      .select("member_id,role,is_active")
      .eq("id", data.user.id)
      .single();
    if (p.error || !p.data?.is_active) throw new EmailError("forbidden", 403);
    const m = await this.db
      .from("team_people")
      .select("id,full_name,merged_into")
      .eq("id", p.data.member_id)
      .single();
    if (m.error || !m.data || m.data.merged_into)
      throw new EmailError("forbidden", 403);
    return {
      uid: data.user.id,
      member_id: m.data.id,
      admin: ["admin", "super_admin"].includes(p.data.role),
      name: m.data.full_name,
    };
  }
  async eligible(mid: string) {
    const { data, error } = await this.db
      .from("member_email_permissions")
      .select("email_creation_allowed")
      .eq("member_id", mid)
      .maybeSingle();
    if (error) throw new EmailError("save_failed", 503);
    return data?.email_creation_allowed === true;
  }
  rate(mid: string, action: string, max: number) {
    return this.rpc<boolean>("email_service_rate_limit", {
      mid,
      kind: action,
      max_hits: max,
    });
  }
  async mailbox(mid: string) {
    const { data, error } = await this.db
      .from("iobs_mailboxes")
      .select("*")
      .eq("member_id", mid)
      .maybeSingle();
    if (error) throw new EmailError("save_failed", 503);
    return data as Mailbox | null;
  }
  reserve(uid: string, local: string) {
    return this.rpc<Mailbox>("email_service_reserve", {
      actor: uid,
      local_name: local,
    });
  }
  markCreating(row: Mailbox) {
    return this.rpc<void>("email_service_mark_creating", {
      mailbox: row.id,
      token: row.lease_token,
    });
  }
  finish(row: Mailbox, status: string) {
    return this.rpc<void>("email_service_finish", {
      mailbox: row.id,
      token: row.lease_token,
      new_status: status,
    });
  }
  lock(row: Mailbox) {
    return this.rpc<Mailbox>("email_service_lock", { mailbox: row.id });
  }
  link(mid: string, local: string, status: string) {
    return this.rpc<void>("email_service_link", {
      mid,
      address: `${local}@${DOMAIN}`,
      provider_id: local,
      provider_status: status,
    });
  }
}

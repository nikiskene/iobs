import { DOMAIN, EmailError, type ProviderMailbox } from "./domain.ts";
export interface EmailProvider {
  mailboxes(): Promise<ProviderMailbox[]>;
  get(local: string): Promise<ProviderMailbox>;
  inventory(): Promise<{ mailboxes: ProviderMailbox[]; occupied: Set<string> }>;
  create(
    local: string,
    name: string,
    password: string,
  ): Promise<ProviderMailbox>;
  changePassword(local: string, password: string): Promise<void>;
  check(): Promise<boolean>;
}
// Reject unknown response envelopes instead of treating unavailable data as an empty address book.
function list<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    for (const key of keys) {
      const rows = (payload as Record<string, unknown>)[key];
      if (Array.isArray(rows)) return rows as T[];
    }
  }
  throw new EmailError("provider_unavailable", 503);
}
export class MigaduProvider implements EmailProvider {
  constructor(
    private user: string,
    private key: string,
    private send: typeof fetch = fetch,
  ) {}
  private async request(path: string, method = "GET", body?: unknown) {
    let result: Response;
    try {
      result = await this.send(
        `https://api.migadu.com/v1/domains/${DOMAIN}${path}`,
        {
          method,
          headers: {
            Authorization: `Basic ${btoa(this.user + ":" + this.key)}`,
            "Content-Type": "application/json",
          },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: AbortSignal.timeout(15000),
          redirect: "error",
        },
      );
    } catch {
      throw new EmailError("provider_unavailable", 503);
    }
    // Provider errors can echo passwords. Never read, log or return their body.
    if (!result.ok) {
      await result.body?.cancel();
      throw new EmailError("provider_unavailable", 503);
    }
    try {
      return await result.json();
    } catch {
      throw new EmailError("provider_unavailable", 503);
    }
  }
  async check() {
    const d = await this.request("");
    await this.inventory();
    return (
      d.can_send === true && d.can_receive === true && d.can_access === true
    );
  }
  async mailboxes() {
    return list<ProviderMailbox>(await this.request("/mailboxes"), [
      "mailboxes",
    ]);
  }
  async get(local: string) {
    const box = await this.request(`/mailboxes/${encodeURIComponent(local)}`);
    if (box.local_part !== local || box.address !== `${local}@${DOMAIN}`)
      throw new EmailError("provider_unavailable", 503);
    return box as ProviderMailbox;
  }
  async inventory() {
    const mailboxes = await this.mailboxes();
    const aliases = list<{ local_part: string }>(
      await this.request("/aliases"),
      ["aliases", "address_aliases"],
    );
    const rewrites = list<{ local_part_rule: string }>(
      await this.request("/rewrites"),
      ["rewrites"],
    );
    if (mailboxes.length > 200)
      throw new EmailError("provider_unavailable", 503);
    const occupied = new Set<string>();
    for (const row of [...mailboxes, ...aliases]) {
      if (typeof row.local_part !== "string")
        throw new EmailError("provider_unavailable", 503);
      occupied.add(row.local_part.toLowerCase());
    }
    for (let offset = 0; offset < mailboxes.length; offset += 4) {
      await Promise.all(
        mailboxes.slice(offset, offset + 4).map(async (box) => {
          const identities =
            box.identities ??
            list<{ local_part: string }>(
              await this.request(
                `/mailboxes/${encodeURIComponent(box.local_part)}/identities`,
              ),
              ["identities"],
            );
          if (!Array.isArray(identities))
            throw new EmailError("provider_unavailable", 503);
          for (const identity of identities) {
            if (typeof identity.local_part !== "string")
              throw new EmailError("provider_unavailable", 503);
            occupied.add(identity.local_part.toLowerCase());
          }
        }),
      );
    }
    // Rewrite precedence/pattern syntax is not fully specified in the API docs.
    // Exact rewrite names are reserved; patterns require administrator review, never guessed regex semantics.
    for (const row of rewrites) {
      if (
        typeof row.local_part_rule !== "string" ||
        !/^[a-z0-9.-]+$/.test(row.local_part_rule)
      )
        throw new EmailError("routing_review", 503);
      occupied.add(row.local_part_rule.toLowerCase());
    }
    return { mailboxes, occupied };
  }
  async create(local: string, name: string, password: string) {
    const box = await this.request("/mailboxes", "POST", {
      local_part: local,
      name,
      password_method: "password",
      password,
      may_send: true,
      may_receive: true,
      may_access_imap: true,
      is_internal: false,
    });
    if (box.local_part !== local || box.address !== `${local}@${DOMAIN}`)
      throw new EmailError("provider_unavailable", 503);
    return box as ProviderMailbox;
  }
  async changePassword(local: string, password: string) {
    await this.request(`/mailboxes/${encodeURIComponent(local)}`, "PUT", {
      password_method: "password",
      password,
    });
  }
}

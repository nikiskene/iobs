import { createEmailHandler, type EmailStore, type Actor } from "./service.ts";
import {
  EmailError,
  username,
  recentlyAuthenticated,
  type Mailbox,
  type ProviderMailbox,
  marker,
} from "./domain.ts";
import { MigaduProvider, type EmailProvider } from "./migadu.ts";
const assert = (v: unknown, label: string) => {
  if (!v) throw new Error(label);
};
const A = "00000000-0000-4000-8000-000000000001",
  B = "00000000-0000-4000-8000-000000000002";
const password = "Fixture-only-secret-1234";
const jwt = (age = 0, method = "password") =>
  `header.${btoa(JSON.stringify({ iat: Date.now() / 1000, amr: [{ method, timestamp: Math.floor(Date.now() / 1000) - age }] }))}.signature`;
const fresh = jwt();
function setup(
  options: { eligible?: boolean; admin?: boolean; enabled?: boolean } = {},
) {
  const actor: Actor = {
    uid: "login-A",
    member_id: A,
    name: "Member",
    admin: options.admin || false,
  };
  const rows = new Map<string, Mailbox>(),
    boxes = new Map<string, ProviderMailbox>(),
    occupied = new Set<string>();
  let allowed = options.eligible ?? true,
    created = 0,
    changed = 0,
    failCreate = false,
    failFinish = false,
    mayRequest = true;
  function row(member: string, local: string, status = "active"): Mailbox {
    return {
      id: crypto.randomUUID(),
      member_id: member,
      email_address: `${local}@iobs.cc`,
      migadu_mailbox_identifier: local,
      status,
      operation_id: crypto.randomUUID(),
      provider_create_started_at:
        status === "active" ? new Date().toISOString() : null,
      lease_token: "",
      lease_until: null,
    };
  }
  const store: EmailStore = {
    authenticate: async (token) => {
      if (token === "invalid") throw new EmailError("unauthorized", 401);
      return actor;
    },
    eligible: async () => allowed,
    rate: async () => mayRequest,
    mailbox: async (mid) => rows.get(mid) || null,
    reserve: async (_uid, local) => {
      const old = rows.get(A);
      if (old?.lease_token) throw new EmailError("busy", 409);
      if (old?.provider_create_started_at)
        throw new EmailError("reconciliation_required", 409);
      const r = row(A, local, "provisioning");
      r.lease_token = crypto.randomUUID();
      rows.set(A, r);
      return { ...r };
    },
    markCreating: async (r) => {
      rows.get(r.member_id)!.provider_create_started_at =
        new Date().toISOString();
    },
    finish: async (r, status) => {
      if (failFinish) {
        failFinish = false;
        throw new Error("database offline");
      }
      const current = rows.get(r.member_id)!;
      if (current.lease_token !== r.lease_token)
        throw new EmailError("busy", 409);
      current.status = status;
      current.lease_token = "";
    },
    lock: async (r) => {
      if (rows.get(r.member_id)!.lease_token) throw new EmailError("busy", 409);
      const current = rows.get(r.member_id)!;
      current.lease_token = crypto.randomUUID();
      return { ...current };
    },
    link: async (mid, local, status) => {
      rows.set(mid, row(mid, local, status));
    },
  };
  const provider: EmailProvider = {
    check: async () => true,
    mailboxes: async () => [...boxes.values()],
    get: async (local) => {
      const b = boxes.get(local);
      if (!b) throw new EmailError("missing", 404);
      return b;
    },
    inventory: async () => ({
      mailboxes: [...boxes.values()],
      occupied: new Set([...boxes.keys(), ...occupied]),
    }),
    create: async (local, name, chosenPassword) => {
      assert(
        chosenPassword === password,
        "chosen password goes only to provider",
      );
      created++;
      const b = {
        local_part: local,
        address: `${local}@iobs.cc`,
        name,
        may_send: true,
        may_receive: true,
        may_access_imap: true,
      };
      boxes.set(local, b);
      if (failCreate) throw new Error(`provider echoed ${password}`);
      return b;
    },
    changePassword: async () => {
      changed++;
    },
  };
  const handler = createEmailHandler(store, provider, {
    enabled: options.enabled ?? true,
    configured: true,
  });
  const request = (
    action: string,
    extra: Record<string, unknown> = {},
    token = fresh,
  ) =>
    new Request("https://example.com/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, username: "member", password, ...extra }),
    });
  return {
    actor,
    rows,
    boxes,
    occupied,
    row,
    provider,
    handler,
    request,
    counts: () => ({ created, changed }),
    disallow: () => {
      allowed = false;
    },
    failCreate: () => {
      failCreate = true;
    },
    failFinish: () => {
      failFinish = true;
    },
    limit: () => {
      mayRequest = false;
    },
  };
}
Deno.test("username normalization and reserved/invalid names", () => {
  assert(
    username("Dietmar.Dahmen") === "dietmar.dahmen",
    "normalizes uppercase",
  );
  for (const local of [
    "admin",
    "niki",
    "a..b",
    "-a",
    "a-",
    ".a",
    "a.",
    "a b",
    " alice",
    "alice ",
    "a+b",
    "",
    "a".repeat(65),
  ]) {
    let rejected = false;
    try {
      username(local);
    } catch {
      rejected = true;
    }
    assert(rejected, "reject " + local);
  }
});
Deno.test("recent auth uses amr rather than refreshed token issue time", () => {
  assert(recentlyAuthenticated(jwt()), "fresh password accepted");
  assert(
    !recentlyAuthenticated(jwt(3600)),
    "recent iat with old login rejected",
  );
  assert(
    !recentlyAuthenticated(jwt(0, "anonymous")),
    "anonymous auth rejected",
  );
});
Deno.test("unauthenticated and unauthorized callers never create", async () => {
  const s = setup({ eligible: false });
  assert(
    (await s.handler(s.request("create", {}, "invalid"))).status === 401,
    "invalid user denied",
  );
  assert(
    (await s.handler(s.request("create"))).status === 403,
    "eligibility denied",
  );
  assert(s.counts().created === 0, "no provider mutation");
});
Deno.test(
  "authorized member creates one mailbox with caller-chosen password kept private",
  async () => {
    const s = setup();
    const r = await s.handler(s.request("create"));
    const body = await r.text();
    assert(
      r.status === 200 && body.includes("member@iobs.cc"),
      "created immediately",
    );
    assert(!body.includes(password), "password never returned");
    assert(
      (await s.handler(s.request("create", { username: "second" }))).status ===
        409,
      "second mailbox denied",
    );
    assert(s.counts().created === 1, "only one create");
  },
);
Deno.test(
  "aliases, identities and forwarding-only mailbox names are unavailable",
  async () => {
    const s = setup();
    s.occupied.add("member");
    const availability = await s.handler(s.request("availability"));
    assert(
      (await availability.json()).available === false,
      "occupied address unavailable",
    );
    assert(
      (await s.handler(s.request("create"))).status === 409,
      "creation conflict",
    );
    assert(s.counts().created === 0, "no overwrite");
  },
);
Deno.test(
  "recent authentication required before create and password mutation",
  async () => {
    const s = setup();
    const stale = jwt(301);
    assert(
      (await s.handler(s.request("create", {}, stale))).status === 401,
      "old login rejected",
    );
    assert(s.counts().created === 0, "provider untouched");
  },
);
Deno.test(
  "member cannot target another mailbox or link manually created account",
  async () => {
    const s = setup();
    assert(
      (await s.handler(s.request("password", { member_id: B }))).status === 403,
      "other mailbox blocked",
    );
    assert(
      (await s.handler(s.request("link", { username: "niki" }))).status === 403,
      "nonadmin cannot link",
    );
    assert(s.counts().changed === 0, "no password mutation");
  },
);
Deno.test(
  "eligibility revocation leaves mailbox/password management intact",
  async () => {
    const s = setup();
    await s.handler(s.request("create"));
    s.disallow();
    assert(
      (await s.handler(s.request("password"))).status === 200,
      "existing owner can change password",
    );
    assert(s.rows.get(A)?.status === "active", "mailbox remains active");
    assert(s.counts().changed === 1, "password changed exactly once");
  },
);
Deno.test(
  "concurrent creation requests share one durable reservation",
  async () => {
    const s = setup();
    const responses = await Promise.all([
      s.handler(s.request("create")),
      s.handler(s.request("create")),
    ]);
    assert(
      responses.filter((r) => r.status === 200).length === 1,
      "only one success",
    );
    assert(s.counts().created === 1, "only one provider POST");
  },
);
Deno.test(
  "ambiguous provider timeout is reconciled without duplicate POST or password reset",
  async () => {
    const s = setup();
    s.failCreate();
    const result = await s.handler(s.request("create"));
    assert(result.status === 503, "ambiguous result reported");
    assert(
      !(await result.text()).includes(password),
      "provider error is sanitized",
    );
    assert(s.rows.get(A)?.status === "needs_review", "reservation retained");
    assert(
      (await s.handler(s.request("create", { username: "another" }))).status ===
        409,
      "blind retry prohibited",
    );
    assert(
      (await s.handler(s.request("status"))).status === 200,
      "marker verifies existing provider mailbox",
    );
    assert(s.rows.get(A)?.status === "active", "reconciled");
    assert(
      s.counts().created === 1 && s.counts().changed === 0,
      "no duplicate or reset",
    );
  },
);
Deno.test(
  "provider success plus database failure supports reconciliation",
  async () => {
    const s = setup();
    s.failFinish();
    assert(
      (await s.handler(s.request("create"))).status === 503,
      "save error not false success",
    );
    assert(
      (await s.handler(s.request("status"))).status === 200,
      "read-only reconciliation succeeds",
    );
    assert(s.counts().created === 1, "creation not replayed");
  },
);
Deno.test(
  "reconciliation cannot claim unrelated preexisting mailbox",
  async () => {
    const s = setup();
    const pending = s.row(A, "member", "needs_review");
    pending.provider_create_started_at = new Date().toISOString();
    s.rows.set(A, pending);
    s.boxes.set("member", {
      local_part: "member",
      address: "member@iobs.cc",
      name: "Manually owned mailbox",
      may_send: true,
      may_receive: true,
      may_access_imap: true,
    });
    assert(
      (await s.handler(s.request("status"))).status === 409,
      "unknown marker denied",
    );
    assert(s.rows.get(A)?.status === "needs_review", "not claimed");
  },
);
Deno.test(
  "admin explicitly links niki without recreating or changing credentials",
  async () => {
    const s = setup({ admin: true });
    s.boxes.set("niki", {
      local_part: "niki",
      address: "niki@iobs.cc",
      name: "Niki",
      may_send: true,
      may_receive: true,
      may_access_imap: true,
    });
    assert(
      (
        await s.handler(
          s.request("link", { member_id: B, username: "niki@iobs.cc" }),
        )
      ).status === 200,
      "admin link succeeds",
    );
    assert(
      s.rows.get(B)?.email_address === "niki@iobs.cc",
      "explicit selected member only",
    );
    assert(
      s.counts().created === 0 && s.counts().changed === 0,
      "existing provider account untouched",
    );
  },
);
Deno.test("disabled feature and rate limit fail closed", async () => {
  const off = setup({ enabled: false });
  assert(
    (await off.handler(off.request("create"))).status === 503,
    "feature disabled by default",
  );
  const limited = setup();
  limited.limit();
  assert(
    (await limited.handler(limited.request("password"))).status === 429,
    "rate limit enforced",
  );
});
Deno.test(
  "Migadu adapter uses documented paths and PUT password updates",
  async () => {
    const seen: { url: string; method: string; body: string }[] = [];
    const send: typeof fetch = async (input, init) => {
      seen.push({
        url: String(input),
        method: init?.method || "GET",
        body: String(init?.body || ""),
      });
      return Response.json({ local_part: "member", address: "member@iobs.cc" });
    };
    const p = new MigaduProvider("api@example.com", "fixture", send);
    await p.create("member", marker("fixture"), password);
    await p.changePassword("member", password);
    assert(
      seen[0].method === "POST" &&
        seen[0].url.endsWith("/domains/iobs.cc/mailboxes"),
      "documented create endpoint",
    );
    assert(
      seen[1].method === "PUT" && seen[1].url.endsWith("/mailboxes/member"),
      "documented update endpoint",
    );
    assert(
      seen.every((r) => !r.url.includes(password)),
      "no password in URL",
    );
  },
);
Deno.test(
  "Migadu inventory validates envelopes and includes nested identities and aliases",
  async () => {
    const send: typeof fetch = async (input) => {
      const url = String(input);
      if (url.endsWith("/mailboxes"))
        return Response.json({
          mailboxes: [
            {
              local_part: "existing",
              identities: [{ local_part: "alternate" }],
            },
          ],
        });
      if (url.endsWith("/aliases"))
        return Response.json({ aliases: [{ local_part: "forwarding" }] });
      if (url.endsWith("/rewrites")) return Response.json({ rewrites: [] });
      throw new Error("Unexpected network request");
    };
    const p = new MigaduProvider("api@example.com", "fixture", send);
    const result = await p.inventory();
    assert(
      ["existing", "alternate", "forwarding"].every((v) =>
        result.occupied.has(v),
      ),
      "all existing recipients reserved",
    );
  },
);
Deno.test(
  "Migadu provider error bodies and unknown envelopes never leak or mean available",
  async () => {
    const p = new MigaduProvider(
      "api@example.com",
      "fixture",
      async () => new Response(`password=${password}`, { status: 500 }),
    );
    let caught = "";
    try {
      await p.changePassword("member", password);
    } catch (e) {
      caught = e instanceof Error ? e.message : "";
    }
    assert(caught === "provider_unavailable", "provider body redacted");
    const wrong = new MigaduProvider("api@example.com", "fixture", async () =>
      Response.json({ unexpected: [] }),
    );
    let rejected = false;
    try {
      await wrong.inventory();
    } catch {
      rejected = true;
    }
    assert(rejected, "unknown schema fails closed");
  },
);

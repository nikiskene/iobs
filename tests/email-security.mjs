import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
await db.exec(read("./fixtures/chapters-base.sql"));
await db.exec(
  read("../supabase/migrations/20261021100000_chapters_foundation.sql"),
);
await db.exec(
  read(
    "../supabase/migrations/20261021110000_chapters_security_and_registration.sql",
  ),
);
await db.exec(
  "create schema supabase_migrations; create table supabase_migrations.schema_migrations(version text primary key,name text,statements text[])",
);
await db.exec(read("../docs/email-supabase-release.sql"));
const installed = (await db.exec(read("../docs/email-supabase-verify.sql")))[0]
  .rows[0].email_release_verification;
assert.deepEqual(installed, {
  migration_recorded: true,
  rls_enabled: true,
  anonymous_can_reserve: false,
  member_can_reserve_directly: false,
  service_can_reserve: true,
  member_can_write_eligibility: false,
  member_can_read_worker_token: false,
  member_merge_guard_installed: true,
  mailbox_records: 0,
});
const ids = Array.from(
  { length: 7 },
  (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
);
const [admin, alice, bob, aliceLogin, aliceOtherLogin, bobLogin, adminLogin] =
  ids;
await db.exec(
  "alter table profiles disable trigger protect_profile_access_fields",
);
for (const [id, name] of [
  [admin, "Admin"],
  [alice, "Alice"],
  [bob, "Bob"],
])
  await db.query("insert into team_people(id,full_name) values($1,$2)", [
    id,
    name,
  ]);
for (const [uid, member, role] of [
  [adminLogin, admin, "admin"],
  [aliceLogin, alice, "user"],
  [aliceOtherLogin, alice, "user"],
  [bobLogin, bob, "user"],
])
  await db.query(
    "insert into profiles(id,member_id,full_name,profile_name,role) values($1,$2,$3,$4,$3)",
    [uid, member, role, uid],
  );
await db.exec(
  "alter table profiles enable trigger protect_profile_access_fields",
);
let count = 0;
function check(v, label) {
  assert.ok(v, label);
  count++;
  console.log("PASS", label);
}
async function denied(sql, args = []) {
  try {
    await db.query(sql, args);
    return false;
  } catch {
    return true;
  }
}
async function as(uid, role = "authenticated") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    uid || "",
  ]);
  await db.exec(`set role ${role}`);
}
await as(aliceLogin);
check(
  await denied("select email_admin_set_eligibility($1,true)", [alice]),
  "ordinary member cannot grant eligibility",
);
check(
  await denied(
    "insert into member_email_permissions(member_id,email_creation_allowed) values($1,true)",
    [alice],
  ),
  "ordinary member cannot insert permission",
);
check(
  await denied("select email_service_reserve($1,'alice')", [aliceLogin]),
  "browser cannot invoke service provisioning RPC",
);
await as(null, "service_role");
check(
  await denied("select email_service_reserve($1,'alice')", [aliceLogin]),
  "unauthorized member cannot reserve mailbox",
);
await as(adminLogin);
await db.query("select email_admin_set_eligibility($1,true)", [alice]);
await db.query("select email_admin_set_eligibility($1,true)", [bob]);
check(
  (
    await db.query(
      "select email_creation_allowed from member_email_permissions where member_id=$1",
      [alice],
    )
  ).rows[0].email_creation_allowed,
  "administrator enables email eligibility",
);
await as(aliceLogin);
check(
  (await db.query("select * from member_email_permissions")).rows.length === 1,
  "member sees only own eligibility",
);
check(
  (await db.query("select email_owns_member($1) own", [alice])).rows[0].own,
  "auth user maps through distinct canonical member id",
);
await as(null, "service_role");
for (const invalid of [
  "admin",
  "niki",
  "a..b",
  "-alice",
  "alice.",
  "ALICE",
  "a b",
  "a+b",
  "",
  "a".repeat(65),
])
  check(
    await denied("select email_service_reserve($1,$2)", [aliceLogin, invalid]),
    `invalid or reserved username blocked: ${invalid || "(empty)"}`,
  );
const reserve = async (uid, local) =>
  (await db.query("select email_service_reserve($1,$2) r", [uid, local]))
    .rows[0].r;
const races = await Promise.allSettled([
  reserve(aliceLogin, "alice"),
  reserve(aliceOtherLogin, "alice.second"),
]);
check(
  races.filter((r) => r.status === "fulfilled").length === 1,
  "concurrent linked-account reservations yield one worker",
);
const first = races.find((r) => r.status === "fulfilled").value;
check(
  first.member_id === alice,
  "mailbox belongs to canonical member, not login id",
);
check(
  await denied("select email_service_reserve($1,'alice.second')", [
    aliceOtherLogin,
  ]),
  "second linked login cannot reserve a second mailbox",
);
check(
  await denied("select email_service_reserve($1,'alice')", [bobLogin]),
  "other member cannot reserve same address",
);
await as(aliceLogin);
check(
  (await db.query("select email_address,status from iobs_mailboxes")).rows[0]
    .email_address === "alice@iobs.cc",
  "owner can view mailbox info",
);
check(
  await denied("select lease_token from iobs_mailboxes"),
  "browser cannot read worker tokens",
);
check(
  await denied("update iobs_mailboxes set status='active' where member_id=$1", [
    alice,
  ]),
  "owner cannot forge mailbox state",
);
await as(bobLogin);
check(
  (await db.query("select email_address from iobs_mailboxes")).rows.length ===
    0,
  "other member cannot read mailbox",
);
await as(null, "anon");
check(
  await denied("select email_address from iobs_mailboxes"),
  "anonymous cannot read mailbox",
);
await as(null, "service_role");
check(
  await denied("select email_service_mark_creating($1,$2)", [first.id, ids[0]]),
  "stale or forged fencing token cannot start creation",
);
await db.query("select email_service_mark_creating($1,$2)", [
  first.id,
  first.lease_token,
]);
await db.query("select email_service_finish($1,$2,'needs_review')", [
  first.id,
  first.lease_token,
]);
check(
  await denied("select email_service_reserve($1,'alice.retry')", [aliceLogin]),
  "ambiguous provider result cannot trigger another creation",
);
const locked = (await db.query("select email_service_lock($1) r", [first.id]))
  .rows[0].r;
await db.query("select email_service_finish($1,$2,'active')", [
  locked.id,
  locked.lease_token,
]);
await as(adminLogin);
await db.query("select email_admin_set_eligibility($1,false)", [alice]);
check(
  (
    await db.query("select status from iobs_mailboxes where member_id=$1", [
      alice,
    ])
  ).rows[0].status === "active",
  "revoking eligibility preserves active mailbox",
);
await as(aliceOtherLogin);
check(
  (await db.query("select email_address from iobs_mailboxes")).rows.length ===
    1,
  "other linked login sees same mailbox after revocation",
);
await as(null, "service_role");
check(
  await denied("select email_service_reserve($1,'another')", [aliceOtherLogin]),
  "existing member cannot create additional mailbox",
);
const linked = await db.query(
  "select email_service_link($1,'niki@iobs.cc','niki','active') id",
  [bob],
);
check(
  !!linked.rows[0].id,
  "service can explicitly link existing reserved-name mailbox",
);
check(
  await denied(
    "select email_service_link($1,'second@iobs.cc','second','active')",
    [bob],
  ),
  "linking cannot give member a second mailbox",
);
check(
  await denied("select email_service_link($1,'niki@iobs.cc','niki','active')", [
    admin,
  ]),
  "same existing mailbox cannot be linked twice",
);
await as(adminLogin);
check(
  await denied("update team_people set merged_into=$1 where id=$2", [
    bob,
    alice,
  ]),
  "member merge cannot silently transfer existing mailboxes",
);
await as(null, "service_role");
for (let i = 0; i < 5; i++)
  await db.query("select email_service_rate_limit($1,'password',5)", [alice]);
check(
  (
    await db.query("select email_service_rate_limit($1,'password',5) allowed", [
      alice,
    ])
  ).rows[0].allowed === false,
  "password changes are durably rate limited",
);
const columns = (
  await db.query(
    "select column_name from information_schema.columns where table_schema='public' and table_name in ('iobs_mailboxes','member_email_permissions','member_email_rate_limits')",
  )
).rows;
check(
  columns.every((c) => !c.column_name.includes("password")),
  "no mailbox password column exists",
);
await as(adminLogin);
await db.query("select email_admin_set_eligibility($1,true)", [admin]);
await as(null, "service_role");
const before = await reserve(adminLogin, "admin.name");
await as(adminLogin);
await db.query("select email_admin_set_eligibility($1,false)", [admin]);
await as(null, "service_role");
check(
  await denied("select email_service_mark_creating($1,$2)", [
    before.id,
    before.lease_token,
  ]),
  "revocation before provider mutation prevents creation",
);
await db.query("select email_service_finish($1,$2,'retryable')", [
  before.id,
  before.lease_token,
]);
check(
  (await db.query("select status from iobs_mailboxes where id=$1", [before.id]))
    .rows[0].status === "retryable",
  "pre-provider failures are safely retryable",
);
await db.close();
console.log(`${count} email database checks passed`);

import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
await db.exec(read("./fixtures/chapters-base.sql"));
await db.exec(read("../docs/chapters-supabase-release.sql"));
let count = 0;
const check = (v, message) => {
  assert.ok(v, message);
  count++;
  console.log("PASS", message);
};
async function denied(sql) {
  try {
    await db.exec(sql);
    return false;
  } catch {
    return true;
  }
}
const ids = [
  "00000000-0000-4000-8000-000000000001",
  "00000000-0000-4000-8000-000000000002",
  "00000000-0000-4000-8000-000000000003",
];
// Fixtures are inserted as database owner; profile access trigger still runs.
await db.exec(
  "alter table profiles disable trigger protect_profile_access_fields",
);
for (let i = 0; i < ids.length; i++)
  await db.query("insert into team_people(id,full_name) values($1,$2)", [
    ids[i],
    ["Admin", "Head A", "Head B"][i],
  ]);
for (let i = 0; i < ids.length; i++) {
  await db.query(
    "insert into profiles(id,member_id,full_name,profile_name,role) values($1,$1,$2,$2,$3)",
    [ids[i], ["Admin", "Head A", "Head B"][i], i === 0 ? "admin" : "user"],
  );
  await db.query("insert into auth.users values($1,$2,now())", [
    ids[i],
    `user${i}@example.com`,
  ]);
}
await db.exec(
  "alter table profiles enable trigger protect_profile_access_fields",
);
const { rows: chapters } = await db.query(
  "select * from chapters order by city",
);
check(
  chapters.length === 5 && chapters.every((c) => c.status === "draft"),
  "five initial draft chapters",
);
const a = chapters[0].id,
  b = chapters[1].id;
await db.query("update chapters set head_member_id=$1 where id=$2", [
  ids[1],
  a,
]);
await db.query("update chapters set head_member_id=$1 where id=$2", [
  ids[2],
  b,
]);
async function as(uid, role = "authenticated") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    uid || "",
  ]);
  await db.exec(`set role ${role}`);
}
async function event(cid, slug, price = 0) {
  return (
    await db.query(
      "insert into events(title,slug,start_date,category,chapter_id,ticket_price_cents,status) values('Test',$1,current_date+10,'chapter_event',$2,$3,'scheduled') returning id",
      [slug, cid, price],
    )
  ).rows[0].id;
}
await as(ids[1]);
const ea = await event(a, "a", 1500);
check(
  await denied(
    `insert into events(title,slug,start_date,category,chapter_id) values('No','no',current_date,'chapter_event','${b}')`,
  ),
  "head cannot create another chapter event",
);
check(
  await denied(
    "insert into events(title,slug,start_date,category) values('No','tour',current_date,'tour')",
  ),
  "head cannot create global tour",
);
check(
  await denied(`update events set chapter_id='${b}' where id='${ea}'`),
  "head cannot move event to another chapter",
);
check(
  await denied(`update profiles set role='admin' where id='${ids[1]}'`),
  "head cannot promote global role",
);
check(
  await denied(`update profiles set is_event_master=true where id='${ids[1]}'`),
  "head cannot grant legacy event-master access",
);
check(
  await denied(
    `update profiles set member_id='${ids[2]}' where id='${ids[1]}'`,
  ),
  "head cannot impersonate another member",
);
await db.query("select chapter_update_details($1,$2)", [
  a,
  { headline: "Hello", head_member_id: ids[2], status: "active" },
]);
check(
  (
    await db.query(
      "select head_member_id,status,headline from chapters where id=$1",
      [a],
    )
  ).rows[0].head_member_id === ids[1],
  "detail RPC ignores ownership and status fields",
);
check(
  await denied(`select chapter_update_details('${b}','{}')`),
  "head cannot edit another chapter via RPC",
);
check(
  (
    await db.query(
      `update chapters set head_member_id='${ids[2]}' where id='${a}' returning id`,
    )
  ).rows.length === 0,
  "direct chapter ownership update changes no rows",
);
await db.query(
  "insert into chapter_members(chapter_id,member_id) values($1,$2)",
  [a, ids[1]],
);
check(
  await denied(
    `insert into chapter_members(chapter_id,member_id) values('${b}','${ids[1]}')`,
  ),
  "head cannot change another membership list",
);
await as(ids[2]);
const eb = await event(b, "b");
check(
  (await db.query("select * from events where id=$1", [ea])).rows.length === 0,
  "other head cannot see event in draft chapter",
);
check(
  (
    await db.query("update events set title=$1 where id=$2 returning id", [
      "Hacked",
      ea,
    ])
  ).rows.length === 0,
  "other head cannot update private event",
);
await as(ids[0]);
await db.exec(
  `update chapters set status='active' where id in ('${a}','${b}')`,
);
await as(null, "anon");
check(
  (await db.query("select * from chapters")).rows.length === 2,
  "anonymous reads only active chapters",
);
check(
  await denied(
    `select prepare_event_registration('${ea}','Guest','guest@example.com',null)`,
  ),
  "anonymous cannot call service registration RPC",
);
check(
  await denied(
    `insert into event_registrations(event_id,attendee_name,attendee_email,payment_status) values('${ea}','Fake','fake@example.com','paid')`,
  ),
  "browser cannot forge paid registration",
);
await as(null, "service_role");
for (let i = 0; i < 15; i++)
  await db.query("select event_registration_allow_request('fixture')");
check(
  (await db.query("select event_registration_allow_request('fixture') allowed"))
    .rows[0].allowed === false,
  "service rate limiter rejects excess requests",
);
const paid = (
  await db.query(
    "select prepare_event_registration($1,'Guest','guest@example.com',null) r",
    [ea],
  )
).rows[0].r;
check(
  paid.amount_cents === 1500 &&
    paid.payment_status === "pending" &&
    paid.member_id === null,
  "paid registration uses database price and starts pending",
);
const again = (
  await db.query(
    "select prepare_event_registration($1,'Guest','GUEST@example.com',null) r",
    [ea],
  )
).rows[0].r;
check(again.id === paid.id, "case-insensitive retry is idempotent");
const free = (
  await db.query(
    "select prepare_event_registration($1,'Head B','user2@example.com',$2) r",
    [eb, ids[2]],
  )
).rows[0].r;
check(
  free.payment_status === "free" && free.member_id === ids[2],
  "free registration bypasses payment and links verified account",
);
await as(ids[1]);
check(
  (await db.query("select * from event_registrations")).rows.every(
    (r) => r.event_id === ea,
  ),
  "head reads only own attendee list",
);
check(
  await denied(
    `insert into storage.objects(bucket_id,name) values('event-media','chapters/${b}/hack.jpg')`,
  ),
  "broad legacy storage policy cannot allow cross-chapter upload",
);
await db.exec(
  `insert into storage.objects(bucket_id,name) values('event-media','chapters/${a}/good.jpg')`,
);
check(true, "head uploads image to own chapter");
await as(null, "anon");
check(
  await denied(
    "insert into storage.objects(bucket_id,name) values('event-media','hack.jpg')",
  ),
  "anonymous cannot use old event-media test policy",
);
await as(ids[0]);
check(
  (await db.query("select * from event_registrations")).rows.length === 2,
  "admin reads all registrations",
);
check(
  await denied(
    "insert into events(title,slug,start_date,category) values('No','missing',current_date,'chapter_event')",
  ),
  "chapter event always requires a chapter",
);
await db.close();
console.log(`${count} database security checks passed`);

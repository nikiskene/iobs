import { test, expect } from "@playwright/test";
const uid = "00000000-0000-4000-8000-000000000001",
  mid = "00000000-0000-4000-8000-000000000002";
const member = {
  id: mid,
  full_name: "Example Member",
  category: "team",
  status: "draft",
  description: "",
  title: "",
  photo_url: "",
  linkedin_url: "",
  substack_url: "",
  location: "Vienna",
  directory_public: false,
  primary_profile_id: uid,
  sort_order: 0,
  updated_at: "2026-10-21",
  accounts: [
    {
      id: uid,
      email: "member@example.com",
      profile_name: "example",
      role: "user",
      is_active: true,
      is_team_member: false,
    },
  ],
};
const existing = {
  id: "00000000-0000-4000-8000-000000000003",
  member_id: mid,
  email_address: "example.member@iobs.cc",
  migadu_mailbox_identifier: "example.member",
  status: "active",
  created_at: "2026-10-21",
  updated_at: "2026-10-21",
};
async function mock(
  page,
  { allowed = true, mailbox = null, admin = false, reauth = false } = {},
) {
  let current = mailbox,
    enabled = allowed;
  const actions = [];
  await page.addInitScript(
    ({ uid }) =>
      localStorage.setItem(
        "sb-bunfdlazirfheomhvjdz-auth-token",
        JSON.stringify({
          access_token:
            "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEifQ.fixture",
          refresh_token: "fixture",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: {
            id: uid,
            email: "member@example.com",
            aud: "authenticated",
            role: "authenticated",
          },
        }),
      ),
    { uid },
  );
  await page.route("**/*.supabase.co/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url());
    let data = [];
    let status = 200;
    if (url.pathname.includes("/functions/v1/iobs-email")) {
      const body = req.postDataJSON();
      actions.push(body);
      if (reauth) {
        data = {
          code: "reauthenticate",
          error: "Please sign in to IOBS again to continue securely.",
        };
        status = 401;
      } else if (body.action === "availability") data = { available: true };
      else if (body.action === "create") {
        current = { ...existing, email_address: `${body.username}@iobs.cc` };
        data = { created: true };
      } else if (body.action === "password") data = { changed: true };
      else if (body.action === "link") {
        current = {
          ...existing,
          email_address: "niki@iobs.cc",
          linked_existing: true,
        };
        data = { linked: true };
      } else data = { ready: true, status: "active" };
    } else if (url.pathname.includes("/auth/v1/user"))
      data = { id: uid, email: "member@example.com" };
    else if (url.pathname.includes("/profiles"))
      data = {
        id: uid,
        member_id: mid,
        full_name: "Example Member",
        is_active: true,
        role: admin ? "admin" : "user",
      };
    else if (url.pathname.includes("/rpc/admin_list_members")) data = [member];
    else if (url.pathname.includes("/rpc/email_admin_set_eligibility")) {
      enabled = req.postDataJSON().allowed;
      data = null;
    } else if (url.pathname.includes("/member_email_permissions"))
      data = { email_creation_allowed: enabled };
    else if (url.pathname.includes("/iobs_mailboxes")) data = current;
    else if (url.pathname.includes("/rpc/my_managed_chapters")) data = [];
    else if (url.pathname.includes("/site_settings")) data = { logo_url: null };
    else if (url.pathname.includes("/nomination_settings"))
      data = { id: true, mode: "acknowledgement" };
    else if (url.pathname.includes("/storage/")) return route.abort();
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  return actions;
}
async function fits(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}
for (const width of [320, 390, 768, 1440]) {
  test(`member creates mailbox on ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    const actions = await mock(page);
    await page.goto("/dashboard/settings");
    await page.getByRole("link", { name: /IOBS Email/ }).click();
    await page
      .getByLabel("Choose your preferred email address")
      .fill("Example.Member");
    await page.getByRole("button", { name: "Check availability" }).click();
    await expect(page.getByText("This address is available.")).toBeVisible();
    await page
      .getByLabel("Choose a mailbox password", { exact: true })
      .fill("Fixture-only-secret-1234");
    await page
      .getByLabel("Confirm mailbox password", { exact: true })
      .fill("Fixture-only-secret-1234");
    await fits(page);
    await page.getByRole("button", { name: "Create My Email Account" }).click();
    await expect(
      page.locator("p").filter({ hasText: /^example\.member@iobs\.cc$/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open Webmail" }),
    ).toHaveAttribute("href", "https://webmail.migadu.com/");
    await expect(
      page.getByRole("button", { name: "Create My Email Account" }),
    ).toHaveCount(0);
    expect(actions.filter((a) => a.action === "create")).toHaveLength(1);
    await page
      .getByText("Set Up Email on Your Device", { exact: true })
      .click();
    await expect(
      page.getByText("imap.migadu.com", { exact: true }),
    ).toBeVisible();
    await fits(page);
  });
  test(`admin eligibility and existing link on ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 850 });
    const actions = await mock(page, { admin: true, allowed: false });
    await page.goto("/admin/members/team");
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Login & workspace access" }),
    ).toBeVisible();
    const toggle = page.getByRole("checkbox", {
      name: "Allow this member to create an @iobs.cc email account",
    });
    await toggle.check();
    await expect(toggle).toBeChecked();
    await page
      .getByText("Link an existing Migadu mailbox", { exact: true })
      .click();
    await page.getByLabel("Existing @iobs.cc address").fill("niki@iobs.cc");
    await page
      .getByRole("checkbox", {
        name: "I have verified that this mailbox belongs to this member.",
      })
      .check();
    await page
      .getByRole("button", { name: "Link existing mailbox", exact: true })
      .click();
    await expect(page.getByText("niki@iobs.cc", { exact: true })).toBeVisible();
    expect(actions.filter((a) => a.action === "link")).toHaveLength(1);
    expect(
      actions.filter((a) => a.action === "create" || a.action === "password"),
    ).toHaveLength(0);
    await toggle.uncheck();
    await expect(page.getByText("niki@iobs.cc", { exact: true })).toBeVisible();
    await fits(page);
    await page.screenshot({
      path: `/tmp/iobs-email-admin-${width}.png`,
      fullPage: true,
    });
  });
}
test("unauthorized member sees no create interface", async ({ page }) => {
  await mock(page, { allowed: false });
  await page.goto("/dashboard/settings/email");
  await expect(
    page.getByText(
      "An IOBS email account has not been enabled for your membership.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create My Email Account" }),
  ).toHaveCount(0);
});
test("existing mailbox supports password change after eligibility is revoked", async ({
  page,
}) => {
  const actions = await mock(page, { allowed: false, mailbox: existing });
  await page.goto("/dashboard/settings/email");
  await page.getByRole("button", { name: "Change Email Password" }).click();
  await page
    .getByLabel("New mailbox password", { exact: true })
    .fill("Fixture-only-secret-1234");
  await page
    .getByLabel("Confirm mailbox password", { exact: true })
    .fill("Fixture-only-secret-1234");
  await page.getByRole("button", { name: "Show new mailbox password" }).click();
  await expect(
    page.getByLabel("New mailbox password", { exact: true }),
  ).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Save Email Password" }).click();
  await expect(
    page.getByText("Your mailbox password has been changed."),
  ).toBeVisible();
  expect(actions.filter((a) => a.action === "password")).toHaveLength(1);
});
test("sensitive action asks for fresh website sign-in", async ({ page }) => {
  await mock(page, { mailbox: existing, reauth: true });
  await page.goto("/dashboard/settings/email");
  await page.getByRole("button", { name: "Change Email Password" }).click();
  await page
    .getByLabel("New mailbox password", { exact: true })
    .fill("Fixture-only-secret-1234");
  await page
    .getByLabel("Confirm mailbox password", { exact: true })
    .fill("Fixture-only-secret-1234");
  await page.getByRole("button", { name: "Save Email Password" }).click();
  await expect(
    page.getByRole("heading", { name: "Confirm your IOBS sign-in" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("IOBS website password", { exact: true }),
  ).toHaveAttribute("type", "password");
});

import { test, expect } from "@playwright/test";
const uid = "00000000-0000-4000-8000-000000000001";
const chapter = {
  id: "00000000-0000-4000-8000-000000000002",
  name: "Vienna",
  city: "Vienna",
  country: "Austria",
  continent: "Europe",
  latitude: 48.2082,
  longitude: 16.3738,
  email: "vienna@iobs.cc",
  headline: "Beautiful success in Vienna",
  description: "Vienna after dusk. Ideas linger over coffee, and conversations find their own rhythm.",
  hero_image_url: "",
  head_member_id: uid,
  status: "active",
};
const event = {
  id: "00000000-0000-4000-8000-000000000003",
  title: "Vienna gathering",
  slug: "vienna-gathering",
  status: "scheduled",
  start_date: "2027-01-20",
  end_date: null,
  is_active: true,
  category: "chapter_event",
  chapter_id: chapter.id,
  ticket_price_cents: 0,
  ticket_currency: "EUR",
};
async function mock(page, role, calls = []) {
  if (role)
    await page.addInitScript(
      ({ uid, role }) =>
        localStorage.setItem(
          "sb-bunfdlazirfheomhvjdz-auth-token",
          JSON.stringify({
            access_token:
              "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEifQ.fixture",
            refresh_token: "fixture",
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: {
              id: uid,
              email: "head@example.com",
              aud: "authenticated",
              role: "authenticated",
            },
          }),
        ),
      { uid, role },
    );
  await page.route("**/*.supabase.co/**", async (route) => {
    const req = route.request(),
      u = new URL(req.url());
    calls.push({
      path: u.pathname,
      method: req.method(),
      body: req.postData(),
    });
    if (u.pathname.includes("/storage/v1/object/")) {
      if (req.method() === "POST")
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ Key: u.pathname, Id: "fixture" }),
        });
      return route.fulfill({
        status: 200,
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          "base64",
        ),
      });
    }
    let data = [];
    if (u.pathname.includes("/team_people"))
      data = [
        {
          id: "founder",
          full_name: "Founder",
          category: "founders",
          status: "published",
          photo_url: "",
          description: "",
        },
        {
          id: "unassigned-chapter-member",
          full_name: "Chapter member without head assignment",
          category: "chapters",
          status: "published",
          photo_url: "",
          description: "",
        },
        {
          id: "advisor",
          full_name: "Advisor",
          category: "advisory_board",
          status: "published",
          photo_url: "",
          description: "",
        },
      ];
    else if (u.pathname.includes("/auth/v1/user"))
      data = { id: uid, email: "head@example.com" };
    else if (u.pathname.includes("/profiles"))
      data = {
        id: uid,
        full_name: "Chapter Head",
        role: role || "user",
        is_active: true,
        member_id: uid,
      };
    else if (u.pathname.includes("/rpc/my_managed_chapters")) data = [chapter];
    else if (u.pathname.includes("/rpc/admin_list_members"))
      data = [
        { id: uid, full_name: "Chapter Head", accounts: [{ is_active: true }] },
      ];
    else if (u.pathname.includes("/rpc/public_chapter_heads"))
      data = [
        {
          chapter_id: chapter.id,
          member_id: uid,
          full_name: "Chapter Head",
          title: "Vienna",
          description: "Local community",
          photo_url: "https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/team-photos/head.png",
          linkedin_url: "",
          substack_url: "",
        },
      ];
    else if (u.pathname.includes("/rpc/chapter_member_options"))
      data = [{ id: uid, full_name: "Chapter Head" }];
    else if (u.pathname.includes("/event_registrations"))
      data = [
        {
          id: uid,
          attendee_name: "Guest",
          attendee_email: "guest@example.com",
          payment_status: "free",
          created_at: "2026-10-21",
          amount_cents: 0,
          currency: "EUR",
        },
      ];
    else if (u.pathname.includes("/chapters")) data = [chapter];
    else if (u.pathname.includes("/events"))
      data = u.searchParams.has("slug") ? event : [event];
    else if (u.pathname.includes("/functions/v1/event-checkout"))
      data = { registered: true };
    else if (u.pathname.includes("/site_settings")) data = { logo_url: null };
    else if (u.pathname.includes("/nomination_settings"))
      data = { id: true, mode: "acknowledgement" };
    else if (u.pathname.includes("/storage/")) return route.abort();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
}
async function fits(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}
for (const width of [320, 390, 768, 1440]) {
  test(`public chapters and registration fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mock(page);
    await page.goto("/chapters");
    await expect(
      page.getByRole("heading", { name: "Vienna", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Chapter Head · Chapter Head")).toBeVisible();
    await expect(page.getByText(chapter.description, { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "Chapter Head", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Email the Vienna chapter" })).toHaveAttribute("href", "mailto:vienna%40iobs.cc");
    await fits(page);
    await page.getByRole("link", { name: /Vienna gathering/ }).click();
    await page.getByPlaceholder("Your Name").fill("Guest");
    await page.getByPlaceholder("Your Email").fill("guest@example.com");
    await page.getByRole("button", { name: "Register for free" }).click();
    await expect(
      page.getByText("Your registration has been received."),
    ).toBeVisible();
    await fits(page);
  });
  test(`chapter head workspace fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mock(page, "user");
    await page.goto("/chapter-office");
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(page.getByLabel("Chapter name")).toBeDisabled();
    await expect(page.getByText("Associated members")).toBeVisible();
    await fits(page);
    await page.getByRole("button", { name: "Events", exact: true }).click();
    await page.getByRole("button", { name: /Edit Vienna gathering/ }).click();
    await expect(page.getByText("Attendees (1)")).toBeVisible();
    await fits(page);
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    expect((await download).suggestedFilename()).toContain("attendees.csv");
    await page.screenshot({
      path: `/tmp/iobs-chapters-qa/head-${width}.png`,
      fullPage: true,
    });
  });
}
test("public team places Chapter Heads between Founders and Advisors", async ({
  page,
}) => {
  await mock(page);
  await page.goto("/team");
  await expect(
    page.getByRole("heading", { name: "Chapter", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Chapter Head", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chapter member without head assignment" })).toHaveCount(0);
  const headings = await page.locator("h2").allTextContents();
  expect(headings.indexOf("Chapter")).toBeGreaterThan(
    headings.indexOf("Founders"),
  );
  expect(headings.indexOf("Chapter")).toBeLessThan(
    headings.indexOf("Advisors"),
  );
});

for (const width of [320, 390, 1440]) {
  test(`chapter head uploads and saves image at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const calls = [];
    await mock(page, "user", calls);
    await page.goto("/chapter-office");
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await page
      .getByLabel("Upload chapter image", { exact: true })
      .setInputFiles({
        name: "chapter.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          "base64",
        ),
      });
    await expect(
      page.getByRole("img", { name: "Chapter image preview" }),
    ).toBeVisible();
    await fits(page);
    await page
      .getByRole("button", { name: "Save chapter", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Edit", exact: true }),
    ).toBeVisible();
    const upload = calls.find(
      (c) => c.method === "POST" && c.path.includes("/storage/v1/object/"),
    );
    expect(upload.path).toContain(`/event-media/chapters/${chapter.id}/hero/`);
    const save = calls.find((c) => c.path.endsWith("/chapter_update_details"));
    expect(JSON.parse(save.body).details.hero_image_url).toContain(
      `/storage/v1/object/public/event-media/chapters/${chapter.id}/hero/`,
    );
  });
}
test("invalid image is rejected without storage upload", async ({ page }) => {
  const calls = [];
  await mock(page, "user", calls);
  await page.goto("/chapter-office");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .getByLabel("Upload chapter image", { exact: true })
    .setInputFiles({
      name: "bad.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg/>"),
    });
  await expect(page.getByRole("alert")).toContainText(
    "Choose a JPG, PNG or WebP",
  );
  expect(
    calls.some(
      (c) => c.method === "POST" && c.path.includes("/storage/v1/object/"),
    ),
  ).toBe(false);
});

for (const width of [320, 390, 768, 1440]) {
  test(`homepage shows chapter description, head photo and email on ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mock(page);
    await page.goto("/");
    const section = page.getByRole("region", { name: "A shared spirit. A local soul." });
    await expect(section.getByText(chapter.description, { exact: true })).toBeVisible();
    await section.scrollIntoViewIfNeeded();
    const portrait = section.getByRole("img", { name: "Chapter Head", exact: true });
    await expect(portrait).toBeVisible();
    await expect(portrait).toHaveAttribute("width", "48");
    await expect(section.getByRole("link", { name: "Email the Vienna chapter" })).toHaveAttribute("href", "mailto:vienna%40iobs.cc");
    await fits(page);
    await page.screenshot({ path: `/tmp/iobs-chapter-home-${width}.png` });
    await section.getByRole("link", { name: "Vienna", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/chapters#chapter-${chapter.id}$`));
    await expect(page.getByRole("heading", { name: "Vienna", exact: true })).toBeVisible();
  });
}
for (const role of ["admin", "user"]) {
  test(`${role} can save a chapter description`, async ({ page }) => {
    const calls = [];
    await mock(page, role, calls);
    await page.goto(role === "admin" ? "/admin/members/chapters" : "/chapter-office");
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await page.getByLabel("Chapter description", { exact: true }).fill("A city of late conversations and unexpected possibilities.");
    await page.getByRole("button", { name: "Save chapter", exact: true }).click();
    await expect.poll(() => calls.some(c => {
      if (!c.body) return false;
      const body = JSON.parse(c.body);
      return (body.details?.description || body.description) === "A city of late conversations and unexpected possibilities.";
    })).toBe(true);
    const saved = calls.find(c => c.body && (JSON.parse(c.body).details?.description || JSON.parse(c.body).description) === "A city of late conversations and unexpected possibilities.");
    expect(saved.path).toContain(role === "admin" ? "/rest/v1/chapters" : "/rpc/chapter_update_details");
  });
}

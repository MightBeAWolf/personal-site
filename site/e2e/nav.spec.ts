import { test, expect } from "@playwright/test";

// Structure and behavior only - never the marketing copy, which is still
// being actively rewritten. See the plan / CLAUDE.md note on this suite.

const routes: { path: string; navLabel: string }[] = [
  { path: "/", navLabel: "Home" },
  { path: "/resume", navLabel: "Résumé" },
  { path: "/tech-stack", navLabel: "Tech Stack" },
  { path: "/blog", navLabel: "Blog" },
];

for (const { path, navLabel } of routes) {
  test(`${path} loads and marks "${navLabel}" active in the nav`, async ({
    page,
  }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/.+/);

    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(
      nav.getByRole("link", { name: navLabel, exact: true }),
    ).toHaveAttribute("aria-current", "page");

    // every other primary nav link should NOT be marked current
    const others = routes.filter((r) => r.navLabel !== navLabel);
    for (const other of others) {
      await expect(
        nav.getByRole("link", { name: other.navLabel, exact: true }),
      ).not.toHaveAttribute("aria-current", "page");
    }
  });
}

test("unknown route renders the custom 404 with a working link home", async ({
  page,
}) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const home = page.locator('main a[href="/"]');
  await expect(home).toBeVisible();
  await home.click();
  await expect(page).toHaveURL("/");
});

test("skip link jumps to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute("href", "#main");
});

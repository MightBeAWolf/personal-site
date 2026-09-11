import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("hero CTAs link to the résumé and an email", async ({ page }) => {
  const ctas = page.locator(".hero__actions a");
  await expect(ctas).toHaveCount(3);
  await expect(ctas.nth(0)).toHaveAttribute("href", /^mailto:/);
  await expect(ctas.nth(1)).toHaveAttribute("href", "/resume");
  await expect(ctas.nth(2)).toHaveAttribute("href", "/tech-stack");
});

test("every focus card has a non-empty heading", async ({ page }) => {
  const cards = page.locator(".card");
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(cards.nth(i).locator(".card__title")).not.toBeEmpty();
  }
});

test('"Elsewhere" list links to the résumé, tech-stack page, and external profiles', async ({
  page,
}) => {
  const hrefs = await page
    .locator(".link-row")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")));

  expect(hrefs).toContain("/resume");
  expect(hrefs).toContain("/tech-stack");
  expect(hrefs.some((h) => h?.includes("github.com"))).toBe(true);
  expect(hrefs.some((h) => h?.includes("linkedin.com"))).toBe(true);
  expect(hrefs.some((h) => h?.startsWith("mailto:"))).toBe(true);
});

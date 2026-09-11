import { test, expect } from "@playwright/test";

test("renders the expected sections", async ({ page }) => {
  await page.goto("/resume");
  const headings = await page.getByRole("heading", { level: 2 }).allTextContents();
  for (const expected of [
    "Summary",
    "Skills",
    "Experience",
    "Education",
    "Certifications",
  ]) {
    expect(headings.some((h) => h.includes(expected))).toBe(true);
  }
});

test("back-to-home link returns to the homepage", async ({ page }) => {
  await page.goto("/resume");
  await page.locator(".prose-page__back").click();
  await expect(page).toHaveURL("/");
});

test("print stylesheet hides the site header and footer", async ({ page }) => {
  await page.goto("/resume");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toHaveCSS("display", "none");
  await expect(page.locator(".site-footer")).toHaveCSS("display", "none");
});

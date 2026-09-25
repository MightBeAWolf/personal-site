import { test, expect } from "@playwright/test";

test.describe("Blog directory", () => {
  test("/blog lists posts linking to their own pages", async ({ page }) => {
    const response = await page.goto("/blog");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible();

    const link = page.locator('a[href="/blog/system-1-ai/"]');
    await expect(link).toBeVisible();
  });
});

test.describe("Blog post pages", () => {
  test("/blog/system-1-ai loads directly with real content", async ({ page }) => {
    const response = await page.goto("/blog/system-1-ai");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: "System 1 AI" }),
    ).toBeVisible();
    await expect(page.locator(".glossary-body")).not.toBeEmpty();
  });

  test("back link returns to the blog directory", async ({ page }) => {
    await page.goto("/blog/system-1-ai");
    await page.locator(".page-back").click();
    await expect(page).toHaveURL("/blog/");
  });
});

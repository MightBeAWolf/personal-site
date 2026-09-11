import { test, expect } from "@playwright/test";

test("renders the expected sections", async ({ page }) => {
  await page.goto("/tech-stack");
  const headings = await page.getByRole("heading", { level: 2 }).allTextContents();
  for (const expected of ["Tools", "Workflows", "Tech stack", "Colophon"]) {
    expect(headings.some((h) => h.includes(expected))).toBe(true);
  }
});

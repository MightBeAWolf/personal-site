import { test, expect } from "@playwright/test";
import { openThemePicker } from "./helpers";

const pages = ["/", "/resume", "/tech-stack"];

test.describe("no horizontal overflow at mobile width", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const path of pages) {
    test(path, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1); // allow 1px rounding
    });
  }
});

test("header nav wraps instead of overflowing at narrow widths", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const box = await page.locator(".site-nav").boundingBox();
  expect(box?.width ?? 0).toBeLessThanOrEqual(360);
});

test("theme picker panel becomes a fixed bottom sheet at narrow widths", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const { panel } = await openThemePicker(page);
  await expect(panel).toHaveCSS("position", "fixed");
});

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

test("tech-stack column layout collapses to a single stacked flow at narrow widths", async ({
  page,
}) => {
  // Regression coverage for a real bug: .tri-item/.accordion-item keep an
  // explicit grid-column at every width, which forces the browser to
  // implicitly generate extra column tracks to satisfy it regardless of
  // .tri-grid's own grid-template-columns - silently recreating the
  // desktop 3-column layout (and overflowing the viewport) even though
  // the "mobile" override looked like it collapsed things to one column.
  // Asserting display: flex here (not just checking for no overflow)
  // catches that specific regression directly.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/tech-stack");

  const grid = page.locator(".tri-grid").first();
  await expect(grid).toHaveCSS("display", "flex");

  // The sticky column-1 label needs to both stay sticky and stay opaque
  // at this width - it's pinned directly over the stacked content instead
  // of sitting beside it in its own column, so a transparent background
  // lets both texts show through at once.
  const label = page.locator(".tri-label").first();
  await expect(label).toHaveCSS("position", "sticky");
  const background = await label.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  expect(background).not.toBe("rgba(0, 0, 0, 0)");
  expect(background).not.toBe("transparent");
});

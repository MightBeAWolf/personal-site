import { test, expect } from "@playwright/test";

test.describe("Glossary pages", () => {
  for (const slug of ["kubernetes", "k3s", "helix"]) {
    test(`/glossary/${slug} loads directly with real content`, async ({ page }) => {
      const response = await page.goto(`/glossary/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();
      const content = page.locator("#glossary-content");
      await expect(content).toBeVisible();
      expect((await content.innerText()).length).toBeGreaterThan(20);
    });
  }

  test("cross-referenced terms inside a dedicated page are themselves hoverable", async ({
    page,
  }) => {
    // Regression test: GlossaryPopup used to be rendered only on
    // /tech-stack, so a term page's own cross-reference triggers (e.g.
    // argo-cd.md mentions Kubernetes and K3s) showed the "?" cursor from
    // the global .glossary-term style but had no popup engine to respond
    // to a hover at all.
    await page.goto("/glossary/argo-cd");
    await expect(page.locator("#glossary-popup-root")).toBeAttached();

    const trigger = page.locator('[data-glossary-term="kubernetes"]').first();
    await trigger.hover();
    const popup = page.locator(".glossary-popup").first();
    await expect(popup).toBeVisible();
    await expect(popup.locator(".glossary-popup__body")).not.toBeEmpty();
  });
});

test.describe("Glossary popups on /tech-stack", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tech-stack");
  });

  test("hovering a term shows content immediately, with a progress bar that clears after a beat", async ({
    page,
  }) => {
    const trigger = page.locator('[data-glossary-term="kubernetes"]').first();
    await trigger.hover();

    const popup = page.locator(".glossary-popup").first();
    await expect(popup).toBeVisible();
    // content renders right away - it isn't gated behind the charge
    await expect(popup.locator(".glossary-popup__body")).not.toBeEmpty();
    await expect(popup.locator(".glossary-popup__progress")).toBeVisible();
    // once the charge completes, the bar goes away and the popup is
    // "armed" (interactable)
    await expect(popup.locator(".glossary-popup__progress")).toBeHidden({
      timeout: 2000,
    });
  });

  test("leaving the trigger before the charge completes closes the popup immediately", async ({
    page,
  }) => {
    const trigger = page.locator('[data-glossary-term="kubernetes"]').first();
    await trigger.hover();
    const popup = page.locator(".glossary-popup").first();
    await expect(popup.locator(".glossary-popup__progress")).toBeVisible();

    await page.getByRole("heading", { level: 1 }).hover();
    await expect(popup).toBeHidden();
  });

  test('"Open full page" links to the dedicated glossary page', async ({ page }) => {
    const trigger = page.locator('[data-glossary-term="helix"]').first();
    await trigger.hover();

    const popup = page.locator(".glossary-popup").first();
    await expect(popup.locator(".glossary-popup__body")).not.toBeEmpty();
    await expect(
      popup.getByRole("link", { name: /open full page/i }),
    ).toHaveAttribute("href", "/glossary/helix/");
  });

  test("a nested term inside an armed popup opens a second popup without closing the first", async ({
    page,
  }) => {
    const trigger = page.locator('[data-glossary-term="kubernetes"]').first();
    await trigger.hover();
    const popup = page.locator(".glossary-popup").first();
    await expect(popup.locator(".glossary-popup__body")).not.toBeEmpty();
    // must wait for the outer popup to arm before it's safe to move into it
    await expect(popup.locator(".glossary-popup__progress")).toBeHidden({
      timeout: 2000,
    });

    const nestedTrigger = popup.locator('[data-glossary-term="k3s"]');
    await expect(nestedTrigger).toBeVisible();
    await nestedTrigger.hover();

    const nestedPopup = page.locator(".glossary-popup").nth(1);
    await expect(nestedPopup).toBeVisible();
    await expect(nestedPopup.locator(".glossary-popup__body")).not.toBeEmpty();
    // the parent is still open - nesting doesn't close its ancestor
    await expect(popup).toBeVisible();
  });

  test("moving fully into an armed nested popup keeps the whole chain open", async ({
    page,
  }) => {
    // Regression test for a real bug: a nested popup's card is a DOM
    // sibling of its parent's card (both live flat under
    // #glossary-popup-root), not a descendant of it. Moving from the
    // nested trigger into the nested card genuinely leaves the parent
    // card's DOM boundary, which used to leave the parent's close
    // scheduled with nothing to cancel it - so entering the fully-armed
    // grandchild popup closed the whole chain a beat later.
    const trigger = page.locator('[data-glossary-term="k3s"]').first();
    await trigger.hover();
    const outer = page.locator(".glossary-popup").first();
    await expect(outer.locator(".glossary-popup__progress")).toBeHidden({
      timeout: 2000,
    });

    const nestedTrigger = outer.locator('[data-glossary-term="kubernetes"]');
    await expect(nestedTrigger).toBeVisible();
    await nestedTrigger.hover();
    const inner = page.locator(".glossary-popup").nth(1);
    await expect(inner.locator(".glossary-popup__body")).not.toBeEmpty();
    await expect(inner.locator(".glossary-popup__progress")).toBeHidden({
      timeout: 2000,
    });

    // Move fully into the inner popup - onto real content inside it, not
    // the bare `.glossary-popup` container. That container is `position:
    // fixed`, continuously repositioned by floating-ui's autoUpdate, and
    // just had its progress bar removed by arm(); hovering it directly
    // proved to be a flaky actionability target for Playwright (times out
    // resolving/stabilizing the locator) even though the popup itself is
    // fine - a concrete, static child is a more reliable target and no
    // less representative of a real cursor landing on actual content.
    await inner.locator(".glossary-popup__open").hover();

    // give any (incorrect) grace-period close a chance to fire before
    // asserting both are still open
    await page.waitForTimeout(400);
    await expect(inner).toBeVisible();
    await expect(outer).toBeVisible();
  });

  test("moving the mouse away closes the whole open chain", async ({ page }) => {
    const trigger = page.locator('[data-glossary-term="kubernetes"]').first();
    await trigger.hover();
    const popup = page.locator(".glossary-popup").first();
    await expect(popup.locator(".glossary-popup__progress")).toBeHidden({
      timeout: 2000,
    });

    const nestedTrigger = popup.locator('[data-glossary-term="k3s"]');
    await nestedTrigger.hover();
    const nestedPopup = page.locator(".glossary-popup").nth(1);
    await expect(nestedPopup).toBeVisible();

    await page.getByRole("heading", { level: 1 }).hover();
    await expect(nestedPopup).toBeHidden();
    await expect(popup).toBeHidden();
  });

  test("popup never overflows the viewport at a narrow width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const trigger = page.locator('[data-glossary-term="ansible"]').first();
    await trigger.hover();

    const popup = page.locator(".glossary-popup").first();
    await expect(popup.locator(".glossary-popup__body")).not.toBeEmpty();
    const box = await popup.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(375 + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(812 + 1);
    }
  });
});

import { test, expect } from "@playwright/test";
import { openThemePicker } from "./helpers";

test("trigger shows the default theme with nothing in storage", async ({
  page,
}) => {
  await page.goto("/");
  // colorScheme: "dark" (playwright.config.ts) means BaseLayout's no-flash
  // script never sets `data-theme` at all - the CSS :root default applies,
  // and the SSR label ("Horizon Dark") is left untouched.
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  await expect(page.locator("[data-tp-name]")).toHaveText("Horizon Dark");
});

test("opening the panel populates the list and focuses search", async ({
  page,
}) => {
  await page.goto("/");
  const { trigger, search, status } = await openThemePicker(page);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(search).toBeFocused();
  await expect(status).toHaveText(/^\d+ themes$/);
});

test("search narrows the list and updates the status count", async ({
  page,
}) => {
  await page.goto("/");
  const { root, search, status } = await openThemePicker(page);

  await search.fill("dracula");
  const visible = root.locator(".tp__opt:visible");
  // Don't assume "dracula" is a unique substring across the theme set (Helix
  // ships both "dracula" and "dracula_at_night") - assert the match is
  // correct and the count is self-consistent, not a hardcoded number.
  await expect(async () => {
    expect(await visible.count()).toBeGreaterThan(0);
  }).toPass();

  const ids = await visible.evaluateAll((els) =>
    els.map((el) => el.getAttribute("data-id") ?? ""),
  );
  expect(ids).toContain("dracula");
  for (const id of ids) {
    expect(id).toContain("dracula");
  }

  const total = await root.locator(".tp__opt").count();
  await expect(status).toHaveText(`${ids.length} of ${total}`);
});

test("Dark/Light filters narrow the list to matching themes", async ({
  page,
}) => {
  await page.goto("/");
  const { root } = await openThemePicker(page);

  await root.locator('[data-tp-filter="light"]').click();
  const visible = root.locator(".tp__opt:visible");
  await expect(async () => {
    expect(await visible.count()).toBeGreaterThan(0);
  }).toPass();
  const darkFlags = await visible.evaluateAll((els) =>
    els.map((el) => el.getAttribute("data-dark")),
  );
  expect(darkFlags.every((v) => v === "false")).toBe(true);
});

test("selecting a theme applies it, updates the trigger, and keeps the panel open", async ({
  page,
}) => {
  await page.goto("/");
  const { root, panel } = await openThemePicker(page);

  await root.locator('.tp__opt[data-id="dracula"]').click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dracula");
  await expect(root.locator("[data-tp-name]")).toHaveText("Dracula");
  await expect(panel).toBeVisible(); // stays open - explicit product requirement

  const stored = await page.evaluate(() => ({
    theme: localStorage.getItem("theme"),
    name: localStorage.getItem("theme:name"),
  }));
  expect(stored).toEqual({ theme: "dracula", name: "Dracula" });
});

test("theme selection persists across reload and navigation", async ({
  page,
}) => {
  await page.goto("/");
  const { root } = await openThemePicker(page);
  await root.locator('.tp__opt[data-id="dracula"]').click();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dracula");

  await page.goto("/resume");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dracula");
  await expect(page.locator("[data-tp-name]")).toHaveText("Dracula");
});

test("arrow keys live-cycle the applied theme without closing the panel", async ({
  page,
}) => {
  await page.goto("/");
  const { panel } = await openThemePicker(page);

  const before = await page.locator("html").getAttribute("data-theme");
  await page.keyboard.press("ArrowDown");
  await expect(async () => {
    const after = await page.locator("html").getAttribute("data-theme");
    expect(after).not.toBe(before);
  }).toPass();
  await expect(panel).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(panel).toBeHidden();
});

test("cycle buttons apply a theme and keep the panel open", async ({
  page,
}) => {
  await page.goto("/");
  const { root, panel } = await openThemePicker(page);

  const before = await page.locator("html").getAttribute("data-theme");
  await root.locator('[data-tp-cycle="1"]').click();
  const after = await page.locator("html").getAttribute("data-theme");
  expect(after).not.toBe(before);
  await expect(panel).toBeVisible();
});

test("Escape closes the panel", async ({ page }) => {
  await page.goto("/");
  const { panel } = await openThemePicker(page);
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
});

test("clicking the trigger again closes the panel", async ({ page }) => {
  await page.goto("/");
  const { trigger, panel } = await openThemePicker(page);
  await trigger.click();
  await expect(panel).toBeHidden();
});

test("clicking outside the widget closes the panel", async ({ page }) => {
  await page.goto("/");
  const { panel } = await openThemePicker(page);
  // The hero <h1> is always well outside the widget, unlike a fixed
  // coordinate - the mobile bottom sheet covers most of the lower viewport,
  // so a hardcoded point that's "outside" on desktop can land inside it here.
  await page.getByRole("heading", { level: 1 }).click({ position: { x: 5, y: 5 } });
  await expect(panel).toBeHidden();
});

test("auto-dismisses once the mouse has been away for 5s", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  const { panel } = await openThemePicker(page);

  const target = await page.getByRole("heading", { level: 1 }).boundingBox();
  await page.mouse.move((target?.x ?? 20) + 10, (target?.y ?? 20) + 10);
  await page.clock.fastForward(5100);
  await expect(panel).toBeHidden();
});

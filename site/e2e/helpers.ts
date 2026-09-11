import { expect, type Page } from "@playwright/test";

/**
 * Opens the theme picker and waits for its (lazily-fetched) option list to
 * finish loading. Every spec that interacts with the picker should route
 * through this instead of re-deriving the open sequence.
 */
export async function openThemePicker(page: Page) {
  const root = page.locator("[data-theme-picker]");
  await root.locator(".tp__trigger").click();
  const panel = root.locator("[data-tp-panel]");
  await expect(panel).toBeVisible();
  await expect(root.locator(".tp__opt").first()).toBeVisible();
  return {
    root,
    trigger: root.locator(".tp__trigger"),
    panel,
    search: root.locator("[data-tp-search]"),
    list: root.locator("[data-tp-list]"),
    status: root.locator("[data-tp-status]"),
  };
}

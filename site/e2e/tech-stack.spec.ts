import { test, expect } from "@playwright/test";

test("renders the expected sections", async ({ page }) => {
  await page.goto("/tech-stack");
  const headings = await page.getByRole("heading", { level: 2 }).allTextContents();
  for (const expected of ["Tools", "Workflows", "Tech stack", "Colophon"]) {
    expect(headings.some((h) => h.includes(expected))).toBe(true);
  }
});

test.describe("Tools / Workflows accordion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tech-stack");
  });

  test("a row's detail is collapsed until its summary is clicked", async ({ page }) => {
    const row = page.locator("details.accordion-item").first();
    await expect(row).not.toHaveAttribute("open", "");
    await expect(row.locator(".accordion-body")).toBeHidden();

    await row.locator("summary").click();
    await expect(row).toHaveAttribute("open", "");
    await expect(row.locator(".accordion-body")).toBeVisible();
  });

  test("opening a row collapses a previously open row in the same section", async ({
    page,
  }) => {
    const rows = page.locator("details.accordion-item[name='tools-accordion']");
    const first = rows.nth(0);
    const second = rows.nth(1);

    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", "");

    await second.locator("summary").click();
    await expect(second).toHaveAttribute("open", "");
    await expect(first).not.toHaveAttribute("open", "");
  });
});

test.describe("Tech stack tree", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tech-stack");
  });

  test("drilling into group > leaf reveals a glossary summary and working link", async ({
    page,
  }) => {
    const category = page.locator(".tri-item", { hasText: "Automation & IaC" });
    const detail = category.locator("xpath=following-sibling::div[1]");

    const group = detail.locator("details.accordion-item--group", {
      hasText: "Configuration & testing",
    });
    await group.locator("summary").first().click();

    const leaf = group.locator("details.accordion-item--leaf", { hasText: "Ansible" }).first();
    await leaf.locator("summary").click();

    const body = leaf.locator(".accordion-body");
    await expect(body).toBeVisible();
    expect((await body.innerText()).length).toBeGreaterThan(10);
    await expect(body.getByRole("link", { name: /open full page/i })).toHaveAttribute(
      "href",
      "/glossary/ansible/",
    );
  });

  test("a leaf without a glossary page renders as plain text, not an expandable row", async ({
    page,
  }) => {
    const category = page.locator(".tri-item", { hasText: "Automation & IaC" });
    const detail = category.locator("xpath=following-sibling::div[1]");

    const group = detail.locator("details.accordion-item--group", {
      hasText: "Provisioning",
    });
    await group.locator("summary").first().click();

    const plainLeaf = group.locator(".stack-leaf-plain", { hasText: "Packer" });
    await expect(plainLeaf).toBeVisible();
    expect(await plainLeaf.evaluate((el) => el.tagName)).toBe("DIV");
  });
});

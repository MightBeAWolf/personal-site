import { test, expect } from "@playwright/test";

test("renders the expected sections", async ({ page }) => {
  await page.goto("/tech-stack");
  const headings = await page.getByRole("heading", { level: 2 }).allTextContents();
  for (const expected of ["Tools", "Workflows", "Tech stack", "Colophon"]) {
    expect(headings.some((h) => h.includes(expected))).toBe(true);
  }
});

test.describe("Tools / Workflows sub-articles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tech-stack");
  });

  test("an article is collapsed until its summary is clicked", async ({ page }) => {
    const row = page.locator("details.accordion-item").first();
    await expect(row).not.toHaveAttribute("open", "");
    await expect(row.locator(".accordion-body")).toBeHidden();

    await row.locator("summary").click();
    await expect(row).toHaveAttribute("open", "");
    await expect(row.locator(".accordion-body")).toBeVisible();
  });

  test("opening one article under an item collapses another under the same item", async ({
    page,
  }) => {
    // Editor has two sub-articles (In Terminal, VS Code) sharing one
    // per-item accordion name, so they're mutually exclusive with each
    // other but independent of any other item's own articles.
    //
    // Filtered by the <summary>'s own text, not the whole <details> - once
    // "In Terminal" is open its body text is in the DOM too, and it happens
    // to mention "VS Code" in passing, so filtering on the whole subtree's
    // text would match both articles once "In Terminal" is expanded.
    const articles = page.locator("details.accordion-item[name='tools-editor-accordion']");
    const inTerminal = articles.filter({ has: page.locator("summary", { hasText: "In Terminal" }) });
    const vsCode = articles.filter({ has: page.locator("summary", { hasText: "VS Code" }) });

    await inTerminal.locator("summary").click();
    await expect(inTerminal).toHaveAttribute("open", "");

    await vsCode.locator("summary").click();
    await expect(vsCode).toHaveAttribute("open", "");
    await expect(inTerminal).not.toHaveAttribute("open", "");
  });

  test("an item with no sub-articles yet shows no expand affordance at all", async ({
    page,
  }) => {
    const row = page.locator(".tri-item", { hasText: "Secrets" });
    const slot = row.locator("xpath=following-sibling::div[1]");
    await expect(slot).toHaveClass(/tri-slot-empty/);
    await expect(slot.locator("details")).toHaveCount(0);
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

    const body = leaf.locator(".accordion-body").first();
    await expect(body).toBeVisible();
    expect((await body.innerText()).length).toBeGreaterThan(10);
    await expect(body.getByRole("link", { name: /open full page/i })).toHaveAttribute(
      "href",
      "/glossary/ansible/",
    );
  });

  test("a leaf without a glossary page or articles renders as plain text, not an expandable row", async ({
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

  test("a leaf's own sub-article nests inside its glossary summary", async ({ page }) => {
    const category = page.locator(".tri-item", { hasText: "Cloud & platform" });
    const detail = category.locator("xpath=following-sibling::div[1]");

    const group = detail.locator("details.accordion-item--group", {
      hasText: "Kubernetes ecosystem",
    });
    await group.locator("summary").first().click();

    const leaf = group.locator("details.accordion-item--leaf", { hasText: "Podman" }).first();
    await leaf.locator("summary").first().click();

    // the glossary blurb is still there...
    await expect(leaf.getByRole("link", { name: /open full page/i })).toHaveAttribute(
      "href",
      "/glossary/podman/",
    );

    // ...alongside the leaf's own nested article, independently collapsed
    const article = leaf.locator("details.accordion-item--article", {
      hasText: "Podman over Docker",
    });
    await expect(article).toBeVisible();
    await expect(article.locator(".accordion-body")).toBeHidden();

    await article.locator("summary").click();
    await expect(article.locator(".accordion-body")).toBeVisible();
  });
});

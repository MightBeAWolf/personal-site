import { defineConfig, devices } from "@playwright/test";

// Runs against a production build (`astro build` + `astro preview`), not the
// dev server, so the suite exercises what actually ships. Invoked via
// `mise run test:e2e`, which builds first and starts this inside the official
// Playwright container image - see CLAUDE.md.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Pin the OS preference the theme system reads on a first visit
    // (BaseLayout falls back to a light default theme otherwise) so specs
    // are deterministic regardless of the runner's own defaults.
    colorScheme: "dark",
  },

  // Chromium only for now (see plan); a mobile viewport project covers the
  // site's real breakpoint-specific behavior (nav wrap, picker bottom sheet)
  // without adding another browser engine.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],

  // `astro build` runs separately (before `playwright test`) inside the
  // container command; this only boots the static preview server.
  //
  // `--ignore-lock`: astro's preview command tracks a PID lock under
  // `.astro/` so it can refuse to double-start. That directory lives in the
  // bind-mounted `site/` tree (unlike node_modules, which is masked by an
  // anonymous volume), so a lock written by one `--rm` container run
  // survives to the next one even though the process it named is long gone.
  // `--force` *looks* like the fix (astro's own error message suggests it),
  // but in this astro version it's dead: the preview CLI reads `flags.force`
  // only to throw if it's combined with `--ignore-lock` - the actual
  // "existing server" check a few lines later never consults it, so passing
  // `--force` alone silently does nothing and the stale-lock error still
  // fires. `--ignore-lock` is the flag that actually skips the check.
  webServer: {
    command: "npm run preview -- --host 0.0.0.0 --port 4321 --ignore-lock",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});

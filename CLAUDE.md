# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal website for salishseawolf.com. The actual site is a minimal Astro project in `site/`; the repository root is a mise + Podman toolchain that builds and runs that site as a container in either `development` or `production` mode.

## Layout

- `site/` — the Astro app. Pages live in `site/src/pages/` (`.astro` and `.md` files map to routes by filename). `site/src/pages/resume.md` renders the resume.
- `site/e2e/` — Playwright end-to-end specs, configured by `site/playwright.config.ts`. Assert on structure/ARIA/attributes, not marketing copy, which changes often.
- `mise.toml` — task runner, tool pinning, and env defaults for the whole build/run workflow.
- `Containerfile.j2` — Jinja source for the container image. `Containerfile` is **generated** and git-ignored; never edit it directly.
- `fnox.toml` — secret provider config (fnox: 1Password vault `Personal` + age). Secrets are injected via mise env, not committed.
- `.helix/languages.toml` — Helix editor config wiring `astro-ls` to `site/node_modules`.

## Commands

Run mise tasks from the repo root. `MODE` (default `development`) selects the build variant and is validated against `development` | `production`.

- `mise run setup` — `npm ci` in `site/` (needed for the editor language server; the container installs its own deps).
- `mise run build` (alias for `podman:build`) — render Containerfile, lint it, build `IMAGE_NAME:MODE`. Pass extra tags as args.
- `mise run start` (alias for `podman:start`) — build then run. Dev mode bind-mounts `site/` into the container with live reload; production mode builds static output and serves it via nginx. Served on `http://127.0.0.1:62441`.
- `mise run shell` — open a bash shell in the built image.
- `mise run mode` — print the resolved `MODE` and image name.
- `mise run clean` — delete the generated `Containerfile`.
- `MODE=production mise run start` — run the production (nginx static) variant.
- `mise run test:e2e` (alias `test`) — builds the site and runs the Playwright suite (`site/e2e/`) inside the official Playwright container image; no host Playwright/browser install needed. Keep the image tag pinned in this task's `mise.toml` entry in lockstep with `site/package.json`'s `@playwright/test` version.

Inside `site/` the standard Astro scripts also work: `npm run dev` (port 4321), `npm run build` (to `site/dist/`), `npm run preview`. (`astro check` is not available — no `@astrojs/check` dependency.)

## How the build works

`jinja:Containerfile` renders `Containerfile.j2` with `mode`. It writes only when content changed, keeping mtime stable so mise's `sources`/`outputs` freshness checks still cache downstream tasks. `check:Containerfile` runs `hadolint` on the result. `podman:build` depends on `setup` + `check:*`; `podman:start` and `podman:interactive` depend on `podman:build`. Changing `MODE` is not a file change, so if a task seems stale after switching modes, the render step handles it by rewriting the file.

- **development**: single-stage `node:26` image, `npm install`, runs `astro dev --host 0.0.0.0` on container port 4321. `podman:start` bind-mounts the host `site/` and keeps `node_modules` as an anonymous volume, with `keep-id` userns mapping.
- **production**: `node:26` build stage runs `npm ci && astro build`, then a second `nginx` stage serves `/site/dist` on port 80.

## Notes

- Node 26 is the single supported version: `mise.toml` pins `node = "v26"`, `Containerfile.j2` pins `node:26.8.2-trixie`, and `site/package.json` `engines` requires `>=26.0.0`. Keep these in sync when bumping.
- Astro telemetry is disabled during image builds.

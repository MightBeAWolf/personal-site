# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal website for salishseawolf.com. The actual site is a minimal Astro project in `site/`; the repository root is a mise + Podman toolchain that builds and runs that site as a container in either `development` or `production` mode.

## Layout

- `site/` — the Astro app. Pages live in `site/src/pages/` (`.astro` and `.md` files map to routes by filename). `site/src/pages/resume.md` renders the resume.
- `site/e2e/` — Playwright end-to-end specs, configured by `site/playwright.config.ts`. Assert on structure/ARIA/attributes, not marketing copy, which changes often.
- `site/src/content/glossary/*.md` — one file per hover-glossary term (frontmatter: `title`, `summary`, optional `link`, optional `aliases` list). Each entry renders two ways from one source: a dedicated page at `/glossary/<slug>` (`site/src/pages/glossary/[slug].astro`) and, fetched and its `#glossary-content` extracted, inside a hover popup (`site/src/components/GlossaryPopup.astro`). `title`/`aliases` are matched by `site/src/lib/glossary-link.ts` (`linkGlossaryTerms()`) to decide which words become triggers — drop a new file in to add a term, nothing else needs to change. Used against hand-authored copy in `tech-stack.astro`, and against a whole rendered markdown page's slot content in `site/src/layouts/MarkdownPage.astro` (`Astro.slots.render("default")` piped through it before `set:html`) — that's how `/resume` gets hover terms without `resume.md` itself containing any glossary markup.
- `site/src/data/practices.ts` + `site/src/data/tech-stack.ts` — the structural data behind `/tech-stack`'s three-column layout (category label | sub-item + description | accordion detail): `practices.ts` exports plain `{ title, teaser }[]` arrays for Tools/Workflows; `tech-stack.ts` exports a `StackCategory[]` tree (Category → Group → Leaf) for the Tech-stack section, where a leaf's optional `glossaryId` must match a real `glossary` entry id (`tech-stack.astro` reuses that entry's summary/link instead of duplicating it). Both are plain TS modules, not content collections — structural labels/cross-refs, not prose.
- `site/src/content/articles/**/*.md` — narrative sub-articles for column 3 ("why Podman over Docker", not "what is Podman" — that's the glossary's job). A file's own **path** ties it to its parent, matched by prefix in `tech-stack.astro` against `slugify()` of the parent's title/label — no frontmatter field names the parent: `tools/<item-slug>/*.md`, `workflows/<item-slug>/*.md`, `stack/<category-slug>/<group-slug>/<leaf-slug>/*.md`. An item/leaf with matching articles gets one accordion per article (titled from frontmatter `title`); zero matches renders no expand affordance at all, same philosophy as a plain (non-glossary) Tech-stack leaf.
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
- Markup created or injected at runtime (`document.createElement`, `innerHTML`, or HTML fetched from another page) needs genuinely global CSS, not Astro's default scoped `data-astro-cid-*` styles: scoped selectors never match runtime-created nodes, and a scoped stylesheet only ships on the page that defines it — not wherever the markup actually ends up rendered (e.g. a popup that injects another page's content). See `ThemePicker.astro`'s `<style is:global>` and the `.glossary-term`/`.glossary-body` rules in `global.css`.
- `backdrop-filter`/`filter`/`transform` on an ancestor makes it the containing block for `position: fixed` descendants — and, separately, the clipping boundary floating-ui measures against for `flip`/`shift`/`size` — instead of the viewport. Bit both the mobile theme-picker sheet (fixed under `Header.astro`, worked around with a `::before` pseudo-element instead of the filter living on the header itself) and nested glossary popups (worked around by passing `boundary: document.body` to floating-ui). Keep such ancestors free of those properties, or route around them explicitly.
- A CSS comment containing markdown-style emphasis around a word immediately followed by a slash (e.g. `*inline*/horizontal`) forms a literal `*/`, closing the comment early. Astro's compiler then silently drops whatever declarations follow with no build error — it just quietly stops doing anything, which is exactly the kind of bug that only turns up as "this property mysteriously has no effect" much later. Keep `*` and `/` apart in style-block comments (or skip markdown-style emphasis in them).
- A percentage `height` (or `width`) on a CSS Grid item spanning multiple `auto`-sized tracks is circular — the tracks are supposed to size to their content, but the item's height depends on the tracks being sized first — and can inflate track sizes well past what the actual content needs. `align-self: stretch` (resolved after track sizing) is the item-fills-its-area behavior that pattern is usually reaching for; it doesn't have the same circularity. Bit `tech-stack.astro`'s sticky column-1 category label, spanning all of a section's rows.
- An explicit `grid-column`/`grid-row` on a grid item forces the browser to implicitly generate whatever tracks are needed to satisfy it, regardless of the parent's `grid-template-columns`/`-rows` — so "collapse to one column at narrow widths" needs more than just changing the template if children still carry explicit placement (doubly so if any of it's set via an inline `style`, which a stylesheet rule can't override without `!important`). Simplest fix: drop `display: grid` entirely at that breakpoint so all placement becomes inert. Bit `tech-stack.astro`'s mobile fallback.

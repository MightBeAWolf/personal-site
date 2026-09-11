---
title: Playwright
summary: A browser automation framework for end-to-end testing across Chromium, Firefox, and WebKit.
link: https://playwright.dev/
---

Playwright drives a real browser to click, type, and assert against a site
the way a person would, rather than testing in isolation — the closest a
test suite gets to "did this actually work" without a human in the loop.

This site's own e2e suite is built on it: a Playwright container runs
against a production build of the site itself, covering navigation, the
responsive layout, and every interaction on this glossary popup system.

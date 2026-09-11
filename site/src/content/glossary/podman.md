---
title: Podman
summary: A rootless, daemonless container engine, compatible with Docker CLI and images.
link: https://podman.io/
---

Podman runs OCI containers without a background daemon and without
requiring root, using the same image format and a largely Docker-compatible
CLI. Running rootless removes an entire class of container-escape risk that
a always-on, typically-root daemon carries.

This site's own build/run/test workflow is Podman end to end: `mise run
build` and `mise run start` build and run the site's container image, and
`mise run test:e2e` runs the Playwright suite inside the official Playwright
container image — no Docker installation involved anywhere.

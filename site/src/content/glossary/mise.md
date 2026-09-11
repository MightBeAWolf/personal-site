---
title: mise
summary: A tool version manager and task runner that pins languages, tools, and tasks per project.
link: https://mise.jdx.dev/
---

mise (short for "mise en place") pins the exact language and tool versions
a project needs in a single `mise.toml`, and doubles as a task runner for
whatever build/run/test commands that project defines — one tool instead of
a separate version manager per language plus a separate Makefile-equivalent.

This site is a working example: its `mise.toml` pins Node, fnox, age, and
hadolint, and defines the tasks (`mise run build`, `mise run start`,
`mise run test:e2e`, …) that drive its whole build/run/test workflow.

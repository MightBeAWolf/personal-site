---
title: From GNU Make to mise-en-place
order: 1
---

# From Make to mise-en-place.

For years, Make was just what I reached for. It's already installed
everywhere, `make build` / `make test` / `make deploy` targets are a
convention most people already know, and PHONY targets are good enough as
a task runner for most things.

What Make never did was touch tool versions. A Makefile could run
`node build.js`, but it had no opinion about which `node`. That lived
somewhere else entirely: nvm for Node, pyenv for Python, rbenv for Ruby,
each pinned by its own dotfile, in its own format, read by its own shell
hook. The Makefile and the version manager never actually talked to each
other. It worked, right up until it didn't, a fresh clone with the wrong
global version quietly running the wrong thing before anyone noticed.

mise is what finally closed that gap, and the name is the whole pitch:
mise en place, everything in its place before you start cooking. One file
pins the tool versions a project needs and defines the tasks that build,
run, and test it, so the two things Make and a version manager used to
handle separately, and inconsistently, live in the same place and get read
the same way.

This site is the plainest example: `mise.toml` pins Node, fnox, age, and
hadolint, and `mise run build`, `mise run start`, and `mise run test:e2e`
are the entire interface to building, running, and testing it. A fresh
checkout, on any machine, gets the right versions automatically instead of
"works on my machine." Bigger infrastructure gets exactly the same
treatment, not a special case just because the project is larger.

I still respect Make for what it actually is. I just don't reach for it as
a task runner anymore, now that there's a tool that also handles the half
of the problem Make was never built to solve.

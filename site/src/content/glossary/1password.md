---
title: 1Password
summary: A password manager used here as the source of truth for secrets, injected into environments rather than committed.
link: https://1password.com/
---

Beyond personal password storage, 1Password's CLI/service-account tooling
lets a pipeline or a local shell pull a secret at runtime instead of a
developer ever writing one into a config file or a commit.

This site's `fnox.toml` points at a 1Password vault as its default secret
provider (with age as a local-cache fallback), so it never needs a `.env`
file full of real credentials to build and run.

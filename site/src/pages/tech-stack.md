---
layout: ../layouts/MarkdownPage.astro
title: Tools, Workflows, and My Tech Stack
description: "The editor, workflows, and technologies Thomas G. Wolf builds and operates with — from Helix and mise to Kubernetes, GitOps, and RAG pipelines."
updated: September 2026
---

# Tools, Workflows, and My Tech Stack

How I actually work: the tools on my machine, the workflows I lean on, and the
technologies I reach for when building and operating systems. I run most of this
as a single operator, so it is all biased toward reproducibility, automation, and
keeping the blast radius small.

---

## Tools

- **Editor** — [Helix](https://helix-editor.com/). Modal, no plugin system, LSP
  and tree-sitter built in. The theme picker on this site is generated from every
  one of its bundled themes.
- **Runtime & tasks** — [mise](https://mise.jdx.dev/) to pin language and tool
  versions per project and to drive per-repo task runners and environment.
- **Containers** — Podman, rootless and daemonless.
- **AI pair** — Claude Code and OpenCode for day-to-day engineering; purpose-built
  agent harnesses where a workflow needs one.
- **Secrets** — 1Password as the source of truth, injected into environments at
  runtime (via `fnox` + `age` here) and never committed.
- **Shell & OS** — bash and Linux everywhere, a laptop managed the same way as a
  node in a cluster.

## Workflows

- **Infrastructure as code** — Ansible for configuration, Terraform / OpenTofu for
  provisioning, Packer and cloud-init for images. If it is not in a repo, it is
  not real.
- **GitOps** — Argo CD reconciles cluster state from Git; CI/CD runs in Gitea
  Actions on a self-hosted forge.
- **Reproducible builds** — projects declare their toolchain and build in
  containers, so a checkout is enough to build and run. This site is a small
  example: one `mise run start` renders a Containerfile and serves the app.
- **Observability first** — Grafana, Loki, and Prometheus (with Grafana Alloy) go
  in early, not after something breaks; Gatus and ntfy cover health and alerting.
- **Compliance as a constraint** — NIST 800-171 / CMMC 2.0 requirements shape the
  architecture from the start rather than being bolted on.

## Tech stack

- **AI infrastructure:** RAG pipelines, autonomous agents, agent sandboxing, MCP
  tool integration, Claude Code, OpenCode, Hermes Agent, containerized job
  orchestration, Open WebUI
- **Application & solution architecture:** API design, service decomposition,
  integration patterns, monolith-to-modular modernization, workflow-oriented
  applications, system design for scale, design review and architecture
  standards
- **Languages:** Python, TypeScript, Bash, C, C++, C#, Rust, Java, Lisp, TCL
- **Cloud & platform:** AWS, Azure, Hetzner Cloud, Proxmox, QEMU, Kubernetes and
  K3s (including greenfield buildouts), Helm, Docker, Podman, Traefik, Apache
  Guacamole, Bind9, Cloudflare, systemd
- **Automation & IaC:** Ansible, Ansible Molecule, Terraform / OpenTofu, Packer,
  cloud-init, mise, Argo CD, Gitea Actions, Playwright
- **Observability:** Grafana, Loki, Graylog, Prometheus, Grafana Alloy, InfluxDB,
  Gatus, ntfy
- **Identity, endpoint & PKI:** Active Directory, Microsoft Intune, Authentik SSO
  with enforced MFA and forward-auth, OpenLDAP, SSSD, step-ca private CA,
  cert-manager, Certbot / Let's Encrypt, 1Password
- **Data & storage:** PostgreSQL, CloudNativePG, Redis, SeaweedFS, Gitea, n8n
- **Security & compliance:** NIST 800-171, CMMC 2.0 (Levels 2–3), Kubernetes
  hardening (Pod Security Admission, audit policy, etcd encryption at rest),
  fail2ban, firewalld / UFW, WireGuard
- **Delivery & collaboration:** Jira, Confluence, Slack, Teams

---

## Colophon

This site is a static [Astro](https://astro.build) build, served as a container in
development or via nginx in production, all driven by mise tasks. The editor
config wires [`astro-ls`](https://github.com/withastro/language-tools) into Helix,
and the theme system is generated from the
[Helix](https://github.com/helix-editor/helix) project's bundled themes.

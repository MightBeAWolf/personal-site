/**
 * The Tools/Workflows rows on /tech-stack. `teaser` is a one-line
 * introduction, always shown in column 2 - not a definition (that's the
 * glossary's job) and not the expanded content either. Column 3's actual
 * content is narrative sub-articles, sourced from the `articles` content
 * collection and matched to an item by path
 * (site/src/content/articles/tools/<slugify(title)>/*.md) rather than
 * anything stored here - see tech-stack.astro and content.config.ts.
 */

export interface PracticeItem {
  title: string;
  teaser: string;
}

export const tools: PracticeItem[] = [
  {
    title: "Editor",
    teaser:
      "Helix. Modal, no plugin system, LSP and tree-sitter built in. The theme picker on this site is generated from every one of its bundled themes.",
  },
  {
    title: "Runtime & tasks",
    teaser:
      "mise to pin language and tool versions per project and to drive per-repo task runners and environment.",
  },
  {
    title: "Containers",
    teaser: "Podman, rootless and daemonless.",
  },
  {
    title: "AI pair",
    teaser:
      "Claude Code and OpenCode for day-to-day engineering; purpose-built agent harnesses where a workflow needs one.",
  },
  {
    title: "Secrets",
    teaser:
      "1Password as the source of truth, injected into environments at runtime (via <code>fnox</code> + <code>age</code> here) and never committed.",
  },
  {
    title: "Shell & OS",
    teaser:
      "bash and Linux everywhere, a laptop managed the same way as a node in a cluster.",
  },
];

export const workflows: PracticeItem[] = [
  {
    title: "Infrastructure as code",
    teaser:
      "Ansible for configuration, Terraform / OpenTofu for provisioning, Packer and cloud-init for images. If it is not in a repo, it is not real.",
  },
  {
    title: "GitOps",
    teaser:
      "Argo CD reconciles cluster state from Git; CI/CD runs in Gitea Actions on a self-hosted forge.",
  },
  {
    title: "Reproducible builds",
    teaser:
      "Projects declare their toolchain and build in containers, so a checkout is enough to build and run. This site is a small example: one <code>mise run start</code> renders a Containerfile and serves the app.",
  },
  {
    title: "Observability first",
    teaser:
      "Grafana, Loki, and Prometheus (with Grafana Alloy) go in early, not after something breaks; Gatus and ntfy cover health and alerting. Umami to understand how visitors interact with my sites.",
  },
  {
    title: "Compliance as a constraint",
    teaser:
      "NIST 800-171 / CMMC 2.0 requirements shape the architecture from the start rather than being bolted on.",
  },
];
